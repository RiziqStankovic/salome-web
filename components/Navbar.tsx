'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import ThemeToggle from '@/components/ThemeToggle'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut, Home, Users, Plus, CreditCard, Shield } from 'lucide-react'

interface NavbarProps {
  showAuth?: boolean
  showUserMenu?: boolean
}

export default function Navbar({ showAuth = true, showUserMenu = true }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const handleAuth = () => {
    setIsMenuOpen(false)
    
    if (window.location.pathname === '/') {
      // If already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // If not on home page, navigate first then scroll
      router.push('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 500)
    }
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              SALOME
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {showUserMenu && user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/groups')}
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Grup
                </Button>
                {user?.is_admin && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin')}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => router.push('/groups/create')}
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Grup
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/transactions')}
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Transaksi
                </Button>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.full_name}
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : showAuth ? (
              <Button
                variant="ghost"
                onClick={handleAuth}
                className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                {user ? 'Dashboard' : 'Login'}
              </Button>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {showUserMenu && user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/dashboard')
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/groups')
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Grup
                  </Button>
                  {user?.is_admin && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push('/admin')
                        setIsMenuOpen(false)
                      }}
                      className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/groups/create')
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Grup
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/transactions')
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Transaksi
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : showAuth ? (
                <Button
                  variant="ghost"
                  onClick={handleAuth}
                  className="w-full justify-start text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                >
                  {user ? 'Dashboard' : 'Login'}
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
