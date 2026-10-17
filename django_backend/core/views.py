from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.core.exceptions import PermissionDenied
from django.db import IntegrityError
from django.db.models import Q
from django.http import Http404
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView, View

from .forms import make_form, new_pk, stamp
from .models import HamyariPost, Listing, ListingReport, Member
from .moderation import (
    approve_hamyari, approve_listing, hamyari_media, hide_hamyari, hide_listing, ladder_listing,
    listing_attributes, listing_media, reject_hamyari, reject_listing, set_member_verified,
)
from .registry import SPECS, SPEC_BY_SLUG


class PanelMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and not request.user.is_staff:
            raise PermissionDenied('فقط مدیر به این بخش دسترسی دارد.')
        return super().dispatch(request, *args, **kwargs)


class PanelLoginView(LoginView):
    template_name = 'core/login.html'
    redirect_authenticated_user = True


class PanelLogoutView(LogoutView):
    pass


def read(obj, name):
    try:
        return getattr(obj, name)
    except Exception:
        return None


def show(value, limit=90):
    if value is None or value == '':
        return '—'
    if isinstance(value, bool):
        return 'بله' if value else 'خیر'
    text = str(value).replace('\n', ' ')
    if limit and len(text) > limit:
        return text[: limit - 1] + '…'
    return text


def detail_url(spec, obj):
    if spec.composite:
        key_a, key_b = spec.composite
        return reverse(f'{spec.slug}-detail', kwargs={
            'key_a': getattr(obj, key_a),
            'key_b': getattr(obj, key_b),
        })
    return reverse(f'{spec.slug}-detail', kwargs={'pk': obj.pk})


def edit_url(spec, obj):
    if spec.composite:
        key_a, key_b = spec.composite
        return reverse(f'{spec.slug}-edit', kwargs={
            'key_a': getattr(obj, key_a),
            'key_b': getattr(obj, key_b),
        })
    return reverse(f'{spec.slug}-edit', kwargs={'pk': obj.pk})


def delete_url(spec, obj):
    if spec.composite:
        key_a, key_b = spec.composite
        return reverse(f'{spec.slug}-delete', kwargs={
            'key_a': getattr(obj, key_a),
            'key_b': getattr(obj, key_b),
        })
    return reverse(f'{spec.slug}-delete', kwargs={'pk': obj.pk})


class SpecMixin(PanelMixin):
    spec = None

    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.model = self.spec.model

    def lookup(self):
        if self.spec.composite:
            key_a, key_b = self.spec.composite
            return {key_a: self.kwargs['key_a'], key_b: self.kwargs['key_b']}
        return {'pk': self.kwargs['pk']}

    def get_object(self, queryset=None):
        qs = queryset if queryset is not None else self.get_queryset()
        try:
            return qs.get(**self.lookup())
        except self.model.DoesNotExist as exc:
            raise Http404('رکورد پیدا نشد') from exc

    def page_context(self):
        return {
            'spec': self.spec,
            'page_title': self.spec.title,
        }


class ModerationView(PanelMixin, TemplateView):
    template_name = 'core/moderation.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['page_title'] = 'میز کار ادمین'
        base = Listing.objects.select_related('user')
        pending = base.filter(status='pending').order_by('-id')
        live = base.filter(status='active').order_by('-is_pro', '-id')
        rejected = base.filter(status='rejected').order_by('-id')
        deleted = base.filter(status='deleted').order_by('-id')
        ctx['counts'] = {
            'pending': pending.count(),
            'active': live.count(),
            'rejected': rejected.count(),
            'deleted': deleted.count(),
        }
        ctx['pending'] = pending[:50]
        ctx['live'] = live[:50]
        ctx['rejected'] = rejected[:50]
        ctx['deleted'] = deleted[:50]
        ctx['reports'] = ListingReport.objects.filter(status='open').select_related('listing', 'user')[:40]
        ctx['unverified'] = Member.objects.filter(verified=False).order_by('-id')[:40]

        hbase = HamyariPost.objects.select_related('user')
        h_pending = hbase.filter(status='pending').order_by('-created_at')
        h_live = hbase.filter(status='active').order_by('-created_at')
        h_rejected = hbase.filter(status='rejected').order_by('-created_at')
        ctx['hamyari_counts'] = {
            'pending': h_pending.count(),
            'active': h_live.count(),
            'rejected': h_rejected.count(),
        }
        ctx['hamyari_pending'] = list(h_pending[:50])
        ctx['hamyari_live'] = list(h_live[:40])
        ctx['hamyari_rejected'] = list(h_rejected[:40])
        return ctx


class HamyariModerationView(PanelMixin, TemplateView):
    """Dedicated admin desk for Mutual Aid ads — same flow as listing moderation."""
    template_name = 'core/hamyari_moderation.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['page_title'] = 'آگهی‌های همیاری'
        base = HamyariPost.objects.select_related('user')
        pending = base.filter(status='pending').order_by('-created_at')
        live = base.filter(status='active').order_by('-created_at')
        rejected = base.filter(status='rejected').order_by('-created_at')
        deleted = base.filter(status='deleted').order_by('-created_at')
        ctx['counts'] = {
            'pending': pending.count(),
            'active': live.count(),
            'rejected': rejected.count(),
            'deleted': deleted.count(),
            'all': base.count(),
        }
        ctx['pending'] = list(pending[:50])
        ctx['live'] = list(live[:50])
        ctx['rejected'] = list(rejected[:50])
        ctx['deleted'] = list(deleted[:50])
        for collection in (ctx['pending'], ctx['live'], ctx['rejected'], ctx['deleted']):
            for row in collection:
                media = hamyari_media(row)
                row.preview = media[0] if media else None
        return ctx


class ModerationActionView(PanelMixin, View):
    def post(self, request):
        kind = request.POST.get('kind')
        op = request.POST.get('op')
        pk = request.POST.get('id')
        try:
            if kind == 'listing':
                listing = Listing.objects.get(pk=pk)
                if op == 'approve':
                    approve_listing(listing)
                    messages.success(request, f'«{listing.title}» تأیید شد.')
                elif op == 'ladder':
                    ladder_listing(listing)
                    messages.success(request, f'«{listing.title}» نردبان شد و در آگهی‌های ویژه بالا رفت.')
                elif op == 'reject':
                    reject_listing(listing)
                    messages.success(request, f'«{listing.title}» تأیید نشد و منتشر نمی‌شود.')
                elif op == 'delete':
                    hide_listing(listing)
                    messages.success(request, f'«{listing.title}» حذف شد.')
            elif kind == 'hamyari':
                post = HamyariPost.objects.get(pk=pk)
                label = post.title or (post.body or '')[:40]
                if op == 'approve':
                    approve_hamyari(post)
                    messages.success(request, f'همیاری «{label}» تأیید و منتشر شد.')
                elif op == 'reject':
                    reject_hamyari(post)
                    messages.success(request, f'همیاری «{label}» تأیید نشد.')
                elif op == 'delete':
                    hide_hamyari(post)
                    messages.success(request, f'همیاری «{label}» حذف شد.')
            elif kind == 'report':
                report = ListingReport.objects.select_related('listing').get(pk=pk)
                if op == 'close':
                    report.status = 'closed'
                    report.save(update_fields=['status'])
                    messages.success(request, 'گزارش بسته شد.')
                elif op == 'delete' and report.listing_id:
                    hide_listing(report.listing)
                    report.status = 'closed'
                    report.save(update_fields=['status'])
                    messages.success(request, 'آگهی گزارش‌شده حذف شد.')
                elif op == 'approve' and report.listing_id:
                    approve_listing(report.listing)
                    report.status = 'closed'
                    report.save(update_fields=['status'])
                    messages.success(request, 'آگهی تأیید شد و گزارش بسته شد.')
            elif kind == 'member':
                member = Member.objects.get(pk=pk)
                set_member_verified(member, op != 'unverify')
                messages.success(request, f'{member} {"تأیید شد" if op != "unverify" else "از تأیید خارج شد"}.')
        except (Listing.DoesNotExist, ListingReport.DoesNotExist, Member.DoesNotExist, HamyariPost.DoesNotExist):
            messages.error(request, 'رکورد پیدا نشد.')
        nxt = request.POST.get('next') or (
            '/manage/moderation/hamyari/' if kind == 'hamyari' else '/manage/moderation/'
        )
        if not str(nxt).startswith('/manage/'):
            nxt = '/manage/moderation/hamyari/' if kind == 'hamyari' else '/manage/moderation/'
        return redirect(nxt)


class DashboardView(PanelMixin, TemplateView):
    template_name = 'core/dashboard.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        cards = []
        for spec in SPECS:
            try:
                count = spec.model.objects.count()
            except Exception:
                count = '—'
            cards.append({'spec': spec, 'count': count, 'url': reverse(f'{spec.slug}-list')})
        ctx['cards'] = cards
        ctx['page_title'] = 'داشبورد'
        return ctx


LISTING_STATUS_TABS = (
    ('pending', 'در انتظار تأیید'),
    ('active', 'منتشر شده'),
    ('rejected', 'تأیید نشده'),
    ('deleted', 'حذف شده'),
    ('all', 'همه'),
)

HAMYARI_STATUS_TABS = (
    ('pending', 'در انتظار تأیید'),
    ('active', 'منتشر شده'),
    ('rejected', 'تأیید نشده'),
    ('deleted', 'حذف شده'),
    ('all', 'همه'),
)


class PanelListView(SpecMixin, ListView):
    template_name = 'core/object_list.html'
    context_object_name = 'objects'
    paginate_by = 30

    def moderated_status(self):
        if self.spec.slug == 'listings':
            tabs = LISTING_STATUS_TABS
            default = 'pending'
        elif self.spec.slug == 'hamyari-posts':
            tabs = HAMYARI_STATUS_TABS
            default = 'pending'
        else:
            return None
        status = self.request.GET.get('status', default).strip()
        allowed = {key for key, _label in tabs}
        return status if status in allowed else default

    def listing_status(self):
        # backward-compatible alias
        if self.spec.slug != 'listings':
            return None
        return self.moderated_status()

    def get_queryset(self):
        qs = self.model.objects.all()
        related = [
            field.name for field in self.model._meta.fields
            if getattr(field, 'is_relation', False) and (field.many_to_one or field.one_to_one)
        ]
        if related:
            qs = qs.select_related(*related)
        status = self.moderated_status()
        if status and status != 'all':
            qs = qs.filter(status=status)
        query = self.request.GET.get('q', '').strip()
        if query and self.spec.search_fields:
            cond = Q()
            for name in self.spec.search_fields:
                cond |= Q(**{f'{name}__icontains': query})
            qs = qs.filter(cond)
        if self.spec.slug == 'listings':
            qs = qs.order_by('-id')
        elif self.spec.slug == 'hamyari-posts':
            qs = qs.order_by('-created_at')
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.page_context())
        ctx['q'] = self.request.GET.get('q', '').strip()
        ctx['columns'] = self.spec.columns
        ctx['create_url'] = reverse(f'{self.spec.slug}-create')
        status = self.moderated_status()
        if status is not None:
            tabs = LISTING_STATUS_TABS if self.spec.slug == 'listings' else HAMYARI_STATUS_TABS
            list_name = 'listings-list' if self.spec.slug == 'listings' else 'hamyari-posts-list'
            counts = {
                key: (
                    self.model.objects.count()
                    if key == 'all'
                    else self.model.objects.filter(status=key).count()
                )
                for key, _label in tabs
            }
            ctx['status_tabs'] = [
                {
                    'key': key,
                    'label': label,
                    'count': counts[key],
                    'url': f"{reverse(list_name)}?status={key}" + (f"&q={ctx['q']}" if ctx['q'] else ''),
                    'active': key == status,
                }
                for key, label in tabs
            ]
            ctx['status'] = status
        rows = []
        for obj in ctx['objects']:
            try:
                title = show(obj, 70)
            except Exception:
                title = show(obj.pk, 70)
            rows.append({
                'url': detail_url(self.spec, obj),
                'title': title,
                'cells': [show(read(obj, name)) for name, _label in self.spec.columns],
                'obj': obj,
            })
        ctx['rows'] = rows
        ctx['is_listings'] = self.spec.slug == 'listings'
        ctx['is_hamyari'] = self.spec.slug == 'hamyari-posts'
        ctx['moderate_kind'] = (
            'listing' if self.spec.slug == 'listings'
            else 'hamyari' if self.spec.slug == 'hamyari-posts'
            else ''
        )
        return ctx


class PanelDetailView(SpecMixin, DetailView):
    template_name = 'core/object_detail.html'
    context_object_name = 'obj'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.page_context())
        obj = ctx['obj']
        rows = []
        skip = {'image', 'images_json', 'seller_avatar', 'attributes_json'} if self.spec.slug == 'listings' else set()
        for field in obj._meta.fields:
            if field.__class__.__name__ == 'CompositePrimaryKey' or field.name in skip:
                continue
            rows.append((field.verbose_name, show(read(obj, field.name), limit=0)))
        ctx['field_rows'] = rows
        if self.spec.slug == 'listings':
            ctx['media'] = listing_media(obj)
            ctx['attrs'] = list(listing_attributes(obj).items())
            ctx['is_listing'] = True
        if self.spec.slug == 'hamyari-posts':
            ctx['is_hamyari'] = True
            ctx['media'] = hamyari_media(obj)
        ctx['edit_url'] = edit_url(self.spec, obj)
        ctx['delete_url'] = delete_url(self.spec, obj)
        ctx['list_url'] = reverse(f'{self.spec.slug}-list')
        return ctx


class PanelWriteMixin(SpecMixin):
    template_name = 'core/object_form.html'

    def get_form_class(self):
        return make_form(self.spec)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.page_context())
        ctx['list_url'] = reverse(f'{self.spec.slug}-list')
        obj = ctx.get('object') or getattr(self, 'object', None)
        if self.spec.slug == 'listings' and obj is not None and getattr(obj, 'pk', None):
            ctx['media'] = listing_media(obj)
            ctx['is_listing'] = True
        return ctx

    def save_object(self, form):
        self.object = form.save(commit=False)
        if self.spec.slug in ('listings', 'hamyari-posts') and not self.object.pk:
            self.object.status = 'pending'
        if self.spec.slug in ('news-posts', 'news-sponsors') and not getattr(self.object, 'status', None):
            self.object.status = 'active'
        stamp(self.object)
        if self.spec.string_pk and not self.object.pk:
            self.object.pk = new_pk(self.spec.pk_prefix)
        self.object.save()
        messages.success(self.request, 'ذخیره شد.')
        return redirect(detail_url(self.spec, self.object))


class PanelCreateView(PanelWriteMixin, CreateView):
    def form_valid(self, form):
        return self.save_object(form)


class PanelUpdateView(PanelWriteMixin, UpdateView):
    def form_valid(self, form):
        return self.save_object(form)


class PanelDeleteView(SpecMixin, DeleteView):
    template_name = 'core/object_confirm_delete.html'
    context_object_name = 'obj'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.page_context())
        ctx['list_url'] = reverse(f'{self.spec.slug}-list')
        return ctx

    def get_success_url(self):
        return reverse(f'{self.spec.slug}-list')

    def form_valid(self, form):
        if self.spec.slug == 'listings':
            hide_listing(self.object)
            messages.success(self.request, 'آگهی حذف شد.')
            return redirect(self.get_success_url())
        if self.spec.slug == 'hamyari-posts':
            hide_hamyari(self.object)
            messages.success(self.request, 'آگهی همیاری حذف شد.')
            return redirect(self.get_success_url())
        try:
            self.object.delete()
        except IntegrityError:
            messages.error(self.request, 'این رکورد به داده‌های دیگر وصل است و حذف نشد.')
            return redirect(detail_url(self.spec, self.object))
        messages.success(self.request, 'حذف شد.')
        return redirect(self.get_success_url())


def bind(view_cls, spec):
    return view_cls.as_view(spec=spec)
