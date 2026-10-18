import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authClient } from '#/auth/client'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')   // 服务端返回的报错，如「邮箱已存在」
  const [busy, setBusy] = useState(false)  // 防重复点击

  async function onSubmit(e: FormEvent) {
    e.preventDefault()                     // 阻止浏览器默认的整页提交（那样会刷新页面）
    setBusy(true)
    setError('')
    // 这一行 = POST /api/auth/sign-up/email
    const { error } = await authClient.signUp.email({ name, email, password })
    setBusy(false)
    if (error) {
      setError(error.message ?? '注册失败')
      return
    }
    // 注册成功后 Better Auth 会自动登录（已写好 session cookie）
    await navigate({ to: '/notes' })
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">注册</h1>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-sm flex-col gap-3">
        <input
          className="rounded border border-gray-300 p-2"
          placeholder="昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded border border-gray-300 p-2"
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border border-gray-300 p-2"
          type="password"
          placeholder="密码（至少 8 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}                   // Better Auth 默认最短 8 位
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {busy ? '提交中…' : '注册'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">❌ {error}</p>}

      <p className="mt-6 text-sm text-gray-600">
        已有账号？<Link to="/login" className="underline">去登录</Link>
      </p>
    </main>
  )
}
