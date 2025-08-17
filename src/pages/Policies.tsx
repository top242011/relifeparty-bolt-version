import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Policy } from '../types'
import { policiesAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const policySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
})

type PolicyFormData = z.infer<typeof policySchema>

export function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; policy: Policy | null }>({
    isOpen: false,
    policy: null
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema)
  })

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    try {
      setLoading(true)
      const data = await policiesAPI.getAll()
      setPolicies(data)
    } catch (error) {
      console.error('Error loading policies:', error)
      toast.error('Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPolicy(null)
    reset({ title: '', description: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy)
    reset({
      title: policy.title,
      description: policy.description
    })
    setIsModalOpen(true)
  }

  const handleView = (policy: Policy) => {
    setViewingPolicy(policy)
    setIsViewModalOpen(true)
  }

  const handleDelete = (policy: Policy) => {
    setDeleteConfirm({ isOpen: true, policy })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.policy) return

    try {
      await policiesAPI.delete(deleteConfirm.policy.id)
      setPolicies(prev => prev.filter(p => p.id !== deleteConfirm.policy!.id))
      toast.success('Policy deleted successfully')
    } catch (error) {
      console.error('Error deleting policy:', error)
      toast.error('Failed to delete policy')
    } finally {
      setDeleteConfirm({ isOpen: false, policy: null })
    }
  }

  const onSubmit = async (data: PolicyFormData) => {
    try {
      if (editingPolicy) {
        const updated = await policiesAPI.update(editingPolicy.id, data)
        setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast.success('Policy updated successfully')
      } else {
        const created = await policiesAPI.create(data)
        setPolicies(prev => [created, ...prev])
        toast.success('Policy created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving policy:', error)
      toast.error('Failed to save policy')
    }
  }

  const columns: Column<Policy>[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate">{value}</p>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'updated_at',
      title: 'Updated',
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
    return <LoadingSpinner text="Loading policies..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies Management</h1>
          <p className="text-gray-600 mt-1">Manage party policies and guidelines</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Policy</span>
        </button>
      </div>

      <DataTable
        data={policies}
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
        title={editingPolicy ? 'Edit Policy' : 'Add Policy'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Policy Title *</label>
            <input
              {...register('title')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Student Representation Policy"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              {...register('description')}
              rows={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a detailed description of the policy, including its objectives, implementation guidelines, and any relevant procedures..."
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
              {isSubmitting ? 'Saving...' : (editingPolicy ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Policy Details"
        size="lg"
      >
        {viewingPolicy && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{viewingPolicy.title}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(viewingPolicy.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(viewingPolicy.updated_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Policy Description</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {viewingPolicy.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => handleEdit(viewingPolicy)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Policy</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, policy: null })}
        onConfirm={confirmDelete}
        title="Delete Policy"
        message={`Are you sure you want to delete the policy "${deleteConfirm.policy?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}