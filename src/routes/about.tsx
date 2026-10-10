import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">关于 Mini Notes</h1>
      <p className="mt-4">这是我的第一个 TanStack Start 页面。</p>
    </main>
  )
}