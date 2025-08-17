import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Committee } from '../types'
import { committeesAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const committeeSchema = z.object({
  name: z.string().min(2, 'Committee name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type CommitteeFormData = z.infer<typeof committeeSchema>

export function Committees() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; committee: Committee | null }>({
    isOpen: false,
    committee: null
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CommitteeFormData>({
    resolver: zodResolver(committeeSchema)
  })

  useEffect(() => {
    loadCommittees()
  }, [])

  const loadCommittees = async () => {
    try {
      setLoading(true)
      const data = await committeesAPI.getAll()
      setCommittees(data)
    } catch (error) {
      console.error('Error loading committees:', error)
      toast.error('Failed to load committees')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCommittee(null)
    reset({ name: '', description: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (committee: Committee) => {
    setEditingCommittee(committee)
    reset({
      name: committee.name,
      description: committee.description
    })
    setIsModalOpen(true)
  }

  const handleDelete = (committee: Committee) => {
    setDeleteConfirm({ isOpen: true, committee })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.committee) return

    try {
      await committeesAPI.delete(deleteConfirm.committee.id)
      setCommittees(prev => prev.filter(c => c.id !== deleteConfirm.committee!.id))
      toast.success('Committee deleted successfully')
    } catch (error) {
      console.error('Error deleting committee:', error)
      toast.error('Failed to delete committee')
    } finally {
      setDeleteConfirm({ isOpen: false, committee: null })
    }
  }

  const onSubmit = async (data: CommitteeFormData) => {
    try {
      if (editingCommittee) {
        const updated = await committeesAPI.update(editingCommittee.id, data)
        setCommittees(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success('Committee updated successfully')
      } else {
        const created = await committeesAPI.create(data)
        setCommittees(prev => [...prev, created])
        toast.success('Committee created successfully')
      }

      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Error saving committee:', error)
      if (error.code === '23505') { // Unique constraint violation
        toast.error('A committee with this name already exists')
      } else {
        toast.error('Failed to save committee')
      }
    }
  }

  const columns: Column<Committee>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'description',
      title: 'Description',
      sortable: true,
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
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
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
    return <LoadingSpinner text="Loading committees..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Committees Management</h1>
          <p className="text-gray-600 mt-1">Manage party committees and their descriptions</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Committee</span>
        </button>
      </div>

      <DataTable
        data={committees}
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
        title={editingCommittee ? 'Edit Committee' : 'Add Committee'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Committee Name *</label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Finance Committee"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the committee's responsibilities and objectives..."
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
              {isSubmitting ? 'Saving...' : (editingCommittee ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, committee: null })}
        onConfirm={confirmDelete}
        title="Delete Committee"
        message={`Are you sure you want to delete "${deleteConfirm.committee?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}