import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'      // ⭐ 仓库钥匙串
import { getRequestHeaders } from '@tanstack/react-start/server'  // 本次请求的 headers（内含 cookie）
import { auth } from '#/auth/auth'            // 服务端 Better Auth 实例（权威）
import { drizzle } from 'drizzle-orm/d1'      // ⭐ D1 版的翻译官
import { notes } from '#/db/schema'           // ⭐ 我们画的图纸

// 只在服务器执行的函数：去数据库取全部笔记
const getNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const db = drizzle(env.DB)
  return db.select().from(notes).all()
})

// 只在服务器执行：把浏览器带来的 cookie 交给 Better Auth，问「这是谁？」
const getSession = createServerFn({ method: 'GET' }).handler(async () =>
  auth.api.getSession({ headers: getRequestHeaders() }),
)

export const Route = createFileRoute('/notes')({
  // beforeLoad 跑在 loader 之前；SSR 时它在服务器上执行 → 未登录当场改道
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    return { session }        // 塞进路由 context，3.9 要用它取真实 user id
  },
  loader: () => getNotes(),   // 渲染前先把数据备好
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
