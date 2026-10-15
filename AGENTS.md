<!-- BEGIN:teaching-rules -->

## 教学项目（重要）

这是「Mini Notes 全栈开发课程」的实操项目。**学员是零编程基础**，一切解释都要从零讲起，并且**一次只推进一步**（等学员确认后再给下一步）。

**讲解风格（学员 2026-10-14 反馈）**：

- 用准确、直白的技术语言为主。术语用对，讲清「是什么 / 在哪 / 谁在用 / 容易和什么混淆」。
- 比喻只在真能说清时才用，**一个概念最多一个**，讲完立刻回到技术描述。不要每个词都套比喻。
- 细节讲透（具体文件名、字段名、命令参数、路径、数字）。

教学档案在 `/home/pi/alldo/Mininotes/`：

- `AGENTS.md` — 教学规则总纲
- `PROGRESS.md` — **进度真相源**，会话开始时先读它
- `ERRORS.md` — 报错档案（错误含义 → 原因 → 解决 → 关键点）
- `GLOSSARY.md` — 术语表
- `MIni notes.txt` — 课程大纲（按 Level 组织）

先读 `/home/pi/alldo/Mininotes/AGENTS.md`，再读它指定的 `PROGRESS.md` 取当前进度。

<!-- END:teaching-rules -->

<!-- BEGIN:stack-rules -->

## 技术栈（别再按 Next.js 想）

本项目是 **TanStack Start**，部署到 **Cloudflare Workers**。**不是 Next.js**。

- 路由：`src/routes/*.tsx`，每个文件里 `export const Route = createFileRoute('/路径')({ component })`
- `src/routeTree.gen.ts` 是**自动生成**的，不要手改（第一次 `npm run dev` 后出现）
- 组件**不需要** `'use client'`：默认在服务器和浏览器两端都会跑（同构）
- 浏览器专有 API（`window` / `localStorage` / `document`）必须放进 `useEffect`
- 服务端代码用 `createServerFn`（不是 Next.js 的 Server Actions、也没有 middleware）
- 构建/部署：`npm run build`（Vite）、`npm run deploy`（= `npm run build` + `wrangler deploy`）
- 配置：`vite.config.ts`（`cloudflare()` + `tailwindcss()` + `tanstackStart()` 三个插件缺一不可）、`wrangler.jsonc`
- Tailwind 走 `@tailwindcss/vite` 插件（**没有也不需要** postcss 配置）
- 环境变量：本地放 `.dev.vars`；前端可见的用 `VITE_` 前缀

历史：旧项目（Next.js 版本，含 Level 0 的代码）归档在 `../mini-notes-nextjs-archive`，可作对照，但**不要**照它的写法写新代码。

<!-- END:stack-rules -->
