import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const demoRole = request.cookies.get('interviewsetu_demo_role')?.value as
    | 'candidate'
    | 'interviewer'
    | 'admin'
    | undefined

  const effectiveUser = user || (demoRole ? { id: 'demo', email: 'demo@interviewsetu.com', user_metadata: { role: demoRole } } : null)
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
    const role = (effectiveUser as any).user_metadata?.role || demoRole || 'candidate'
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
    const role = (effectiveUser as any).user_metadata?.role || demoRole || 'candidate'

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
