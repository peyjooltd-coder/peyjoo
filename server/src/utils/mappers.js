import { mediaCoverUrl, isVideoUrl, normalizeMediaList } from './media.js'
import { resolveUserAvatar } from './defaultAvatar.js'

const MAX_INLINE_COVER = 120_000 // skip huge data:image covers in card payloads

function parseMedia(row) {
  try {
    return normalizeMediaList(JSON.parse(row.images_json || '[]'))
  } catch {
    return []
  }
}

function resolveCover(row, media) {
  const rowImageOk = row.image
    && !String(row.image).startsWith('data:video')
    && !/\.(mp4|webm|mov)(\?|$)/i.test(String(row.image))
  const imageUrls = media.filter((m) => m.type === 'image').map((m) => m.url)
  const posterUrls = media.filter((m) => m.type === 'video' && m.poster).map((m) => m.poster)
  return (rowImageOk ? row.image : '') || imageUrls[0] || posterUrls[0] || mediaCoverUrl(media) || ''
}

function slimCover(cover) {
  if (!cover) return ''
  if (cover.startsWith('data:') && cover.length > MAX_INLINE_COVER) return ''
  if (isVideoUrl(cover)) return ''
  return cover
}

/**
 * @param {'card'|'full'} mode - card omits heavy media (feed/boot); full for detail.
 */
export function rowToListing(row, { isMine = false, mode = 'full' } = {}) {
  if (!row) return null
  const media = parseMedia(row)
  const cover = slimCover(resolveCover(row, media))
  const hasVideo = media.some((m) => m.type === 'video' || isVideoUrl(m.url))

  if (mode === 'card') {
    const cardMedia = hasVideo
      ? [{ type: 'video', url: '', ...(cover ? { poster: cover } : {}) }]
      : (cover ? [{ type: 'image', url: cover }] : [])

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      category: row.category,
      price: row.price,
      priceLabel: row.price_label,
      city: row.city,
      neighborhood: row.neighborhood,
      image: cover,
      images: cover ? [cover] : [],
      media: cardMedia,
      hasVideo,
      description: row.description,
      condition: row.condition,
      seller: row.seller_name,
      sellerAvatar: resolveUserAvatar(row.seller_avatar),
      sellerVerified: !!row.seller_verified,
      sellerRating: row.seller_rating,
      sellerReviews: row.seller_reviews,
      sellerPhone: row.seller_phone || row.owner_phone || '',
      isPro: !!row.is_pro,
      isMine: !!isMine,
      status: row.status,
      badges: JSON.parse(row.badges_json || '[]'),
      features: JSON.parse(row.features_json || '[]'),
      attributes: JSON.parse(row.attributes_json || '{}'),
      views: row.views,
      saves: row.saves,
      lat: row.lat,
      lng: row.lng,
      time: row.time_label,
      createdAt: row.created_at,
    }
  }

  const imageUrls = media.filter((m) => m.type === 'image').map((m) => m.url)
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    price: row.price,
    priceLabel: row.price_label,
    city: row.city,
    neighborhood: row.neighborhood,
    image: cover,
    images: imageUrls.length ? imageUrls : (cover ? [cover] : []),
    media,
    hasVideo,
    description: row.description,
    condition: row.condition,
    seller: row.seller_name,
    sellerAvatar: resolveUserAvatar(row.seller_avatar),
    sellerVerified: !!row.seller_verified,
    sellerRating: row.seller_rating,
    sellerReviews: row.seller_reviews,
    sellerPhone: row.seller_phone || row.owner_phone || '',
    isPro: !!row.is_pro,
    isMine: !!isMine,
    status: row.status,
    badges: JSON.parse(row.badges_json || '[]'),
    features: JSON.parse(row.features_json || '[]'),
    attributes: JSON.parse(row.attributes_json || '{}'),
    views: row.views,
    saves: row.saves,
    lat: row.lat,
    lng: row.lng,
    time: row.time_label,
    createdAt: row.created_at,
  }
}

export function listingInputToRow(input, userId) {
  const price = Number(input.price) || 0
  const media = Array.isArray(input.media) && input.media.length
    ? input.media
    : (Array.isArray(input.images) ? input.images : [input.image].filter(Boolean)).map((item) => {
      if (typeof item === 'string') {
        const isVideo = item.startsWith('data:video') || /\.(mp4|webm|mov)(\?|$)/i.test(item)
        return { type: isVideo ? 'video' : 'image', url: item }
      }
      return item
    }).filter(Boolean)

  return {
    user_id: userId,
    title: input.title,
    category: input.category,
    price,
    price_label: input.priceLabel || (price ? `$${price.toLocaleString()}` : 'Contact for price'),
    city: input.city || input.region || 'Vancouver',
    neighborhood: input.neighborhood || input.city || input.region,
    image: (() => {
      if (input.image && !String(input.image).startsWith('data:video')) return input.image
      const img = media.find((m) => m.type === 'image')?.url
      if (img) return img
      const poster = media.find((m) => m.type === 'video' && m.poster)?.poster
      return poster || ''
    })(),
    images_json: JSON.stringify(media.slice(0, 8)),
    description: input.description || '',
    condition: input.condition || 'Good',
    seller_name: input.seller || 'You',
    seller_avatar: resolveUserAvatar(input.sellerAvatar),
    seller_verified: 1,
    seller_rating: input.sellerRating ?? 5,
    seller_reviews: input.sellerReviews ?? 0,
    is_pro: input.isPro ? 1 : 0,
    is_mine: 1,
    status: input.status || 'active',
    badges_json: JSON.stringify(input.badges || ['New Listing']),
    features_json: JSON.stringify(input.features || []),
    attributes_json: JSON.stringify(input.attributes || {}),
    views: 0,
    saves: 0,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    time_label: 'Just now',
  }
}

export function rowToChatThread(row, messages = [], peerLastReadAt = null) {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image,
    listingCategory: row.listing_category,
    otherName: row.other_name,
    otherAvatar: resolveUserAvatar(row.other_avatar),
    unread: row.unread,
    updated: row.updated_label,
    peerLastReadAt: peerLastReadAt || null,
    messages: messages.map((m) => {
      const seen =
        m.from_side === 'me' &&
        !!peerLastReadAt &&
        !!m.created_at &&
        String(m.created_at) <= String(peerLastReadAt)
      return {
        id: m.id,
        from: m.from_side,
        text: m.text,
        time: m.time_label,
        seen: !!seen,
      }
    }),
  }
}
