import { projects } from './content/resume'
import { useHashScroll } from './lib/hooks'
import { LangProvider } from './lib/i18n'
import { LookProvider } from './lib/look'
import { useLook } from './lib/look-context'
import { CodeFooter } from './looks/code/CodeLook'
import { CodeNav } from './looks/code/CodeNav'
import { CodeShell } from './looks/code/CodeShell'
import { Contact, Footer } from './looks/editorial/Contact'
import { About, Experience } from './looks/editorial/Experience'
import { Hero } from './looks/editorial/Hero'
import { Nav } from './looks/editorial/Nav'
import { Projects, Skills } from './looks/editorial/Skills'

/**
 * Two complete skins over one content file. Both are shipped so they can be
 * compared on the real thing; whichever loses gets deleted, and its directory
 * goes with it.
 */
function Looks() {
  const { look } = useLook()

  if (look === 'code') {
    return (
      <>
        <CodeNav />
        <main>
          <CodeShell />
        </main>
        <CodeFooter />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        {projects.length > 0 && <Projects />}
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function App() {
  useHashScroll()

  return (
    <LookProvider>
      <LangProvider>
        <Looks />
      </LangProvider>
    </LookProvider>
  )
}

export default App
