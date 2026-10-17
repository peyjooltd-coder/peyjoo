from django.contrib import admin, messages
from django.contrib.admin import AdminSite
from django.db.models import Case, IntegerField, Value, When
from django.utils.html import format_html

from . import models
from .forms import new_pk, stamp
from .moderation import (
    approve_hamyari, approve_listing, hide_hamyari, hide_listing,
    ladder_listing, reject_hamyari, reject_listing, set_member_verified,
)


class PeyjooAdminSite(AdminSite):
    site_header = 'PeyJoo'
    site_title = 'PeyJoo'
    index_title = 'مدیریت اطلاعات'


site = PeyjooAdminSite(name='peyjoo_admin')


class PeyAdmin(admin.ModelAdmin):
    list_per_page = 30

    def get_exclude(self, request, obj=None):
        pk = self.model._meta.pk
        if getattr(pk, 'get_internal_type', lambda: '')() == 'CharField' and pk.primary_key:
            return ['id']
        return super().get_exclude(request, obj)

    def save_model(self, request, obj, form, change):
        assign_string_pk(obj, change)
        stamp(obj)
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in instances:
            assign_string_pk(obj, obj.pk is not None and obj.pk != '')
            stamp(obj)
            obj.save()
        formset.save_m2m()
        for obj in formset.deleted_objects:
            obj.delete()


def assign_string_pk(obj, change):
    pk = obj._meta.pk
    if not change and getattr(pk, 'get_internal_type', lambda: '')() == 'CharField' and not obj.pk:
        obj.pk = new_pk(obj._meta.model_name[:2])


class MemberAdmin(PeyAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'city', 'verified', 'exchange_trusted', 'created_at')
    search_fields = ('name', 'phone', 'email', 'contact_email', 'city')
    list_filter = ('verified', 'email_verified', 'exchange_trusted', 'city')
    actions = ('verify_members', 'unverify_members')

    @admin.action(description='وریفای و تأیید کاربران انتخاب‌شده')
    def verify_members(self, request, queryset):
        for member in queryset:
            set_member_verified(member, True)
        self.message_user(request, f'{queryset.count()} کاربر تأیید شد.')

    @admin.action(description='برداشتن تأیید کاربران انتخاب‌شده')
    def unverify_members(self, request, queryset):
        queryset.update(verified=False)
        self.message_user(request, f'{queryset.count()} کاربر از تأیید خارج شد.')


class ListingAdmin(PeyAdmin):
    list_display = ('id', 'title', 'category', 'city', 'price', 'status', 'is_pro', 'user', 'created_at')
    search_fields = ('title', 'city', 'category', 'seller_name', 'description')
    list_filter = ('status', 'is_pro', 'category', 'city')
    autocomplete_fields = ('user',)
    actions = ('approve_listings', 'reject_listings', 'ladder_listings', 'delete_listings')
    fieldsets = (
        ('آگهی', {
            'fields': (
                'user', 'title', 'category', 'status', 'price', 'price_label',
                'city', 'neighborhood', 'description', 'condition',
            ),
        }),
        ('ویژه و نردبان', {
            'fields': ('is_pro', 'badges_json', 'time_label', 'created_at', 'updated_at'),
        }),
        ('رسانه و فروشنده', {
            'classes': ('collapse',),
            'fields': (
                'image', 'images_json', 'seller_name', 'seller_avatar',
                'seller_verified', 'seller_rating', 'seller_reviews',
            ),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            pending_first=Case(
                When(status='pending', then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            ),
        ).order_by('pending_first', '-id')

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault('status', 'pending')
        initial.setdefault('city', 'Vancouver')
        initial.setdefault('category', 'vehicles')
        return initial

    def save_model(self, request, obj, form, change):
        if not obj.seller_name and obj.user_id:
            obj.seller_name = obj.user.name
        if obj.user_id and obj.user.verified:
            obj.seller_verified = True
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        hide_listing(obj)

    def delete_queryset(self, request, queryset):
        for listing in queryset:
            hide_listing(listing)

    @admin.action(description='تأیید آگهی‌های انتخاب‌شده')
    def approve_listings(self, request, queryset):
        for listing in queryset:
            approve_listing(listing)
        self.message_user(request, f'{queryset.count()} آگهی تأیید و فعال شد.')

    @admin.action(description='تأیید نشدن آگهی‌های انتخاب‌شده')
    def reject_listings(self, request, queryset):
        for listing in queryset:
            reject_listing(listing)
        self.message_user(request, f'{queryset.count()} آگهی تأیید نشد.', level=messages.WARNING)

    @admin.action(description='نردبان: آگهی ویژه و بالای صفحه')
    def ladder_listings(self, request, queryset):
        for listing in queryset:
            ladder_listing(listing)
        self.message_user(request, f'{queryset.count()} آگهی نردبان شد و در ویژه‌ها بالا رفت.')

    @admin.action(description='حذف آگهی‌های انتخاب‌شده')
    def delete_listings(self, request, queryset):
        for listing in queryset:
            hide_listing(listing)
        self.message_user(request, f'{queryset.count()} آگهی حذف شد.', level=messages.WARNING)


class ListingReportAdmin(PeyAdmin):
    list_display = ('id', 'listing_link', 'user', 'reason', 'status', 'created_at')
    search_fields = ('reason', 'details', 'listing__title', 'user__name', 'user__phone')
    list_filter = ('status', 'reason')
    actions = ('close_reports', 'delete_reported', 'approve_reported')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('listing', 'user')

    @admin.display(description='آگهی')
    def listing_link(self, obj):
        if not obj.listing_id:
            return '—'
        return format_html('<a href="../listing/{}/change/">{}</a>', obj.listing_id, obj.listing)

    @admin.action(description='بستن گزارش‌های انتخاب‌شده')
    def close_reports(self, request, queryset):
        updated = queryset.update(status='closed')
        self.message_user(request, f'{updated} گزارش بسته شد.')

    @admin.action(description='حذف آگهی‌های گزارش‌شده')
    def delete_reported(self, request, queryset):
        count = 0
        for report in queryset.select_related('listing'):
            if report.listing_id:
                hide_listing(report.listing)
                count += 1
            report.status = 'closed'
            report.save(update_fields=['status'])
        self.message_user(request, f'{count} آگهی گزارش‌شده حذف شد.')

    @admin.action(description='تأیید آگهی‌های گزارش‌شده و بستن گزارش')
    def approve_reported(self, request, queryset):
        for report in queryset.select_related('listing'):
            if report.listing_id:
                approve_listing(report.listing)
            report.status = 'closed'
            report.save(update_fields=['status'])
        self.message_user(request, 'آگهی‌ها تأیید و گزارش‌ها بسته شد.')


class ChatMessageInline(admin.TabularInline):
    model = models.ChatMessage
    extra = 0
    fields = ('from_side', 'text', 'time_label', 'created_at')


class ChatThreadAdmin(PeyAdmin):
    list_display = ('id', 'listing_title', 'other_name', 'user', 'unread', 'updated_at')
    search_fields = ('listing_title', 'other_name', 'listing_category')
    inlines = (ChatMessageInline,)


class DatingMessageInline(admin.TabularInline):
    model = models.DatingMessage
    extra = 0
    fields = ('from_side', 'text', 'time_label', 'created_at')


class DatingThreadAdmin(PeyAdmin):
    list_display = ('id', 'other_name', 'user', 'other_user', 'unread', 'updated_at')
    search_fields = ('other_name',)
    inlines = (DatingMessageInline,)


class HamyariCommentInline(admin.TabularInline):
    model = models.HamyariComment
    extra = 0
    fields = ('user', 'body', 'time_label', 'created_at')


class HamyariPostAdmin(PeyAdmin):
    list_display = ('id', 'title', 'category', 'status', 'user', 'likes_count', 'comments_count', 'created_at')
    search_fields = ('title', 'body', 'category')
    list_filter = ('status', 'category')
    actions = ('approve_posts', 'reject_posts', 'delete_posts')
    inlines = (HamyariCommentInline,)

    @admin.action(description='تأیید و انتشار آگهی‌های همیاری انتخاب‌شده')
    def approve_posts(self, request, queryset):
        for post in queryset:
            approve_hamyari(post)
        self.message_user(request, f'{queryset.count()} آگهی همیاری تأیید شد.')

    @admin.action(description='رد آگهی‌های همیاری انتخاب‌شده')
    def reject_posts(self, request, queryset):
        for post in queryset:
            reject_hamyari(post)
        self.message_user(request, f'{queryset.count()} آگهی همیاری رد شد.')

    @admin.action(description='حذف نرم آگهی‌های همیاری انتخاب‌شده')
    def delete_posts(self, request, queryset):
        for post in queryset:
            hide_hamyari(post)
        self.message_user(request, f'{queryset.count()} آگهی همیاری حذف شد.')


class HamyariMessageInline(admin.TabularInline):
    model = models.HamyariMessage
    extra = 0
    fields = ('from_side', 'text', 'time_label', 'created_at')


class HamyariThreadAdmin(PeyAdmin):
    list_display = ('id', 'other_name', 'user', 'other_user', 'unread', 'updated_at')
    search_fields = ('other_name',)
    inlines = (HamyariMessageInline,)


def auto_register(model):
    if model._meta.pk.__class__.__name__ == 'CompositePrimaryKey':
        return
    fields = []
    search = []
    for field in model._meta.fields:
        if field.__class__.__name__ == 'CompositePrimaryKey':
            continue
        if field.name in ('password_hash', 'avatar', 'image', 'images_json', 'description', 'body', 'bio'):
            continue
        if len(fields) < 6:
            fields.append(field.name)
        if field.get_internal_type() in ('CharField', 'TextField') and len(search) < 3:
            search.append(field.name)
    attrs = {'list_display': fields or ('pk',), 'search_fields': search}
    admin_cls = type(f'{model.__name__}Admin', (PeyAdmin,), attrs)
    site.register(model, admin_cls)


site.register(models.Member, MemberAdmin)
site.register(models.Listing, ListingAdmin)
site.register(models.ListingReport, ListingReportAdmin)
site.register(models.ChatThread, ChatThreadAdmin)
site.register(models.DatingThread, DatingThreadAdmin)
site.register(models.HamyariPost, HamyariPostAdmin)
site.register(models.HamyariThread, HamyariThreadAdmin)

REGISTERED = {
    models.Member, models.Listing, models.ListingReport, models.ChatThread,
    models.DatingThread, models.HamyariPost, models.HamyariThread,
}
for model in (
    models.SavedListing, models.CompareListing, models.WantSignal, models.HandshakeOffer,
    models.ChatMessage, models.SearchAlert, models.DemandPulse, models.PulseMatch,
    models.ListingReport, models.DatingProfile, models.DatingBlock, models.DatingMessage,
    models.DatingLike, models.DatingPass, models.DatingSecretCrush, models.HamyariLike,
    models.HamyariComment, models.HamyariMessage, models.HamyariNotification,
):
    if model not in REGISTERED:
        auto_register(model)
