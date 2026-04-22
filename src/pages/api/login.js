import bcrypt from "bcryptjs";
import { signToken } from "../../auth/auth";
import { db } from "../../db/db";
import { rateLimit } from "../../lib/rateLimiter";

export async function POST({ request, clientAddress }) {
    const ip = clientAddress || "unknown";

    const formData = await request.formData();
    const username = formData.get("username") || "";
    const password = formData.get("password") || "";

    // 🔒 Rate limiting (semplice ma efficace)
    const ipLimit = rateLimit({
        key: `login:ip:${ip}`,
        windowMs: 5 * 60_000,
        max: 20,
    });

    const comboLimit = rateLimit({
        key: `login:${ip}:${username}`,
        windowMs: 5 * 60_000,
        max: 5,
    });

    if (!ipLimit.success || !comboLimit.success) {
        return new Response(
            JSON.stringify({ message: "Troppi tentativi. Riprova più tardi." }),
            { status: 429 }
        );
    }

    // 🐢 Delay anti brute force (semplice)
    const delay = Math.min(comboLimit.count * 300, 2000);
    await new Promise(res => setTimeout(res, delay));

    // 🐢 Delay minimo anche per evitare timing attack
    await new Promise(res => setTimeout(res, 200));

    const user = await db
        .execute("SELECT * FROM Utente WHERE username = ?", [username])
        .then((result) => result.rows[0]);

    // ❗ risposta uniforme (no user enumeration)
    if (!user) {
        return new Response(
            JSON.stringify({ message: "Credenziali non valide" }),
            { status: 401 }
        );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return new Response(
            JSON.stringify({ message: "Credenziali non valide" }),
            { status: 401 }
        );
    }

    const token = signToken(user);

    const response = new Response(null, {
        status: 302,
        headers: {
            Location: "/admin",
        },
    });

    const isProd = process.env.NODE_ENV === "production";

    response.headers.set(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${
            isProd ? "; Secure" : ""
        }`
    );

    return response;
}