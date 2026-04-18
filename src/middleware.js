import { defineMiddleware } from "astro:middleware";
import { verifyToken } from "./auth/auth";

const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, locals } = context;

    const token = cookies.get("token")?.value;

    const isProtected = protectedRoutes.some(route =>
        url.pathname.includes(route)
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