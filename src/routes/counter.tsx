import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/counter')({
  component: CounterPage,
})

function CounterPage() {
  const [count, setCount] = useState(0)

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">计数器</h1>
      <p className="mt-4 text-gray-600">这个数字只活在你的浏览器里。</p>
      <button
        className="mt-6 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => setCount(count + 1)}
      >
        点击了 {count} 次
      </button>
    </main>
  )
}