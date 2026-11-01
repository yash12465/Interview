export default function figmaImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.startsWith('/api/') && src.includes('/file/')) {
    const url = new URL(src, 'http://localhost')
    url.searchParams.set('w', width.toString())
    if (quality) {
      url.searchParams.set('q', quality.toString())
    }
    return `${url.pathname}${url.search}`
  }
  return src
}
