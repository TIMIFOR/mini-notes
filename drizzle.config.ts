import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',                                          // 数据库是 SQLite（D1 的引擎）
  schema: ['./src/db/schema.ts', './src/db/auth.schema.ts'],  // 图纸：手写的 + 生成的，两份都要
  out: './drizzle',                                           // 生成的迁移 SQL 放哪
})
