import { NextResponse } from "next/server";

export function middleware(request) {
	const access_token = request.cookies.get("access_token");
	const refresh_token = request.cookies.get("refresh_token");

	const isAuthPage =
		request.url.includes("/login") ||
		request.url.includes("/signup");

	if (access_token && refresh_token && isAuthPage)
		return NextResponse.redirect(new URL("/profile", request.url));
	else if ((!access_token || !refresh_token) && isAuthPage)
		NextResponse.next()
	else if ((!access_token || !refresh_token) && !isAuthPage)
		return NextResponse.redirect(new URL("/login", request.url));
	
	return NextResponse.next()
}

export const config = {
	matcher: [
		"/login/:path*",
		"/signup/:path*",
		"/dashboard/:path*",
		"/profile/:path*",
		"/game/:path*",
	],
};
