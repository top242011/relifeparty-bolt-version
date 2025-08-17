import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  BookOpen, 
  Newspaper,
  LogOut,
  Home
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Personnel', href: '/personnel', icon: Users },
  { name: 'Committees', href: '/committees', icon: UserCheck },
  { name: 'Meetings', href: '/meetings', icon: Calendar },
  { name: 'Motions', href: '/motions', icon: FileText },
  { name: 'Policies', href: '/policies', icon: BookOpen },
  { name: 'News & Events', href: '/news-events', icon: Newspaper },
]

export function Sidebar() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
    }
  }

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">Relife Party</h2>
        <p className="text-gray-400 text-sm">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}