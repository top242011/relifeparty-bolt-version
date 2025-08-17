import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar, Newspaper } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { StatusBadge } from '../components/common/StatusBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { News, Event } from '../types'
import { newsAPI, eventsAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const newsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  publish_date: z.string().min(1, 'Publish date is required'),
  image_url: z.string().url().optional().or(z.literal('')),
})

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  event_date: z.string().min(1, 'Event date is required'),
  location: z.string().optional().or(z.literal('')),
})

type NewsFormData = z.infer<typeof newsSchema>
type EventFormData = z.infer<typeof eventSchema>

type TabType = 'news' | 'events'

export function NewsEvents() {
  const [activeTab, setActiveTab] = useState<TabType>('news')
  const [news, setNews] = useState<News[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<News | Event | null>(null)
  const [viewingItem, setViewingItem] = useState<News | Event | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    isOpen: boolean; 
    item: News | Event | null;
    type: TabType | null;
  }>({
    isOpen: false,
    item: null,
    type: null
  })

  const {
    register: registerNews,
    handleSubmit: handleSubmitNews,
    reset: resetNews,
    formState: { errors: newsErrors, isSubmitting: newsSubmitting }
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema)
  })

  const {
    register: registerEvent,
    handleSubmit: handleSubmitEvent,
    reset: resetEvent,
    formState: { errors: eventErrors, isSubmitting: eventSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [newsData, eventsData] = await Promise.all([
        newsAPI.getAll(),
        eventsAPI.getAll()
      ])
      setNews(newsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load news and events data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    if (activeTab === 'news') {
      resetNews({ title: '', content: '', publish_date: '', image_url: '' })
    } else {
      resetEvent({ title: '', description: '', event_date: '', location: '' })
    }
    setIsModalOpen(true)
  }

  const handleEdit = (item: News | Event) => {
    setEditingItem(item)
    if (activeTab === 'news') {
      const newsItem = item as News
      resetNews({
        title: newsItem.title,
        content: newsItem.content,
        publish_date: newsItem.publish_date,
        image_url: newsItem.image_url || ''
      })
    } else {
      const eventItem = item as Event
      resetEvent({
        title: eventItem.title,
        description: eventItem.description,
        event_date: eventItem.event_date,
        location: eventItem.location || ''
      })
    }
    setIsModalOpen(true)
  }

  const handleView = (item: News | Event) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = (item: News | Event) => {
    setDeleteConfirm({ isOpen: true, item, type: activeTab })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.item || !deleteConfirm.type) return

    try {
      if (deleteConfirm.type === 'news') {
        await newsAPI.delete(deleteConfirm.item.id)
        setNews(prev => prev.filter(n => n.id !== deleteConfirm.item!.id))
        toast.success('News deleted successfully')
      } else {
        await eventsAPI.delete(deleteConfirm.item.id)
        setEvents(prev => prev.filter(e => e.id !== deleteConfirm.item!.id))
        toast.success('Event deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error(`Failed to delete ${deleteConfirm.type === 'news' ? 'news' : 'event'}`)
    } finally {
      setDeleteConfirm({ isOpen: false, item: null, type: null })
    }
  }

  const onSubmitNews = async (data: NewsFormData) => {
    try {
      const formData = {
        ...data,
        image_url: data.image_url || null
      }

      if (editingItem) {
        const updated = await newsAPI.update(editingItem.id, formData)
        setNews(prev => prev.map(n => n.id === updated.id ? updated : n))
        toast.success('News updated successfully')
      } else {
        const created = await newsAPI.create(formData)
        setNews(prev => [created, ...prev])
        toast.success('News created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving news:', error)
      toast.error('Failed to save news')
    }
  }

  const onSubmitEvent = async (data: EventFormData) => {
    try {
      const formData = {
        ...data,
        location: data.location || null
      }

      if (editingItem) {
        const updated = await eventsAPI.update(editingItem.id, formData)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
        toast.success('Event updated successfully')
      } else {
        const created = await eventsAPI.create(formData)
        setEvents(prev => [created, ...prev])
        toast.success('Event created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  const newsColumns: Column<News>[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
    },
    {
      key: 'publish_date',
      title: 'Publish Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'content',
      title: 'Content',
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate text-sm">{value}</p>
        </div>
      )
    },
    {
      key: 'image_url',
      title: 'Image',
      render: (value) => (
        value ? (
          <StatusBadge status="Has Image" variant="success" />
        ) : (
          <StatusBadge status="No Image" variant="default" />
        )
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const eventColumns: Column<Event>[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
    },
    {
      key: 'event_date',
      title: 'Event Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'location',
      title: 'Location',
      filterable: true,
      render: (value) => value || 'TBA'
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate text-sm">{value}</p>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner text="Loading news and events..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Events Management</h1>
          <p className="text-gray-600 mt-1">Manage party news articles and upcoming events</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add {activeTab === 'news' ? 'News' : 'Event'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'news'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Newspaper className="h-5 w-5" />
            <span>News</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Events</span>
          </button>
        </nav>
      </div>

      {/* Data Tables */}
      {activeTab === 'news' ? (
        <DataTable
          data={news}
          columns={newsColumns}
          searchable
          filterable
          pagination
          pageSize={10}
        />
      ) : (
        <DataTable
          data={events}
          columns={eventColumns}
          searchable
          filterable
          pagination
          pageSize={10}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Add'} ${activeTab === 'news' ? 'News' : 'Event'}`}
        size="lg"
      >
        {activeTab === 'news' ? (
          <form onSubmit={handleSubmitNews(onSubmitNews)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                {...registerNews('title')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., New Student Initiative Launched"
              />
              {newsErrors.title && <p className="mt-1 text-sm text-red-600">{newsErrors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Publish Date *</label>
                <input
                  {...registerNews('publish_date')}
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {newsErrors.publish_date && <p className="mt-1 text-sm text-red-600">{newsErrors.publish_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  {...registerNews('image_url')}
                  type="url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {newsErrors.image_url && <p className="mt-1 text-sm text-red-600">{newsErrors.image_url.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content *</label>
              <textarea
                {...registerNews('content')}
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write the full news article content..."
              />
              {newsErrors.content && <p className="mt-1 text-sm text-red-600">{newsErrors.content.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={newsSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {newsSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitEvent(onSubmitEvent)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Title *</label>
              <input
                {...registerEvent('title')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Annual General Meeting"
              />
              {eventErrors.title && <p className="mt-1 text-sm text-red-600">{eventErrors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                <input
                  {...registerEvent('event_date')}
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {eventErrors.event_date && <p className="mt-1 text-sm text-red-600">{eventErrors.event_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  {...registerEvent('location')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main Auditorium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                {...registerEvent('description')}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the event details, agenda, and important information..."
              />
              {eventErrors.description && <p className="mt-1 text-sm text-red-600">{eventErrors.description.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={eventSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {eventSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`${activeTab === 'news' ? 'News' : 'Event'} Details`}
        size="lg"
      >
        {viewingItem && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{viewingItem.title}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(viewingItem.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      {activeTab === 'news' ? 'Publish Date:' : 'Event Date:'}
                    </span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(activeTab === 'news' ? (viewingItem as News).publish_date : (viewingItem as Event).event_date), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'news' ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {(viewingItem as News).content}
                  </p>
                </div>
                {(viewingItem as News).image_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image</h4>
                    <img 
                      src={(viewingItem as News).image_url!} 
                      alt={viewingItem.title}
                      className="max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                {(viewingItem as Event).location && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-900">{(viewingItem as Event).location}</span>
                  </div>
                )}
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {(viewingItem as Event).description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => handleEdit(viewingItem)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit {activeTab === 'news' ? 'News' : 'Event'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, type: null })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfirm.type === 'news' ? 'News' : 'Event'}`}
        message={`Are you sure you want to delete "${deleteConfirm.item?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}