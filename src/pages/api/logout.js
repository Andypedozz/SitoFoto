
export async function POST({ cookies }) {
    cookies.delete("token", { path: "/" });

    return new Response(JSON.stringify({ message: "Logout successful" }), { status: 200 });
}