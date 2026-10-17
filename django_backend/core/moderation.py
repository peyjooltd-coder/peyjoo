import json
from datetime import datetime

from .models import HamyariPost, Listing, Member


def now_stamp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def approve_listing(listing: Listing):
    listing.status = 'active'
    listing.updated_at = now_stamp()
    listing.save(update_fields=['status', 'updated_at'])
    if listing.category == 'exchange' and listing.user_id:
        Member.objects.filter(pk=listing.user_id).update(exchange_trusted=True)


def hide_listing(listing: Listing):
    listing.status = 'deleted'
    listing.updated_at = now_stamp()
    listing.save(update_fields=['status', 'updated_at'])


def reject_listing(listing: Listing):
    listing.status = 'rejected'
    listing.updated_at = now_stamp()
    listing.save(update_fields=['status', 'updated_at'])


def approve_hamyari(post: HamyariPost):
    post.status = 'active'
    post.updated_at = now_stamp()
    post.save(update_fields=['status', 'updated_at'])


def reject_hamyari(post: HamyariPost):
    post.status = 'rejected'
    post.updated_at = now_stamp()
    post.save(update_fields=['status', 'updated_at'])


def hide_hamyari(post: HamyariPost):
    post.status = 'deleted'
    post.updated_at = now_stamp()
    post.save(update_fields=['status', 'updated_at'])


def parse_media_json(images_json, cover=''):
    items = []
    try:
        parsed = json.loads(images_json or '[]')
    except json.JSONDecodeError:
        parsed = []
    if isinstance(parsed, list):
        for item in parsed:
            if isinstance(item, str) and item.strip():
                items.append({'type': 'image', 'url': item.strip(), 'poster': ''})
            elif isinstance(item, dict) and str(item.get('url') or '').strip():
                items.append({
                    'type': item.get('type') or 'image',
                    'url': str(item['url']).strip(),
                    'poster': str(item.get('poster') or '').strip(),
                })
    cover = str(cover or '').strip()
    if cover and not any(entry['url'] == cover for entry in items):
        items.insert(0, {'type': 'image', 'url': cover, 'poster': ''})
    return items


def listing_media(listing: Listing):
    return parse_media_json(listing.images_json, getattr(listing, 'image', '') or '')


def hamyari_media(post: HamyariPost):
    return parse_media_json(post.images_json)


def listing_attributes(listing: Listing):
    try:
        parsed = json.loads(listing.attributes_json or '{}')
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def ladder_listing(listing: Listing):
    """Bump a featured ad to the top of the home feed (نردبان)."""
    now = now_stamp()
    try:
        badges = json.loads(listing.badges_json or '[]')
    except json.JSONDecodeError:
        badges = []
    if not isinstance(badges, list):
        badges = []
    if 'ویژه' not in badges:
        badges.insert(0, 'ویژه')
    listing.is_pro = True
    listing.badges_json = json.dumps(badges, ensure_ascii=False)
    listing.time_label = 'همین الان'
    listing.created_at = now
    listing.updated_at = now
    listing.save(update_fields=[
        'is_pro', 'badges_json', 'time_label', 'created_at', 'updated_at',
    ])


def set_member_verified(member: Member, verified: bool):
    member.verified = verified
    member.save(update_fields=['verified'])
    if verified:
        Listing.objects.filter(user_id=member.pk).update(seller_verified=True)
