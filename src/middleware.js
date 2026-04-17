import { defineMiddleware } from "astro:middleware";
import { verifyToken } from "./auth/auth";

const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, redirect } = context;

    const token = cookies.get("token");
    const isProtected = protectedRoutes.some(route => {
        url.pathname.startsWith(route);
    })

    if (isProtected) {
        if (!token) {
            return redirect("/login");
        }

        const user = verifyToken(token);

        if (!user) {
            cookies.delete("token", { path: "/" });
            return redirect("/login");
        }

        context.locals.user = user;
    }

    return next();
})