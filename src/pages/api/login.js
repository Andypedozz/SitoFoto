import bcrypt from "bcryptjs";
import { signToken } from "../../auth/auth";
import { db } from "../../db/db";

export async function POST({ request }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    const user = await db
        .execute("SELECT * FROM Utente WHERE username = ?", [username])
        .then((result) => result.rows[0]);

    if (!user) {
        return new Response(
            JSON.stringify({ message: "User not found" }),
            { status: 404 }
        );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return new Response(
            JSON.stringify({ message: "Invalid password" }),
            { status: 401 }
        );
    }

    const token = signToken(user);

    // redirect response
    const response = new Response(null, {
        status: 302,
        headers: {
            Location: "/admin"
        }
    });

    // cookie manuale (compatibile Vercel / Edge)
    const isProd = process.env.NODE_ENV === "production";

    response.headers.set(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${
            isProd ? "; Secure" : ""
        }`
    );

    return response;
}