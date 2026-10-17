from . import models


class Spec:
    def __init__(self, slug, model, title, columns, search_fields=(), composite=None, string_pk=False, pk_prefix='r'):
        self.slug = slug
        self.model = model
        self.title = title
        self.columns = columns
        self.search_fields = search_fields
        self.composite = composite
        self.string_pk = string_pk
        self.pk_prefix = pk_prefix


SPECS = [
    Spec('members', models.Member, 'کاربران', [
        ('phone', 'تلفن'), ('email', 'ایمیل'), ('city', 'شهر'), ('verified', 'تأیید'),
    ], ('name', 'phone', 'email', 'contact_email', 'city')),
    Spec('listings', models.Listing, 'آگهی‌ها', [
        ('category', 'دسته'), ('city', 'شهر'), ('price', 'قیمت'), ('status', 'وضعیت'), ('user', 'کاربر'),
    ], ('title', 'city', 'category', 'seller_name', 'status')),
    Spec('saved-listings', models.SavedListing, 'ذخیره‌ها', [
        ('user', 'کاربر'), ('listing', 'آگهی'), ('created_at', 'زمان'),
    ], composite=('user_id', 'listing_id')),
    Spec('compare-listings', models.CompareListing, 'مقایسه‌ها', [
        ('user', 'کاربر'), ('listing', 'آگهی'), ('position', 'ترتیب'),
    ], composite=('user_id', 'listing_id')),
    Spec('reports', models.ListingReport, 'گزارش آگهی', [
        ('listing', 'آگهی'), ('user', 'کاربر'), ('reason', 'دلیل'), ('status', 'وضعیت'),
    ], ('reason', 'details', 'status')),
    Spec('chat-threads', models.ChatThread, 'گفتگوهای آگهی', [
        ('user', 'کاربر'), ('other_name', 'طرف'), ('unread', 'نخوانده'),
    ], ('listing_title', 'other_name', 'listing_category'), string_pk=True, pk_prefix='ct'),
    Spec('chat-messages', models.ChatMessage, 'پیام‌های آگهی', [
        ('thread', 'گفتگو'), ('from_side', 'از'), ('text', 'متن'),
    ], ('text', 'from_side'), string_pk=True, pk_prefix='cm'),
    Spec('wants', models.WantSignal, 'درخواست خرید', [
        ('category', 'دسته'), ('region', 'منطقه'), ('budget', 'بودجه'), ('user', 'کاربر'),
    ], ('title', 'category', 'region'), string_pk=True, pk_prefix='w'),
    Spec('handshakes', models.HandshakeOffer, 'پیشنهاد معامله', [
        ('from_name', 'از'), ('to_name', 'به'), ('offer_price', 'مبلغ'), ('status', 'وضعیت'),
    ], ('listing_title', 'from_name', 'to_name', 'status'), string_pk=True, pk_prefix='hs'),
    Spec('alerts', models.SearchAlert, 'هشدار جستجو', [
        ('user', 'کاربر'), ('query', 'عبارت'), ('region', 'منطقه'), ('active', 'فعال'),
    ], ('query', 'region')),
    Spec('pulse', models.DemandPulse, 'نبض تقاضا', [
        ('area', 'منطقه'), ('category', 'دسته'), ('intensity', 'شدت'), ('hot', 'داغ'),
    ], ('area', 'category', 'trend')),
    Spec('matches', models.PulseMatch, 'تطبیق‌ها', [
        ('want', 'درخواست'), ('listing', 'آگهی'), ('score', 'امتیاز'), ('status', 'وضعیت'),
    ], ('status',), string_pk=True, pk_prefix='pm'),
    Spec('dating-profiles', models.DatingProfile, 'پروفایل دوستیابی', [
        ('display_name', 'نام'), ('age', 'سن'), ('gender', 'جنسیت'), ('looking_for', 'به دنبال'),
    ], ('display_name', 'bio', 'gender', 'looking_for')),
    Spec('dating-likes', models.DatingLike, 'لایک دوستیابی', [
        ('from_user', 'از'), ('to_user', 'به'), ('created_at', 'زمان'),
    ], composite=('from_user_id', 'to_user_id')),
    Spec('dating-passes', models.DatingPass, 'رد دوستیابی', [
        ('from_user', 'از'), ('to_user', 'به'),
    ], composite=('from_user_id', 'to_user_id')),
    Spec('dating-blocks', models.DatingBlock, 'مسدود دوستیابی', [
        ('user', 'کاربر'), ('blocked_user', 'مسدود'),
    ], composite=('user_id', 'blocked_user_id')),
    Spec('secret-crush', models.DatingSecretCrush, 'کراش مخفی', [
        ('from_user', 'از'), ('to_user', 'به'),
    ], composite=('from_user_id', 'to_user_id')),
    Spec('dating-threads', models.DatingThread, 'گفتگوهای دوستیابی', [
        ('user', 'کاربر'), ('other_name', 'طرف'), ('unread', 'نخوانده'),
    ], ('other_name',), string_pk=True, pk_prefix='dt'),
    Spec('dating-messages', models.DatingMessage, 'پیام‌های دوستیابی', [
        ('thread', 'گفتگو'), ('from_side', 'از'), ('text', 'متن'),
    ], ('text',), string_pk=True, pk_prefix='dm'),
    Spec('hamyari-posts', models.HamyariPost, 'آگهی‌های همیاری', [
        ('user', 'کاربر'), ('status', 'وضعیت'), ('category', 'دسته'), ('likes_count', 'لایک'), ('comments_count', 'نظر'),
    ], ('title', 'body', 'category', 'status'), string_pk=True, pk_prefix='hp'),
    Spec('hamyari-likes', models.HamyariLike, 'لایک همکاری', [
        ('user', 'کاربر'), ('post', 'پست'),
    ], composite=('user_id', 'post_id')),
    Spec('hamyari-comments', models.HamyariComment, 'نظرهای همکاری', [
        ('post', 'پست'), ('user', 'کاربر'), ('body', 'متن'),
    ], ('body',), string_pk=True, pk_prefix='hc'),
    Spec('hamyari-threads', models.HamyariThread, 'گفتگوهای همکاری', [
        ('user', 'کاربر'), ('other_name', 'طرف'), ('unread', 'نخوانده'),
    ], ('other_name',), string_pk=True, pk_prefix='ht'),
    Spec('hamyari-messages', models.HamyariMessage, 'پیام‌های همکاری', [
        ('thread', 'گفتگو'), ('from_side', 'از'), ('text', 'متن'),
    ], ('text',), string_pk=True, pk_prefix='hm'),
    Spec('hamyari-notifications', models.HamyariNotification, 'اعلان‌های همکاری', [
        ('user', 'کاربر'), ('kind', 'نوع'), ('actor_name', 'از'), ('is_read', 'خوانده'),
    ], ('kind', 'actor_name', 'body'), string_pk=True, pk_prefix='hn'),
    Spec('news-posts', models.NewsPost, 'اخبار (فقط ادمین)', [
        ('status', 'وضعیت'), ('sort_order', 'ترتیب'), ('tag', 'برچسب'), ('media_type', 'رسانه'),
    ], ('title_fa', 'title_en', 'body_fa', 'body_en', 'author_fa'), string_pk=True, pk_prefix='np'),
    Spec('news-sponsors', models.NewsSponsor, 'اسپانسر اخبار', [
        ('status', 'وضعیت'), ('placement', 'جایگاه'), ('sort_order', 'ترتیب'), ('link_tag', 'لینک'),
    ], ('title_fa', 'title_en', 'body_fa', 'cta_fa'), string_pk=True, pk_prefix='ns'),
]

SPEC_BY_SLUG = {spec.slug: spec for spec in SPECS}

NAV = [
    ('بازار', [
        'members', 'listings', 'hamyari-posts',
        'saved-listings', 'compare-listings', 'reports', 'alerts',
    ]),
    ('اخبار', ['news-posts', 'news-sponsors']),
    ('گفتگو و معامله', ['chat-threads', 'chat-messages', 'wants', 'handshakes', 'pulse', 'matches']),
    ('دوستیابی', [
        'dating-profiles', 'dating-likes', 'dating-passes', 'dating-blocks',
        'secret-crush', 'dating-threads', 'dating-messages',
    ]),
    ('همیاری', [
        'hamyari-likes', 'hamyari-comments',
        'hamyari-threads', 'hamyari-messages', 'hamyari-notifications',
    ]),
]
