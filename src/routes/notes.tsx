import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server' // 本次请求的 headers（内含 cookie）
import { and, eq } from 'drizzle-orm'                            // eq / and → SQL 的 WHERE / AND
import { useState } from 'react'
import type { FormEvent } from 'react'
import { auth } from '#/auth/auth'                               // 服务端 Better Auth（权威）
import { getDb } from '#/db'                                     // 合并好 schema 的 Drizzle 实例
import { notes } from '#/db/schema'                              // 图纸

// 只在服务器执行：问「这条请求是谁」
const getSession = createServerFn({ method: 'GET' }).handler(async () =>
  auth.api.getSession({ headers: getRequestHeaders() }),
)

// 只在服务器执行：只取「当前登录用户」的笔记
const getNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: '/login' })
  return getDb()
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id)) // ← 查询也必须带 user_id，否则上面那个「查询漏了」的实验就是后果
    .all()
})

// 只在服务器执行：INSERT 一条笔记
// user_id 只能来自 session —— 浏览器传什么 id 都不看，所以伪造不了
const createNote = createServerFn({ method: 'POST' })
  .validator((data: { title: string; content: string }) => data) // 声明请求体的形状（运行时不做校验，4.5 补）
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: '/login' })
    await getDb().insert(notes).values({
      userId: session.user.id, // ← 不是 'user-1'，也不是前端传的
      title: data.title,
      content: data.content,
    })
    // id / created_at / pinned 都不用写：schema.ts 里有默认值
  })

// 只在服务器执行：删除一条笔记
// 两个条件缺一不可：id 对上「那一条」，user_id 对上「是不是你的」
const deleteNote = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: '/login' })

    const deleted = await getDb()
      .delete(notes)
      .where(and(eq(notes.id, data.id), eq(notes.userId, session.user.id)))
      .returning({ id: notes.id }) // RETURNING：返回真正被删掉的行（没删到就是空数组）

    return { deleted: deleted.length }
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
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    await createNote({ data: { title, content } }) // 浏览器调用服务端函数：内部走 HTTP，不是普通函数调用
    setTitle('')
    setContent('')
    await router.invalidate() // 让 loader 重新跑一遍 → 列表刷新
    setBusy(false)
  }

  async function onDelete(id: string) {
    const { deleted } = await deleteNote({ data: { id } })
    if (deleted === 0) alert('没删到：这条不属于当前登录用户')
    await router.invalidate()
  }

  
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">笔记列表</h1>

      <form onSubmit={onCreate} className="mt-6 flex max-w-md flex-col gap-3">
        <input
          className="rounded border border-gray-300 p-2"
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="rounded border border-gray-300 p-2"
          placeholder="内容"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {busy ? '保存中…' : '新建笔记'}
        </button>
      </form>

      <p className="mt-6 text-gray-600">共 {rows.length} 条，来自数据库</p>

      <ul className="mt-4 space-y-4">
        {rows.map((note) => (
          <li key={note.id} className="rounded border border-gray-300 p-4">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="mt-1 text-gray-700">{note.content}</p>
            <p className="mt-2 text-sm text-gray-400">
              {note.userId} · {note.createdAt.toLocaleString('zh-CN')}
            </p>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="mt-3 rounded border border-red-300 px-2 py-1 text-sm text-red-600"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
