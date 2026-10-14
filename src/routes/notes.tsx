import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'      // ⭐ 仓库钥匙串
import { drizzle } from 'drizzle-orm/d1'      // ⭐ D1 版的翻译官
import { notes } from '#/db/schema'           // ⭐ 我们画的图纸

// 只在服务器执行的函数：去数据库取全部笔记
const getNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const db = drizzle(env.DB)
  return db.select().from(notes).all()
})

export const Route = createFileRoute('/notes')({
  loader: () => getNotes(),                   // 渲染前先把数据备好
  component: NotesPage,
})

function NotesPage() {
  const rows = Route.useLoaderData()          // 取 loader 拿到的数据

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">笔记列表</h1>
      <p className="mt-2 text-gray-600">共 {rows.length} 条，来自数据库</p>

      <ul className="mt-6 space-y-4">
        {rows.map((note) => (
          <li key={note.id} className="rounded border border-gray-300 p-4">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="mt-1 text-gray-700">{note.content}</p>
            <p className="mt-2 text-sm text-gray-400">
              {note.userId} · {note.createdAt.toLocaleString('zh-CN')}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}