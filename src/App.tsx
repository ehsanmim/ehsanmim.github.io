import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">cv / e.test</h1>
        <p className="max-w-md text-slate-400">
          React + Vite + Tailwind, served by the slot container through Traefik.
          Edit <code className="rounded bg-slate-800 px-1.5 py-0.5">src/App.tsx</code>{' '}
          and the page updates without a reload.
        </p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium transition hover:bg-indigo-400"
        >
          count is {count}
        </button>
      </div>
    </main>
  )
}

export default App
