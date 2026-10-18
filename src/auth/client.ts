// 浏览器端 SDK：只负责向 /api/auth/* 发 HTTP 请求，碰不到数据库、也不知道 secret
import { createAuthClient } from 'better-auth/react'

// 参数留空 → baseURL 取当前页面 origin，basePath 默认 /api/auth（就是我们 3.5 挂的路由）
export const authClient = createAuthClient()
