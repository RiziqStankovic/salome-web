'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import VerificationGuard from '@/components/VerificationGuard'
import { 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  ChevronDown,
  Mail,
  Shield,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAvatarUrl } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Browse Apps', href: '/browse', icon: Search },
  { name: 'Grup', href: '/groups', icon: Users },
  { name: 'Transaksi', href: '/transactions', icon: CreditCard },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Shield },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Groups', href: '/admin/groups', icon: Users },
  { name: 'Apps', href: '/admin/apps', icon: Smartphone },
  { name: 'Email Submissions', href: '/admin/email-submissions', icon: Mail },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  // Close profile menu when sidebar is closed
  useEffect(() => {
    if (!sidebarOpen) {
      setProfileMenuOpen(false)
    }
  }, [sidebarOpen])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuOpen) {
        const target = event.target as Element
        const profileMenu = document.querySelector('[data-profile-menu]')
        if (profileMenu && !profileMenu.contains(target)) {
          setProfileMenuOpen(false)
        }
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 overflow-visible">
          <div className="flex h-16 items-center justify-between px-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                router.push('/')
                setSidebarOpen(false)
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SALOME</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'primary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
            
            {/* Admin Navigation */}
            {(user?.role === 'admin' || user?.is_admin) && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? 'primary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  )
                })}
              </>
            )}
          </nav>
          
          {/* Mobile User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 overflow-visible">
            <div className="relative overflow-visible" data-profile-menu>
              <div
                className="w-full flex items-center justify-start p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Mobile profile button clicked, current state:', profileMenuOpen)
                  setProfileMenuOpen(!profileMenuOpen)
                }}
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {user?.full_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </div>

              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" style={{zIndex: 9999}}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      router.push('/profile')
                      setProfileMenuOpen(false)
                      setSidebarOpen(false)
                    }}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                    onClick={() => {
                      handleLogout()
                      setProfileMenuOpen(false)
                      setSidebarOpen(false)
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SALOME</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'primary' : 'ghost'}
                  className={cn(
                    'w-full justify-start px-3',
                    isActive ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Button>
              )
            })}
            
            {/* Admin Navigation */}
            {(user?.role === 'admin' || user?.is_admin) && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? 'primary' : 'ghost'}
                      className={cn(
                        'w-full justify-start px-3',
                        isActive ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Button>
                  )
                })}
              </>
            )}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative" data-profile-menu>
              <div
                className="w-full flex items-center justify-start p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Desktop profile button clicked, current state:', profileMenuOpen)
                  setProfileMenuOpen(!profileMenuOpen)
                }}
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {user?.full_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </div>

              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      router.push('/profile')
                      setProfileMenuOpen(false)
                    }}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                    onClick={() => {
                      handleLogout()
                      setProfileMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Cari grup, subscription..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <Button variant="ghost" size="sm" title="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
    </VerificationGuard>
  )
}
