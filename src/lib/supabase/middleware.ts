import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { DEMO_ROLE_COOKIE } from '@/lib/demo-role'
import { supabaseEnv } from './env'

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = supabaseEnv()
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        supabaseResponse = NextResponse.next({
          request,
        })
        for (const { name, value, options } of cookiesToSet)
          supabaseResponse.cookies.set(name, value, options)
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const demoRole = request.cookies.get(DEMO_ROLE_COOKIE)?.value as
    | 'candidate'
    | 'interviewer'
    | 'admin'
    | undefined

  const effectiveUser =
    user ||
    (demoRole
      ? { id: 'demo', email: 'demo@interviewsetu.com', user_metadata: { role: demoRole } }
      : null)
  const path = request.nextUrl.pathname

  // Protected and Auth path rules
  const isProtectedPath = path.startsWith('/app') || path.startsWith('/staff')
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password'

  // 1. Unauthenticated users trying to access protected paths
  if (!effectiveUser && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated users trying to access login/register
  if (effectiveUser && isAuthPage) {
    const role = effectiveUser.user_metadata?.role || demoRole || 'candidate'
    const url = request.nextUrl.clone()
    if (role === 'admin') {
      url.pathname = '/staff'
    } else if (role === 'interviewer') {
      url.pathname = '/app/interviewer'
    } else {
      url.pathname = '/app/candidate'
    }
    return NextResponse.redirect(url)
  }

  // 3. Role-based isolation for protected routes
  if (effectiveUser && isProtectedPath) {
    const role = effectiveUser.user_metadata?.role || demoRole || 'candidate'

    // Non-admins cannot access staff console
    if (path.startsWith('/staff') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'interviewer' ? '/app/interviewer' : '/app/candidate'
      return NextResponse.redirect(url)
    }

    // Candidates cannot access interviewer portal
    if (role === 'candidate' && path.startsWith('/app/interviewer')) {
      const url = request.nextUrl.clone()
      url.pathname = '/app/candidate'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
