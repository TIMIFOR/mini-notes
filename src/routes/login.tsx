import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authClient } from '#/auth/client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    // 这一行 = POST /api/auth/sign-in/email，成功后服务端下发 session cookie
    const { error } = await authClient.signIn.email({ email, password })
    setBusy(false)
    if (error) {
      setError(error.message ?? '登录失败')
      return
    }
    await navigate({ to: '/notes' })
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">登录</h1>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-sm flex-col gap-3">
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
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {busy ? '提交中…' : '登录'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">❌ {error}</p>}

      <p className="mt-6 text-sm text-gray-600">
        还没有账号？<Link to="/signup" className="underline">去注册</Link>
      </p>
    </main>
  )
}
