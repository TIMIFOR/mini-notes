import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert