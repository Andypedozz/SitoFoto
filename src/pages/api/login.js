import bcrypt from "bcryptjs"
import { signToken } from "../../auth/auth";
import { db } from "../../db/db";

export async function POST({ request, cookies }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    const user = await db.execute("SELECT * FROM Utente WHERE username = ?", [username]).then((result) => result.rows[0]);
    if (!user) {
        return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return new Response(JSON.stringify({ message: "Invalid password" }), { status: 401 });
    }
    
    const token = signToken(user);
    
    cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60
    })

    return Response.redirect(new URL("/admin", request.url));
}