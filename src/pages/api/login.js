import bcrypt from "bcryptjs"
import { signToken } from "../../auth/auth";

export async function POST({ request, cookies }) {
    const { username, password } = await request.json();

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

    return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
}