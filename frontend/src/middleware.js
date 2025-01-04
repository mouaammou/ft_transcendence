import { NextResponse } from 'next/server';


export async function middleware(request) {
  const access_token = request.cookies.get('access_token');
  const refresh_token = request.cookies.get('refresh_token');

  const response = NextResponse.next();

  // Check if 2FA cookie is set, if so, redirect to /2fa
  if (request.nextUrl.pathname !== "/login")
  {
    //remove the cookies
    response.cookies.delete('2fa_token');
    response.cookies.set('2fa_token', '', { path: '/', expires: new Date(0) });
  }
  const is2fa = request.cookies.get("2fa_token");
  if (is2fa && request.nextUrl.pathname !== "/2fa") {
    return NextResponse.redirect(new URL("/2fa", request.url));
  }

  //if the request is /, then redirect to /login if not authenticated
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAuthPage = request.url.includes("/login") || request.url.includes("/signup");
  const isRoot = request.nextUrl.pathname === "/";

  if (isRoot) return response;
  else if (!refresh_token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!isAuthPage) {
    // If you have at least the refresh token, then validate it in the backend
    try {
        const backendResponse = await fetch(`${process.env.NEXT_PRIVATE_URL}/backend/verifyTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${access_token?.value}; refresh_token=${refresh_token?.value}`,
        },
      });
      if (backendResponse.status === 401) {
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
        redirectResponse.cookies.set('isAuth', 'false', { path: '/' });
        redirectResponse.cookies.delete('access_token');
        redirectResponse.cookies.delete('refresh_token');
        return redirectResponse;
      } else if (backendResponse.status === 200) {
        response.cookies.set('isAuth', 'true', { path: '/' });
        return response;
      }
    } catch (error) {

      return NextResponse.redirect(new URL('/500', request.url));
    }
  }

  const hasToken = access_token && refresh_token;
  response.cookies.set('isAuth', hasToken ? 'true' : 'false', { path: '/' });

  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return response;
}

// protect paths here:

export const config = {
	matcher: [
		"/",
		"/edit_profile/:path*", 
		"/settings/:path*", 
		"/dashboard/:path*",
		"/profile/:path*",
		"/game/:path*",
		"/chat/:path*",
		"/create_join_tournament/:path*",
		"/tournament_board/:path*",
		"/waiting_random_game/:path*",
		"/waiting_random_c4/:path*",
    "/connect_four/:path*",
    "/local_c4/:path*",
    "/connect_four_mode/:path*",
    "/bot/:path*",
    "/list_of_friends/:path*",
    "/mode/:path*",
    "/play/:path*",
    "/waiting_friends_game/:path*",
    "/local_game/:path*",
    "/tournament/:path*",
    "/l_game/:path*",
	],
};