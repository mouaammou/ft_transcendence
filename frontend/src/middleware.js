import { NextResponse } from "next/server";

export function middleware(request) {
	const access_token = request.cookies.get("access_token");
	const refresh_token = request.cookies.get("refresh_token");

	const response = NextResponse.next();

	const isAuthPage =
		request.url.includes("/login") || request.url.includes("/signup");

	const hasToken = access_token && refresh_token;
	if (hasToken) response.cookies.set("isAuth", "true", { path: "/" });
	else response.cookies.set("isAuth", "false", { path: "/" });

	if (request.url == "http://localhost:3000/")
		return response
	if (access_token && refresh_token && isAuthPage)
		return NextResponse.redirect(new URL("/profile", request.url));
	else if ((!access_token || !refresh_token) && isAuthPage)
		NextResponse.next();
	else if ((!access_token || !refresh_token) && !isAuthPage)
		return NextResponse.redirect(new URL("/login", request.url));

	return response;
}

export const config = {
	matcher: [
		"/",
		"/login/:path*",
		"/signup/:path*",
		"/dashboard/:path*",
		"/profile/:path*",
		"/game/:path*",
	],
};
