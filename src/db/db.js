
import { createClient } from "@libsql/client";

const db_url = import.meta.env.DB_URL
const db_token = import.meta.env.DB_TOKEN

export const db = createClient({
    url: db_url,
    authToken: db_token
})