import { neon } from "@neondatabase/serverless"

// Use Pool for long-lived connections (e.g., in development or specific server environments)
// Use neon for serverless functions (recommended for Vercel deployments)

// For Vercel deployments, use the neon function directly
export const sql = neon(process.env.DATABASE_URL!)

// If you were running a long-lived server (e.g., a custom Node.js server), you might use Pool:
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export { pool };
