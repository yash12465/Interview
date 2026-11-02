// Demo-login role, kept in a cookie so the middleware can route /app without Supabase.

export const DEMO_ROLE_COOKIE = 'interviewsetu_demo_role'
const ONE_DAY = 60 * 60 * 24

function writeCookie(value: string, maxAge: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is missing in older Safari and Firefox, which we support.
  document.cookie = `${DEMO_ROLE_COOKIE}=${value}; path=/; max-age=${maxAge}`
}

export const setDemoRoleCookie = (role: string) => writeCookie(role, ONE_DAY)
export const clearDemoRoleCookie = () => writeCookie('', 0)
