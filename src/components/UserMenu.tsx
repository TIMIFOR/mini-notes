import { Link } from '@tanstack/react-router'
import { authClient } from '#/auth/client'

export default function UserMenu() {
  // useSession() = React hook，内部向 /api/auth/get-session 请求当前登录用户
  // data 类型：{ session, user } | null
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <span className="text-sm opacity-60">…</span>   // 首次请求还没回来
  }

  if (!session) {
    // 未登录：给两个入口
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link to="/login" className="nav-link">登录</Link>
        <Link to="/signup" className="nav-link">注册</Link>
      </div>
    )
  }

  // 已登录：显示邮箱 + 登出
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="opacity-80">{session.user.email}</span>
      <button
        type="button"
        className="nav-link cursor-pointer"
        onClick={() => authClient.signOut()}   // POST /api/auth/sign-out：服务端删 session 行 + 清 cookie
      >
        登出
      </button>
    </div>
  )
}
