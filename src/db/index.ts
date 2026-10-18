import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from '#/db/schema'
import * as authSchema from '#/db/auth.schema'

export function getDb() {
  return drizzle(env.DB, { schema: { ...schema, ...authSchema } })
}
