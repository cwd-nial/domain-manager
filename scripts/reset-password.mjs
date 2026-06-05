/**
 * Reset a user's password by email.
 * Usage: node scripts/reset-password.mjs <email> <new-password>
 */

import { hashPassword } from "@better-auth/utils/password";
import { createClient } from "@libsql/client";

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
    console.error("Usage: node scripts/reset-password.mjs <email> <new-password>");
    process.exit(1);
}

const client = createClient({
    url: `file:${process.env.DATABASE_URL ?? "./domain.db"}`,
});

const userResult = await client.execute({
    sql: "SELECT id FROM user WHERE email = ?",
    args: [email],
});

if (userResult.rows.length === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
}

const userId = userResult.rows[0].id;
const hash = await hashPassword(newPassword);

await client.execute({
    sql: "UPDATE account SET password = ? WHERE user_id = ? AND provider_id = 'credential'",
    args: [hash, userId],
});

console.log(`Password reset for ${email}`);
