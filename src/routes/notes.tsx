import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'  // 本次请求的 headers（内含 cookie）
import { eq } from 'drizzle-orm'                                  // 生成 SQL 的 WHERE
import { auth } from '#/auth/auth'                                // 服务端 Better Auth（权威）
import { getDb } from '#/db'                                      // 3.4 合并好的 Drizzle 实例（带 schema）
import { notes } from '#/db/schema'                               // 图纸

// 只在服务器执行：把 cookie 交给 Better Auth，问「这是谁？」
const getSession = createServerFn({ method: 'GET' }).handler(async () =>
  auth.api.getSession({ headers: getRequestHeaders() }),
)

// 只在服务器执行：只取「当前登录用户」的笔记
const getNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: '/login' })   // 双保险（beforeLoad 已挡一次）

  return getDb()
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id))      // ← 关键：每条查询都带 user_id
    .all()
})

export const Route = createFileRoute('/notes')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  loader: () => getNotes(),
  component: NotesPage,
})

function NotesPage() {
  const rows = Route.useLoaderData()

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
