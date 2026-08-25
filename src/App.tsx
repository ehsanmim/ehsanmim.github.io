import { useHashScroll } from './lib/hooks'
import { LangProvider } from './lib/i18n'
import { CodeFooter } from './looks/code/CodeLook'
import { CodeShell } from './looks/code/CodeShell'

function App() {
  useHashScroll()

  return (
    <LangProvider>
      <main>
        <CodeShell />
      </main>
      <CodeFooter />
    </LangProvider>
  )
}

export default App
