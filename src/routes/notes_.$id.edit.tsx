import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { auth } from '#/auth/auth'
import { getDb } from '#/db'
import { notes } from '#/db/schema'

// 服务端：按 id 取「属于当前用户」的那一条；别人的 id 查不出来
const getNote = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: '/login' })

    const row = await getDb()
      .select()
      .from(notes)
      .where(and(eq(notes.id, data.id), eq(notes.userId, session.user.id)))
      .get() // .get() = 只取第一行（没有就是 undefined）

    if (!row) throw redirect({ to: '/notes' }) // 不存在 / 不是你的 → 直接弹回列表
    return { title: row.title, content: row.content }
  })

// 服务端：UPDATE —— where 同样要两个条件，否则能改别人写的笔记
const updateNote = createServerFn({ method: 'POST' })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: '/login' })

    const updated = await getDb()
      .update(notes)
      .set({ title: data.title, content: data.content }) // 只改这两列
      .where(and(eq(notes.id, data.id), eq(notes.userId, session.user.id)))
      .returning({ id: notes.id }) // 返回真正被改的行

    return { updated: updated.length }
  })

export const Route = createFileRoute('/notes_/$id/edit')({
  loader: ({ params }) => getNote({ data: { id: params.id } }), // params.id = URL 里的 $id
  component: EditPage,
})

function EditPage() {
  const note = Route.useLoaderData()
  const { id } = Route.useParams()
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { updated } = await updateNote({ data: { id, title, content } })
    setBusy(false)
    if (updated === 0) {
      alert('没改到：这条不属于当前登录用户')
      return
    }
    await router.invalidate() // 列表页的 loader 重跑
    router.navigate({ to: '/notes' }) // 改完回列表
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">编辑笔记</h1>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-md flex-col gap-3">
        <input
          className="rounded border border-gray-300 p-2"
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="rounded border border-gray-300 p-2"
          placeholder="内容"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {busy ? '保存中…' : '保存修改'}
        </button>
      </form>
    </main>
  )
}
