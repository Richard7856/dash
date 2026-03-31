'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const tabs = [
    { label: 'Nómina', href: '/dashboard' },
    { label: 'Choferes', href: '/dashboard/choferes' },
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setAuthenticated(true)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync-operadores', { method: 'POST' })
      const data = await res.json()
      alert(data.message || 'Sync completado')
    } catch {
      alert('Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-semibold text-gray-900">Taimingo</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="text-xs text-gray-400 hover:text-teal-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Sincronizar operadores desde Monday"
              >
                <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncing ? 'Sincronizando...' : 'Sync operadores'}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
          <nav className="flex gap-6 -mb-px">
            {tabs.map(tab => {
              const isActive = tab.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
