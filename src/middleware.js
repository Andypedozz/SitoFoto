// src/middleware.js
import { defineMiddleware } from "astro:middleware";
import { verifyToken } from "./auth/auth";
import { rateLimit } from "./lib/rateLimiter";

const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, locals, clientAddress, request } = context;

    const ip = clientAddress || "unknown";

    // 🌍 Rate limit globale (anti spam leggero)
    const limit = rateLimit({
        key: `global:${ip}`,
        windowMs: 60_000, // 1 minuto
        max: 100,
    });

    if (!limit.success) {
        return new Response("Too many requests", { status: 429 });
    }

    const token = cookies.get("token")?.value;
    const method = request.method;

    // 🔒 Blocca POST, PUT, DELETE se non autenticato (eccetto /api/login)
    const isWriteMethod = ["POST", "PATCH", "PUT", "DELETE"].includes(method);
    const isLoginRoute = url.pathname === "/api/login";

    if (isWriteMethod && !isLoginRoute) {
        if (!token) {
            return new Response("Unauthorized", { status: 401 });
        }

        const user = verifyToken(token);

        if (!user) {
            cookies.delete("token", { path: "/" });
            return new Response("Unauthorized", { status: 401 });
        }

        locals.user = user;
    }

    // 🔐 Protezione route tipo /admin
    const isProtected = protectedRoutes.some(route =>
        url.pathname.startsWith(route)
    );

    if (isProtected) {
        if (!token) {
            return context.redirect("/login");
        }

        const user = verifyToken(token);

        if (!user) {
            cookies.delete("token", { path: "/" });
            return context.redirect("/login");
        }

        locals.user = user;
    }

    return applyCacheControl(context, next);
});

async function applyCacheControl(context, next) {
    const { request, url } = context;
    const response = await next();
    if (!response) return response;

    const pathname = url.pathname;
    if (!pathname.startsWith("/api/")) return response;

    const newHeaders = new Headers(response.headers);

    if (pathname === "/api/login" || pathname === "/api/signup" || pathname === "/api/logout") {
        newHeaders.set("Cache-Control", "no-store");
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    if (request.method === "GET") {
        newHeaders.set("Cache-Control", "public, max-age=60, s-maxage=60");
    } else {
        newHeaders.set("Cache-Control", "no-store");
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}