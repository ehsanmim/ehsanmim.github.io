import { LangProvider } from './lib/i18n'
import { Shell } from './looks/editorial/Shell'

function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}

export default App
