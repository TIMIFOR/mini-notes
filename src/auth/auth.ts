import { betterAuth } from 'better-auth/minimal'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(getDb(), { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
})
