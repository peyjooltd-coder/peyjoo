from django.db import models


class Member(models.Model):
    email = models.CharField('ایمیل ورود', max_length=320, unique=True)
    password_hash = models.CharField('هش رمز', max_length=255)
    name = models.CharField('نام', max_length=200)
    avatar = models.TextField('آواتار', blank=True, null=True)
    city = models.CharField('شهر', max_length=120, blank=True, null=True, default='Vancouver')
    verified = models.BooleanField('تأییدشده', default=True)
    pro_tier = models.CharField('سطح پرو', max_length=64, blank=True, null=True)
    created_at = models.CharField('زمان ساخت', max_length=64, blank=True, null=True)
    phone = models.CharField('تلفن', max_length=32, blank=True, null=True)
    contact_email = models.CharField('ایمیل تماس', max_length=320, blank=True, null=True)
    email_verified = models.BooleanField('ایمیل تأیید شده', default=False)
    exchange_trusted = models.BooleanField('مورد اعتماد تبادل', default=False)

    class Meta:
        managed = False
        db_table = 'users'
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'
        ordering = ['-id']

    def __str__(self):
        return self.name or self.phone or self.email


class Listing(models.Model):
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='listings')
    title = models.CharField('عنوان', max_length=500)
    category = models.CharField('دسته', max_length=120)
    price = models.FloatField('قیمت', default=0)
    price_label = models.CharField('برچسب قیمت', max_length=200, blank=True, null=True)
    city = models.CharField('شهر', max_length=120)
    neighborhood = models.CharField('محله', max_length=200, blank=True, null=True)
    image = models.TextField('تصویر', blank=True, null=True)
    images_json = models.TextField('تصاویر', blank=True, null=True, default='[]')
    description = models.TextField('توضیح', blank=True, null=True)
    condition = models.CharField('وضعیت کالا', max_length=120, blank=True, null=True)
    seller_name = models.CharField('نام فروشنده', max_length=200, blank=True, null=True)
    seller_avatar = models.TextField('آواتار فروشنده', blank=True, null=True)
    seller_verified = models.BooleanField('فروشنده تأییدشده', default=False)
    seller_rating = models.FloatField('امتیاز', default=5)
    seller_reviews = models.IntegerField('تعداد نظر', default=0)
    is_pro = models.BooleanField('آگهی ویژه', default=False)
    is_mine = models.BooleanField('آگهی خودم', default=False)
    status = models.CharField('وضعیت', max_length=32, default='active')
    badges_json = models.TextField('نشان‌ها', blank=True, null=True, default='[]')
    features_json = models.TextField('ویژگی‌ها', blank=True, null=True, default='[]')
    attributes_json = models.TextField('جزئیات', blank=True, null=True, default='{}')
    views = models.IntegerField('بازدید', default=0)
    saves = models.IntegerField('ذخیره', default=0)
    lat = models.FloatField('عرض', blank=True, null=True)
    lng = models.FloatField('طول', blank=True, null=True)
    time_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True, default='Just now')
    created_at = models.CharField('زمان ساخت', max_length=64, blank=True, null=True)
    updated_at = models.CharField('زمان ویرایش', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'listings'
        verbose_name = 'آگهی'
        verbose_name_plural = 'آگهی‌ها'
        ordering = ['-id']

    def __str__(self):
        return self.title


class SavedListing(models.Model):
    pk = models.CompositePrimaryKey('user', 'listing')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='saved_rows')
    listing = models.ForeignKey(Listing, verbose_name='آگهی', on_delete=models.CASCADE, related_name='saved_rows')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'saved_listings'
        verbose_name = 'ذخیره'
        verbose_name_plural = 'ذخیره‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} · {self.listing}'


class CompareListing(models.Model):
    pk = models.CompositePrimaryKey('user', 'listing')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='compare_rows')
    listing = models.ForeignKey(Listing, verbose_name='آگهی', on_delete=models.CASCADE, related_name='compare_rows')
    position = models.IntegerField('ترتیب', default=0)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'compare_listings'
        verbose_name = 'مقایسه'
        verbose_name_plural = 'مقایسه‌ها'
        ordering = ['position', '-created_at']

    def __str__(self):
        return f'{self.user} · {self.listing}'


class WantSignal(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(
        Member, verbose_name='کاربر', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='want_signals',
    )
    title = models.CharField('عنوان', max_length=500)
    category = models.CharField('دسته', max_length=120)
    budget = models.CharField('بودجه', max_length=120, blank=True, null=True)
    region = models.CharField('منطقه', max_length=200, blank=True, null=True)
    radius = models.CharField('شعاع', max_length=64, blank=True, null=True)
    urgency = models.CharField('فوریت', max_length=64, blank=True, null=True)
    seekers = models.IntegerField('جویاها', default=1)
    matches = models.IntegerField('تطبیق', default=0)
    posted = models.CharField('زمان انتشار', max_length=120, blank=True, null=True)
    avatar = models.TextField('آواتار', blank=True, null=True)
    verified = models.BooleanField('تأییدشده', default=False)
    created_at = models.CharField('زمان ساخت', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'want_signals'
        verbose_name = 'درخواست خرید'
        verbose_name_plural = 'درخواست‌های خرید'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class HandshakeOffer(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    listing = models.ForeignKey(
        Listing, verbose_name='آگهی', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='handshakes',
    )
    user = models.ForeignKey(
        Member, verbose_name='کاربر', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='handshakes',
    )
    listing_title = models.CharField('عنوان آگهی', max_length=500, blank=True, null=True)
    listing_image = models.TextField('تصویر آگهی', blank=True, null=True)
    from_name = models.CharField('از', max_length=200, blank=True, null=True)
    to_name = models.CharField('به', max_length=200, blank=True, null=True)
    offer_price = models.FloatField('پیشنهاد', blank=True, null=True)
    counter_price = models.FloatField('پیشنهاد مقابل', blank=True, null=True)
    meet_point = models.CharField('محل دیدار', max_length=300, blank=True, null=True)
    time_slot = models.CharField('زمان دیدار', max_length=200, blank=True, null=True)
    conditions_json = models.TextField('شرایط', blank=True, null=True, default='[]')
    status = models.CharField('وضعیت', max_length=32, default='pending')
    expires = models.CharField('انقضا', max_length=64, blank=True, null=True)
    created_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    created_at = models.CharField('زمان ساخت', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'handshake_offers'
        verbose_name = 'پیشنهاد معامله'
        verbose_name_plural = 'پیشنهادهای معامله'
        ordering = ['-created_at']

    def __str__(self):
        return self.listing_title or self.id


class ChatThread(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='chat_threads')
    listing = models.ForeignKey(Listing, verbose_name='آگهی', on_delete=models.CASCADE, related_name='chat_threads')
    listing_title = models.CharField('عنوان آگهی', max_length=500, blank=True, null=True)
    listing_image = models.TextField('تصویر آگهی', blank=True, null=True)
    listing_category = models.CharField('دسته', max_length=120, blank=True, null=True)
    other_name = models.CharField('طرف گفتگو', max_length=200, blank=True, null=True)
    other_avatar = models.TextField('آواتار', blank=True, null=True)
    unread = models.IntegerField('خوانده‌نشده', default=0)
    updated_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    updated_at = models.CharField('آخرین به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_threads'
        verbose_name = 'گفتگوی آگهی'
        verbose_name_plural = 'گفتگوهای آگهی'
        ordering = ['-updated_at']

    def __str__(self):
        return self.listing_title or self.other_name or self.id


class ChatMessage(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    thread = models.ForeignKey(ChatThread, verbose_name='گفتگو', on_delete=models.CASCADE, related_name='messages')
    from_side = models.CharField('فرستنده', max_length=8)
    text = models.TextField('متن')
    time_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_messages'
        verbose_name = 'پیام آگهی'
        verbose_name_plural = 'پیام‌های آگهی'
        ordering = ['created_at']

    def __str__(self):
        return (self.text or '')[:80]


class SearchAlert(models.Model):
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='search_alerts')
    query = models.CharField('عبارت', max_length=300)
    region = models.CharField('منطقه', max_length=200, blank=True, null=True)
    active = models.BooleanField('فعال', default=True)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'search_alerts'
        verbose_name = 'هشدار جستجو'
        verbose_name_plural = 'هشدارهای جستجو'
        ordering = ['-id']

    def __str__(self):
        return self.query


class DemandPulse(models.Model):
    area = models.CharField('منطقه', max_length=200)
    category = models.CharField('دسته', max_length=120)
    intensity = models.IntegerField('شدت', blank=True, null=True)
    seekers = models.IntegerField('جویاها', blank=True, null=True)
    trend = models.CharField('روند', max_length=64, blank=True, null=True)
    hot = models.BooleanField('داغ', default=False)

    class Meta:
        managed = False
        db_table = 'demand_pulse'
        verbose_name = 'نبض تقاضا'
        verbose_name_plural = 'نبض تقاضا'
        ordering = ['-id']

    def __str__(self):
        return f'{self.area} · {self.category}'


class PulseMatch(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    want = models.ForeignKey(WantSignal, verbose_name='درخواست', on_delete=models.CASCADE, related_name='pulse_matches')
    listing = models.ForeignKey(Listing, verbose_name='آگهی', on_delete=models.CASCADE, related_name='pulse_matches')
    score = models.IntegerField('امتیاز', blank=True, null=True)
    reasons_json = models.TextField('دلایل', blank=True, null=True, default='[]')
    status = models.CharField('وضعیت', max_length=32, default='new')

    class Meta:
        managed = False
        db_table = 'pulse_matches'
        verbose_name = 'تطبیق'
        verbose_name_plural = 'تطبیق‌ها'
        ordering = ['-id']

    def __str__(self):
        return f'{self.want} → {self.listing}'


class ListingReport(models.Model):
    listing = models.ForeignKey(Listing, verbose_name='آگهی', on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='listing_reports')
    reason = models.CharField('دلیل', max_length=200)
    details = models.TextField('جزئیات', blank=True, null=True, default='')
    status = models.CharField('وضعیت', max_length=32, default='open')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'listing_reports'
        verbose_name = 'گزارش آگهی'
        verbose_name_plural = 'گزارش‌های آگهی'
        ordering = ['-id']
        unique_together = (('listing', 'user'),)

    def __str__(self):
        return f'{self.listing} · {self.reason}'


class DatingProfile(models.Model):
    user = models.OneToOneField(
        Member, verbose_name='کاربر', primary_key=True,
        on_delete=models.CASCADE, related_name='dating_profile', db_column='user_id',
    )
    display_name = models.CharField('نام نمایشی', max_length=200)
    bio = models.TextField('بیو', blank=True, null=True, default='')
    age = models.IntegerField('سن', blank=True, null=True)
    gender = models.CharField('جنسیت', max_length=64, blank=True, null=True)
    looking_for = models.CharField('به دنبال', max_length=64, blank=True, null=True)
    avatar = models.TextField('آواتار', blank=True, null=True)
    lat = models.FloatField('عرض')
    lng = models.FloatField('طول')
    interests_json = models.TextField('علاقه‌ها', blank=True, null=True, default='[]')
    active = models.BooleanField('فعال', default=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)
    last_seen_at = models.CharField('آخرین بازدید', max_length=64, blank=True, null=True)
    photos_json = models.TextField('عکس‌ها', blank=True, null=True, default='[]')
    details_json = models.TextField('جزئیات', blank=True, null=True, default='{}')

    class Meta:
        managed = False
        db_table = 'dating_profiles'
        verbose_name = 'پروفایل دوستیابی'
        verbose_name_plural = 'پروفایل‌های دوستیابی'
        ordering = ['display_name']

    def __str__(self):
        return self.display_name


class DatingBlock(models.Model):
    pk = models.CompositePrimaryKey('user', 'blocked_user')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='dating_blocks_made')
    blocked_user = models.ForeignKey(
        Member, verbose_name='مسدودشده', on_delete=models.CASCADE, related_name='dating_blocks_received',
    )
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_blocks'
        verbose_name = 'مسدود دوستیابی'
        verbose_name_plural = 'مسدودهای دوستیابی'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} → {self.blocked_user}'


class DatingThread(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='dating_threads')
    other_user = models.ForeignKey(
        Member, verbose_name='طرف گفتگو', on_delete=models.CASCADE, related_name='dating_threads_as_other',
    )
    other_name = models.CharField('نام', max_length=200, blank=True, null=True)
    other_avatar = models.TextField('آواتار', blank=True, null=True)
    unread = models.IntegerField('خوانده‌نشده', default=0)
    updated_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_threads'
        verbose_name = 'گفتگوی دوستیابی'
        verbose_name_plural = 'گفتگوهای دوستیابی'
        unique_together = (('user', 'other_user'),)
        ordering = ['-updated_at']

    def __str__(self):
        return self.other_name or self.id


class DatingMessage(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    thread = models.ForeignKey(DatingThread, verbose_name='گفتگو', on_delete=models.CASCADE, related_name='messages')
    from_side = models.CharField('فرستنده', max_length=8)
    text = models.TextField('متن')
    time_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_messages'
        verbose_name = 'پیام دوستیابی'
        verbose_name_plural = 'پیام‌های دوستیابی'
        ordering = ['created_at']

    def __str__(self):
        return (self.text or '')[:80]


class DatingLike(models.Model):
    pk = models.CompositePrimaryKey('from_user', 'to_user')
    from_user = models.ForeignKey(Member, verbose_name='از', on_delete=models.CASCADE, related_name='dating_likes_sent')
    to_user = models.ForeignKey(Member, verbose_name='به', on_delete=models.CASCADE, related_name='dating_likes_received')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_likes'
        verbose_name = 'لایک دوستیابی'
        verbose_name_plural = 'لایک‌های دوستیابی'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.from_user} → {self.to_user}'


class DatingPass(models.Model):
    pk = models.CompositePrimaryKey('from_user', 'to_user')
    from_user = models.ForeignKey(Member, verbose_name='از', on_delete=models.CASCADE, related_name='dating_passes_sent')
    to_user = models.ForeignKey(Member, verbose_name='به', on_delete=models.CASCADE, related_name='dating_passes_received')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_passes'
        verbose_name = 'رد دوستیابی'
        verbose_name_plural = 'ردهای دوستیابی'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.from_user} → {self.to_user}'


class DatingSecretCrush(models.Model):
    pk = models.CompositePrimaryKey('from_user', 'to_user')
    from_user = models.ForeignKey(Member, verbose_name='از', on_delete=models.CASCADE, related_name='secret_crushes_sent')
    to_user = models.ForeignKey(Member, verbose_name='به', on_delete=models.CASCADE, related_name='secret_crushes_received')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dating_secret_crush'
        verbose_name = 'کراش مخفی'
        verbose_name_plural = 'کراش‌های مخفی'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.from_user} → {self.to_user}'


class HamyariPost(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار تأیید'),
        ('active', 'منتشر شده'),
        ('rejected', 'تأیید نشده'),
        ('deleted', 'حذف شده'),
    )

    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='hamyari_posts')
    category = models.CharField('دسته', max_length=120, default='general')
    title = models.CharField('عنوان', max_length=500, blank=True, null=True, default='')
    body = models.TextField('متن')
    images_json = models.TextField('تصاویر', blank=True, null=True, default='[]')
    likes_count = models.IntegerField('لایک', default=0)
    comments_count = models.IntegerField('نظر', default=0)
    status = models.CharField('وضعیت', max_length=32, default='pending', choices=STATUS_CHOICES)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_posts'
        verbose_name = 'آگهی همیاری'
        verbose_name_plural = 'آگهی‌های همیاری'
        ordering = ['-created_at']

    def __str__(self):
        return self.title or (self.body or '')[:60]


class HamyariLike(models.Model):
    pk = models.CompositePrimaryKey('user', 'post')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='hamyari_likes')
    post = models.ForeignKey(HamyariPost, verbose_name='پست', on_delete=models.CASCADE, related_name='likes')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_likes'
        verbose_name = 'لایک همکاری'
        verbose_name_plural = 'لایک‌های همکاری'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} · {self.post_id}'


class HamyariComment(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    post = models.ForeignKey(HamyariPost, verbose_name='پست', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='hamyari_comments')
    body = models.TextField('متن')
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    time_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_comments'
        verbose_name = 'نظر همکاری'
        verbose_name_plural = 'نظرهای همکاری'
        ordering = ['created_at']

    def __str__(self):
        return (self.body or '')[:80]


class HamyariThread(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='hamyari_threads')
    other_user = models.ForeignKey(
        Member, verbose_name='طرف گفتگو', on_delete=models.CASCADE, related_name='hamyari_threads_as_other',
    )
    other_name = models.CharField('نام', max_length=200, blank=True, null=True)
    other_avatar = models.TextField('آواتار', blank=True, null=True)
    unread = models.IntegerField('خوانده‌نشده', default=0)
    updated_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_threads'
        verbose_name = 'گفتگوی همکاری'
        verbose_name_plural = 'گفتگوهای همکاری'
        unique_together = (('user', 'other_user'),)
        ordering = ['-updated_at']

    def __str__(self):
        return self.other_name or self.id


class HamyariMessage(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    thread = models.ForeignKey(HamyariThread, verbose_name='گفتگو', on_delete=models.CASCADE, related_name='messages')
    from_side = models.CharField('فرستنده', max_length=8)
    text = models.TextField('متن')
    time_label = models.CharField('زمان نمایشی', max_length=120, blank=True, null=True)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_messages'
        verbose_name = 'پیام همکاری'
        verbose_name_plural = 'پیام‌های همکاری'
        ordering = ['created_at']

    def __str__(self):
        return (self.text or '')[:80]


class HamyariNotification(models.Model):
    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    user = models.ForeignKey(Member, verbose_name='کاربر', on_delete=models.CASCADE, related_name='hamyari_notifications')
    kind = models.CharField('نوع', max_length=64, db_column='type')
    actor_name = models.CharField('انجام‌دهنده', max_length=200, blank=True, null=True)
    body = models.TextField('متن', blank=True, null=True)
    is_read = models.BooleanField('خوانده شده', db_column='read', default=False)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hamyari_notifications'
        verbose_name = 'اعلان همکاری'
        verbose_name_plural = 'اعلان‌های همکاری'
        ordering = ['-created_at']

    def __str__(self):
        return self.body or self.kind


class NewsPost(models.Model):
    STATUS_CHOICES = (
        ('active', 'منتشر'),
        ('hidden', 'مخفی'),
    )
    MEDIA_CHOICES = (
        ('', 'بدون رسانه'),
        ('image', 'تصویر'),
        ('video', 'ویدیو'),
    )

    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    title_fa = models.CharField('عنوان فارسی', max_length=500, default='')
    title_en = models.CharField('عنوان انگلیسی', max_length=500, default='', blank=True)
    body_fa = models.TextField('متن فارسی', default='')
    body_en = models.TextField('متن انگلیسی', default='', blank=True)
    author_fa = models.CharField('نویسنده فارسی', max_length=200, default='پی‌جو', blank=True)
    author_en = models.CharField('نویسنده انگلیسی', max_length=200, default='PeyJoo', blank=True)
    role_fa = models.CharField('سمت فارسی', max_length=200, default='تحریریه', blank=True)
    role_en = models.CharField('سمت انگلیسی', max_length=200, default='Editorial', blank=True)
    avatar = models.TextField('آواتار', blank=True, null=True, default='/logo.jpeg')
    media_type = models.CharField('نوع رسانه', max_length=32, blank=True, default='', choices=MEDIA_CHOICES)
    media_url = models.TextField('آدرس رسانه', blank=True, null=True, default='')
    poster = models.TextField('کاور ویدیو', blank=True, null=True, default='')
    tag = models.CharField('برچسب لینک (hamyari/jobs/real-estate/explore)', max_length=120, blank=True, default='')
    likes = models.IntegerField('لایک پایه', default=0)
    comments = models.IntegerField('نظر پایه', default=0)
    shares = models.IntegerField('اشتراک پایه', default=0)
    status = models.CharField('وضعیت', max_length=32, default='active', choices=STATUS_CHOICES)
    sort_order = models.IntegerField('ترتیب', default=0)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'news_posts'
        verbose_name = 'خبر'
        verbose_name_plural = 'اخبار'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title_fa or self.title_en or self.id


class NewsSponsor(models.Model):
    STATUS_CHOICES = (
        ('active', 'فعال'),
        ('hidden', 'مخفی'),
    )
    PLACEMENT_CHOICES = (
        ('hero', 'بالای صفحه'),
        ('inline', 'بین اخبار'),
        ('footer', 'پایین صفحه'),
    )

    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    title_fa = models.CharField('عنوان فارسی', max_length=500, default='')
    title_en = models.CharField('عنوان انگلیسی', max_length=500, default='', blank=True)
    body_fa = models.TextField('متن فارسی', default='', blank=True)
    body_en = models.TextField('متن انگلیسی', default='', blank=True)
    image_url = models.TextField('تصویر', blank=True, null=True, default='')
    cta_fa = models.CharField('دکمه فارسی', max_length=120, default='مشاهده', blank=True)
    cta_en = models.CharField('دکمه انگلیسی', max_length=120, default='View', blank=True)
    link_tag = models.CharField('لینک داخلی (hamyari/jobs/real-estate)', max_length=120, blank=True, default='')
    link_url = models.TextField('لینک خارجی', blank=True, null=True, default='')
    placement = models.CharField('جایگاه', max_length=32, default='inline', choices=PLACEMENT_CHOICES)
    status = models.CharField('وضعیت', max_length=32, default='active', choices=STATUS_CHOICES)
    sort_order = models.IntegerField('ترتیب', default=0)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'news_sponsors'
        verbose_name = 'اسپانسر اخبار'
        verbose_name_plural = 'اسپانسرهای اخبار'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title_fa or self.title_en or self.id


class NewsPost(models.Model):
    STATUS_CHOICES = (
        ('active', 'منتشر'),
        ('hidden', 'مخفی'),
    )
    MEDIA_CHOICES = (
        ('', 'بدون رسانه'),
        ('image', 'تصویر'),
        ('video', 'ویدیو'),
    )

    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    title_fa = models.CharField('عنوان فارسی', max_length=500, default='')
    title_en = models.CharField('عنوان انگلیسی', max_length=500, default='', blank=True)
    body_fa = models.TextField('متن فارسی', default='')
    body_en = models.TextField('متن انگلیسی', default='', blank=True)
    author_fa = models.CharField('نویسنده فارسی', max_length=200, default='پی‌جو', blank=True)
    author_en = models.CharField('نویسنده انگلیسی', max_length=200, default='PeyJoo', blank=True)
    role_fa = models.CharField('سمت فارسی', max_length=200, default='تحریریه', blank=True)
    role_en = models.CharField('سمت انگلیسی', max_length=200, default='Editorial', blank=True)
    avatar = models.TextField('آواتار', blank=True, null=True, default='/logo.jpeg')
    media_type = models.CharField('نوع رسانه', max_length=32, blank=True, default='', choices=MEDIA_CHOICES)
    media_url = models.TextField('آدرس رسانه', blank=True, null=True, default='')
    poster = models.TextField('کاور ویدیو', blank=True, null=True, default='')
    tag = models.CharField('برچسب لینک (hamyari/jobs/real-estate/explore)', max_length=120, blank=True, default='')
    likes = models.IntegerField('لایک پایه', default=0)
    comments = models.IntegerField('نظر پایه', default=0)
    shares = models.IntegerField('اشتراک پایه', default=0)
    status = models.CharField('وضعیت', max_length=32, default='active', choices=STATUS_CHOICES)
    sort_order = models.IntegerField('ترتیب', default=0)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'news_posts'
        verbose_name = 'خبر'
        verbose_name_plural = 'اخبار'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title_fa or self.title_en or self.id


class NewsSponsor(models.Model):
    STATUS_CHOICES = (
        ('active', 'فعال'),
        ('hidden', 'مخفی'),
    )
    PLACEMENT_CHOICES = (
        ('hero', 'بالای صفحه'),
        ('inline', 'بین اخبار'),
        ('footer', 'پایین صفحه'),
    )

    id = models.CharField(primary_key=True, max_length=80, verbose_name='شناسه')
    title_fa = models.CharField('عنوان فارسی', max_length=500, default='')
    title_en = models.CharField('عنوان انگلیسی', max_length=500, default='', blank=True)
    body_fa = models.TextField('متن فارسی', default='', blank=True)
    body_en = models.TextField('متن انگلیسی', default='', blank=True)
    image_url = models.TextField('تصویر', blank=True, null=True, default='')
    cta_fa = models.CharField('دکمه فارسی', max_length=120, default='مشاهده', blank=True)
    cta_en = models.CharField('دکمه انگلیسی', max_length=120, default='View', blank=True)
    link_tag = models.CharField('لینک داخلی (hamyari/jobs/real-estate)', max_length=120, blank=True, default='')
    link_url = models.TextField('لینک خارجی', blank=True, null=True, default='')
    placement = models.CharField('جایگاه', max_length=32, default='inline', choices=PLACEMENT_CHOICES)
    status = models.CharField('وضعیت', max_length=32, default='active', choices=STATUS_CHOICES)
    sort_order = models.IntegerField('ترتیب', default=0)
    created_at = models.CharField('زمان', max_length=64, blank=True, null=True)
    updated_at = models.CharField('به‌روزرسانی', max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'news_sponsors'
        verbose_name = 'اسپانسر اخبار'
        verbose_name_plural = 'اسپانسرهای اخبار'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title_fa or self.title_en or self.id
