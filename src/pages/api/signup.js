import bcrypt from "bcryptjs"
import { db } from "../../db/db.js";

export async function POST({ request }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    // Check if user already exists
    const users = await db.execute("SELECT * FROM Utente WHERE username = ?", [username]).then((result) => result.rows[0]);
    if (users) {
        return new Response(JSON.stringify({ message: "User already exists" }), { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
        username,
        password: hashedPassword
    };
    await db.execute("INSERT INTO Utente (username, password) VALUES (?, ?)", [newUser.username, newUser.password]);
    
    return new Response(JSON.stringify({ message: "User created successfully" }), { status: 201 });
}