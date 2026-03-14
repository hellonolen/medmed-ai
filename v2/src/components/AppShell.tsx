import { ReactNode } from 'react'
import Nav from './Nav'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <main style={{ flex: 1, paddingTop: 56 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
