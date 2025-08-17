import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Calendar, FileText, BookOpen, Newspaper, TrendingUp, Activity } from 'lucide-react'
import { personnelAPI, committeesAPI, meetingsAPI, motionsAPI, policiesAPI, newsAPI, eventsAPI } from '../services/api'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface DashboardStats {
  personnel: number
  committees: number
  meetings: number
  motions: number
  policies: number
  news: number
  events: number
  recentActivity: any[]
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [
        personnel,
        committees,
        meetings,
        motions,
        policies,
        news,
        events
      ] = await Promise.all([
        personnelAPI.getAll(),
        committeesAPI.getAll(),
        meetingsAPI.getAll(),
        motionsAPI.getAll(),
        policiesAPI.getAll(),
        newsAPI.getAll(),
        eventsAPI.getAll()
      ])

      const recentActivity = [
        ...meetings.slice(0, 3).map(m => ({ type: 'meeting', item: m })),
        ...motions.slice(0, 3).map(m => ({ type: 'motion', item: m })),
        ...news.slice(0, 3).map(n => ({ type: 'news', item: n }))
      ].sort((a, b) => new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime())
        .slice(0, 5)

      setStats({
        personnel: personnel.length,
        committees: committees.length,
        meetings: meetings.length,
        motions: motions.length,
        policies: policies.length,
        news: news.length,
        events: events.length,
        recentActivity
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load dashboard data</p>
      </div>
    )
  }

  const statCards = [
    { title: 'Personnel', value: stats.personnel, icon: Users, color: 'bg-blue-500' },
    { title: 'Committees', value: stats.committees, icon: UserCheck, color: 'bg-green-500' },
    { title: 'Meetings', value: stats.meetings, icon: Calendar, color: 'bg-purple-500' },
    { title: 'Motions', value: stats.motions, icon: FileText, color: 'bg-yellow-500' },
    { title: 'Policies', value: stats.policies, icon: BookOpen, color: 'bg-red-500' },
    { title: 'News', value: stats.news, icon: Newspaper, color: 'bg-indigo-500' },
    { title: 'Events', value: stats.events, icon: TrendingUp, color: 'bg-pink-500' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Calendar
      case 'motion': return FileText
      case 'news': return Newspaper
      default: return Activity
    }
  }

  const formatActivityText = (activity: any) => {
    switch (activity.type) {
      case 'meeting':
        return `Meeting: ${activity.item.main_topic}`
      case 'motion':
        return `Motion: ${activity.item.title}`
      case 'news':
        return `News: ${activity.item.title}`
      default:
        return 'Recent activity'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Relife Party admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type)
                return (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatActivityText(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.item.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Active Personnel</span>
              <span className="text-lg font-semibold text-blue-600">{stats.personnel}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Total Meetings</span>
              <span className="text-lg font-semibold text-green-600">{stats.meetings}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-900">Pending Motions</span>
              <span className="text-lg font-semibold text-purple-600">
                {/* This would need to be calculated based on motion status */}
                0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}