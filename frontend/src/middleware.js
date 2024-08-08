import { NextResponse } from "next/server";

export async function middleware(request) {
	const access_token = request.cookies.get("access_token");
	const refresh_token = request.cookies.get("refresh_token");

	const response = NextResponse.next();

	const isAuthPage = request.url.includes("/login") || request.url.includes("/signup");

	if (request.url == "http://localhost:3000/")
		return response
	else if (!refresh_token && !isAuthPage)
		return NextResponse.redirect(new URL("/login", request.url));

	if (!isAuthPage)//if you have at least the refresh token, then we will validte it in the backend
	{
		const backendResponse = await fetch("http://localhost:8000/verifyTokens", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Cookie": `access_token=${access_token?.value}; refresh_token=${refresh_token?.value}`,
			},
		});

		if (backendResponse.status === 401) {
			console.log("-- 401 --");
			const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
			redirectResponse.cookies.set("isAuth", "false", { path: "/" });
			return redirectResponse;
		}
		else if (backendResponse.status == 200)
		{
			console.log("-- 200 --");
			response.cookies.set("isAuth", "true", { path: "/" });
			return response;
		}
	}

	const hasToken = access_token && refresh_token;
	if (hasToken)
		response.cookies.set("isAuth", "true", { path: "/" });
	else
		response.cookies.set("isAuth", "false", { path: "/" });

	
	if (access_token && refresh_token && isAuthPage)
		return NextResponse.redirect(new URL("/profile", request.url));

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
		"/chat/:path*",
	],
};
