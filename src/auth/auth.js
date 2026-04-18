import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non definito nel file .env");
}

export function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.username},
        JWT_SECRET,
        { expiresIn: "1h" }
    )
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}