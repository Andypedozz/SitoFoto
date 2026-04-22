// src/middleware.js
import { defineMiddleware } from "astro:middleware";
import { verifyToken } from "./auth/auth";
import { rateLimit } from "./lib/rateLimiter";

const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, locals, clientAddress } = context;

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