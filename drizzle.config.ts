import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',                 // 我们的数据库是 SQLite（D1 的引擎）
  schema: './src/db/schema.ts',      // 图纸在哪
  out: './drizzle',                  // 生成的 SQL 放哪个目录
})