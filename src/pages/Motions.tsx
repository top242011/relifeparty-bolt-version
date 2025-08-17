import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { StatusBadge } from '../components/common/StatusBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { MotionWithDetails, PersonnelWithCommittee, Meeting } from '../types'
import { motionsAPI, personnelAPI, meetingsAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const motionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  proposer_id: z.string().min(1, 'Proposer is required'),
  meeting_id: z.string().min(1, 'Meeting is required'),
  voting_status: z.enum(['Passed', 'Failed', 'Pending'], {
    required_error: 'Voting status is required'
  })
})

type MotionFormData = z.infer<typeof motionSchema>

export function Motions() {
  const [motions, setMotions] = useState<MotionWithDetails[]>([])
  const [personnel, setPersonnel] = useState<PersonnelWithCommittee[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingMotion, setEditingMotion] = useState<MotionWithDetails | null>(null)
  const [viewingMotion, setViewingMotion] = useState<MotionWithDetails | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; motion: MotionWithDetails | null }>({
    isOpen: false,
    motion: null
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MotionFormData>({
    resolver: zodResolver(motionSchema)
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [motionsData, personnelData, meetingsData] = await Promise.all([
        motionsAPI.getAll(),
        personnelAPI.getAll(),
        meetingsAPI.getAll()
      ])
      setMotions(motionsData)
      setPersonnel(personnelData)
      setMeetings(meetingsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load motions data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingMotion(null)
    reset({
      title: '',
      description: '',
      proposer_id: '',
      meeting_id: '',
      voting_status: 'Pending'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (motion: MotionWithDetails) => {
    setEditingMotion(motion)
    reset({
      title: motion.title,
      description: motion.description,
      proposer_id: motion.proposer_id,
      meeting_id: motion.meeting_id,
      voting_status: motion.voting_status as 'Passed' | 'Failed' | 'Pending'
    })
    setIsModalOpen(true)
  }

  const handleView = (motion: MotionWithDetails) => {
    setViewingMotion(motion)
    setIsViewModalOpen(true)
  }

  const handleDelete = (motion: MotionWithDetails) => {
    setDeleteConfirm({ isOpen: true, motion })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.motion) return

    try {
      await motionsAPI.delete(deleteConfirm.motion.id)
      setMotions(prev => prev.filter(m => m.id !== deleteConfirm.motion!.id))
      toast.success('Motion deleted successfully')
    } catch (error) {
      console.error('Error deleting motion:', error)
      toast.error('Failed to delete motion')
    } finally {
      setDeleteConfirm({ isOpen: false, motion: null })
    }
  }

  const onSubmit = async (data: MotionFormData) => {
    try {
      if (editingMotion) {
        const updated = await motionsAPI.update(editingMotion.id, data)
        const motionWithDetails = {
          ...updated,
          proposer: personnel.find(p => p.id === updated.proposer_id),
          meeting: meetings.find(m => m.id === updated.meeting_id)
        }
        setMotions(prev => prev.map(m => m.id === updated.id ? motionWithDetails : m))
        toast.success('Motion updated successfully')
      } else {
        const created = await motionsAPI.create(data)
        const motionWithDetails = {
          ...created,
          proposer: personnel.find(p => p.id === created.proposer_id),
          meeting: meetings.find(m => m.id === created.meeting_id)
        }
        setMotions(prev => [motionWithDetails, ...prev])
        toast.success('Motion created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving motion:', error)
      toast.error('Failed to save motion')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Passed': return 'success'
      case 'Failed': return 'error'
      case 'Pending': return 'warning'
      default: return 'default'
    }
  }

  const columns: Column<MotionWithDetails>[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
    },
    {
      key: 'proposer',
      title: 'Proposer',
      sortable: true,
      render: (_, row) => row.proposer?.name || 'Unknown'
    },
    {
      key: 'meeting',
      title: 'Meeting',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium">{row.meeting?.main_topic || 'Unknown'}</p>
          <p className="text-xs text-gray-500">
            {row.meeting && format(new Date(row.meeting.date), 'MMM dd, yyyy')}
          </p>
        </div>
      )
    },
    {
      key: 'voting_status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <StatusBadge status={value} variant={getStatusVariant(value)} />
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
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
    return <LoadingSpinner text="Loading motions..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Motions Management</h1>
          <p className="text-gray-600 mt-1">Track motions proposed in meetings and their voting results</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Motion</span>
        </button>
      </div>

      <DataTable
        data={motions}
        columns={columns}
        searchable
        filterable
        pagination
        pageSize={10}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMotion ? 'Edit Motion' : 'Add Motion'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              {...register('title')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Motion to increase student activity budget"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Proposer *</label>
              <select
                {...register('proposer_id')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Proposer</option>
                {personnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.party_position})
                  </option>
                ))}
              </select>
              {errors.proposer_id && <p className="mt-1 text-sm text-red-600">{errors.proposer_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting *</label>
              <select
                {...register('meeting_id')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Meeting</option>
                {meetings.map(meeting => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.main_topic} - {format(new Date(meeting.date), 'MMM dd, yyyy')}
                  </option>
                ))}
              </select>
              {errors.meeting_id && <p className="mt-1 text-sm text-red-600">{errors.meeting_id.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Voting Status *</label>
            <select
              {...register('voting_status')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
            {errors.voting_status && <p className="mt-1 text-sm text-red-600">{errors.voting_status.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the motion in detail..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingMotion ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Motion Details"
        size="lg"
      >
        {viewingMotion && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{viewingMotion.title}</h3>
              <StatusBadge 
                status={viewingMotion.voting_status} 
                variant={getStatusVariant(viewingMotion.voting_status)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Proposer</p>
                <p className="text-gray-900">{viewingMotion.proposer?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{viewingMotion.proposer?.party_position}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Meeting</p>
                <p className="text-gray-900">{viewingMotion.meeting?.main_topic || 'Unknown'}</p>
                <p className="text-sm text-gray-600">
                  {viewingMotion.meeting && format(new Date(viewingMotion.meeting.date), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{viewingMotion.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Motion Created</p>
              <p className="text-gray-900">{format(new Date(viewingMotion.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, motion: null })}
        onConfirm={confirmDelete}
        title="Delete Motion"
        message={`Are you sure you want to delete the motion "${deleteConfirm.motion?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}