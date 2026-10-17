from .registry import NAV, SPEC_BY_SLUG


def panel(request):
    groups = []
    for title, slugs in NAV:
        groups.append({
            'title': title,
            'items': [{
                'slug': slug,
                'title': SPEC_BY_SLUG[slug].title,
                'url_name': f'{slug}-list',
            } for slug in slugs],
        })
    return {'nav_groups': groups}
