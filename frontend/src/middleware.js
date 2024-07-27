import { NextResponse } from "next/server";

export function middleware(request) {
	const access_token = request.cookies.get("access_token");
	const refresh_token = request.cookies.get("refresh_token");

	console.log("access token", access_token);
	console.log("refresh token", refresh_token);

	if (!access_token || !refresh_token)
		return NextResponse.redirect(new URL("/auth/login", request.url));

	if (
		access_token &&
		refresh_token &&
		(request.url == "http://localhost:3000/auth/login" ||
			request.url == "http://localhost:3000/auth/signup")
	)
		return NextResponse.redirect(new URL("/", request.url));
	return NextResponse.next()
}

export const config = {
	matcher: [
		"/auth/:path*",
		"/dashboard/:path*",
		"/profile/:path*",
		"/game/:path*",
	],
};
