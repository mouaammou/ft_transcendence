import { NextResponse } from 'next/server';

export async function middleware(request) {
  const access_token = request.cookies.get('access_token');
  const refresh_token = request.cookies.get('refresh_token');

  const response = NextResponse.next();

	//check if cookie 2fa is set, khlih idoz
	const is2fa = request.cookies.get("2fa_token");
	
	if (is2fa && !request.nextUrl.pathname !== "/2fa") {
		return NextResponse.redirect(new URL("/2fa", request.url));
	}


	const isAuthPage = request.url.includes("/login") || request.url.includes("/signup");
	const isRoot = request.nextUrl.pathname === "/";

  if (isRoot) return response;
  else if (!refresh_token && !isAuthPage)
    return NextResponse.redirect(new URL('/login', request.url));

  if (!isAuthPage) {
    //if you have at least the refresh token, then we will validte it in the backend
    try {
      const backendResponse = await fetch('http://localhost:8000/verifyTokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${access_token?.value}; refresh_token=${refresh_token?.value}`,
        },
      });
      if (backendResponse.status == 401) {
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
        redirectResponse.cookies.set('isAuth', 'false', { path: '/' });
        redirectResponse.cookies.delete('access_token');
        redirectResponse.cookies.delete('refresh_token');
        return redirectResponse;
      } else if (backendResponse.status == 200) {
        response.cookies.set('isAuth', 'true', { path: '/' });
        return response;
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      return NextResponse.redirect(new URL('/500', request.url));
    }
  }

  const hasToken = access_token && refresh_token;
  response.cookies.set('isAuth', hasToken ? 'true' : 'false', { path: '/' });

  if (hasToken && isAuthPage) return NextResponse.redirect(new URL('/profile', request.url));

  return response;
}

export const config = {
  matcher: [
    '/',
    '/login/:path*',
    // "/edit_profile/:path*",
    '/signup/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/game/:path*',
    '/chat/:path*',
  ],
};
