import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your party organization</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.email}
            </p>
            <p className="text-xs text-gray-600">Administrator</p>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}