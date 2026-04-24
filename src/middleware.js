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
    const isWriteMethod = ["POST", "PUT", "DELETE"].includes(method);
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

    return next();
});