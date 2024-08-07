import { NextResponse } from "next/server";

export async function middleware(request) {
	const access_token = request.cookies.get("access_token");
	const refresh_token = request.cookies.get("refresh_token");

	const response = NextResponse.next();

	const isAuthPage = request.url.includes("/login") || request.url.includes("/signup");
	if (isAuthPage)
		return response
	// Check the validity of tokens with the backend
	const backendResponse = await fetch("http://localhost:8000/verifyTokens", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Cookie": `access_token=${access_token?.value}; refresh_token=${refresh_token?.value}`,
		},
	});

	// If the backend responds with 401, redirect to login
	if (backendResponse.status === 401) {
		console.log("-- 401 --");
		return NextResponse.redirect(new URL('/login', request.url));
	}

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
