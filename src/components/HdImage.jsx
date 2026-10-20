/** High-quality image for retina / Full-HD surfaces */
export default function HdImage({
  src,
  alt = '',
  className = '',
  width,
  height,
  eager = false,
  onError,
  ...rest
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`hd-img ${className}`}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      draggable={false}
      onError={onError}
      {...rest}
    />
  )
}
