
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Mini Notes</h1>
            <p className="mt-4 text-gray-600">我的 Mini Notes，已经自动部署上线 🎉</p>
            <Link to="/counter" className="mt-6 inline-block text-blue-500 underline">
        去玩计数器 →
      </Link>
    </main>
  )
}