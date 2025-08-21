import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { StatusBadge } from '../components/common/StatusBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { PersonnelWithCommittee, Committee } from '../types'
import { personnelAPI, committeesAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const personnelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  party_position: z.string().min(2, 'Party position is required'),
  student_council_position: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  campus: z.string().min(2, 'Campus is required'),
  faculty: z.string().min(2, 'Faculty is required'),
  year: z.number().min(1).max(10, 'Year must be between 1 and 10'),
  gender: z.enum(['Male', 'Female', 'Other']),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  committee_id: z.string().optional().or(z.literal(''))
})

type PersonnelFormData = z.infer<typeof personnelSchema>

export function Personnel() {
  const [personnel, setPersonnel] = useState<PersonnelWithCommittee[]>([])
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelWithCommittee | null>(null)
  const [viewingPersonnel, setViewingPersonnel] = useState<PersonnelWithCommittee | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; personnel: PersonnelWithCommittee | null }>({
    isOpen: false,
    personnel: null
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema)
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [personnelData, committeesData] = await Promise.all([
        personnelAPI.getAll(),
        committeesAPI.getAll()
      ])
      setPersonnel(personnelData)
      setCommittees(committeesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load personnel data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPersonnel(null)
    reset({
      name: '',
      party_position: '',
      student_council_position: '',
      bio: '',
      campus: '',
      faculty: '',
      year: 1,
      gender: 'Male',
      profile_image_url: '',
      committee_id: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (person: PersonnelWithCommittee) => {
    setEditingPersonnel(person)
    reset({
      name: person.name,
      party_position: person.party_position,
      student_council_position: person.student_council_position || '',
      bio: person.bio,
      campus: person.campus,
      faculty: person.faculty,
      year: person.year,
      gender: person.gender as 'Male' | 'Female' | 'Other',
      profile_image_url: person.profile_image_url || '',
      committee_id: person.committee_id || ''
    })
    setIsModalOpen(true)
  }

  const handleView = (person: PersonnelWithCommittee) => {
    setViewingPersonnel(person)
    setIsViewModalOpen(true)
  }

  const handleDelete = (person: PersonnelWithCommittee) => {
    setDeleteConfirm({ isOpen: true, personnel: person })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.personnel) return

    try {
      await personnelAPI.delete(deleteConfirm.personnel.id)
      setPersonnel(prev => prev.filter(p => p.id !== deleteConfirm.personnel!.id))
      toast.success('Personnel deleted successfully')
    } catch (error: any) {
      console.error('Error deleting personnel:', error)
      if (error && error.code === '23503') {
        toast.error('This person cannot be deleted as they are referenced in other records (e.g., as a proposer of a motion).')
      } else {
        toast.error('Failed to delete personnel.')
      }
    } finally {
      setDeleteConfirm({ isOpen: false, personnel: null })
    }
  }

  const onSubmit = async (data: PersonnelFormData) => {
    try {
      const formData = {
        ...data,
        committee_id: data.committee_id || null,
        student_council_position: data.student_council_position || null,
        profile_image_url: data.profile_image_url || null
      }

      if (editingPersonnel) {
        const updated = await personnelAPI.update(editingPersonnel.id, formData)
        setPersonnel(prev => prev.map(p => p.id === updated.id ? { ...updated, committee: committees.find(c => c.id === updated.committee_id) || null } : p))
        toast.success('Personnel updated successfully')
      } else {
        const created = await personnelAPI.create(formData)
        const newPersonnel = { ...created, committee: committees.find(c => c.id === created.committee_id) || null }
        setPersonnel(prev => [...prev, newPersonnel])
        toast.success('Personnel created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving personnel:', error)
      toast.error('Failed to save personnel')
    }
  }

  const columns: Column<PersonnelWithCommittee>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'party_position',
      title: 'Party Position',
      sortable: true,
      filterable: true,
    },
    {
      key: 'campus',
      title: 'Campus',
      sortable: true,
      filterable: true,
      render: (value) => <StatusBadge status={value} variant="info" />
    },
    {
      key: 'faculty',
      title: 'Faculty',
      sortable: true,
    },
    {
      key: 'year',
      title: 'Year',
      sortable: true,
    },
    {
      key: 'committee',
      title: 'Committee',
      render: (value, row) => row.committee?.name || 'No Committee'
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
    return <LoadingSpinner text="Loading personnel..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personnel Management</h1>
          <p className="text-gray-600 mt-1">Manage party members and their roles</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Personnel</span>
        </button>
      </div>

      <DataTable
        data={personnel}
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
        title={editingPersonnel ? 'Edit Personnel' : 'Add Personnel'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Party Position *</label>
              <input
                {...register('party_position')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.party_position && <p className="mt-1 text-sm text-red-600">{errors.party_position.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Student Council Position</label>
              <input
                {...register('student_council_position')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Campus *</label>
              <select
                {...register('campus')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Campus</option>
                <option value="Tha Prachan">Tha Prachan</option>
                <option value="Rangsit">Rangsit</option>
                <option value="Lampang">Lampang</option>
                <option value="Pattaya">Pattaya</option>
              </select>
              {errors.campus && <p className="mt-1 text-sm text-red-600">{errors.campus.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Faculty *</label>
              <input
                {...register('faculty')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.faculty && <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year *</label>
              <select
                {...register('year', { valueAsNumber: true })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                {...register('gender')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Committee</label>
              <select
                {...register('committee_id')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Committee</option>
                {committees.map(committee => (
                  <option key={committee.id} value={committee.id}>{committee.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio *</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
            <input
              {...register('profile_image_url')}
              type="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.profile_image_url && <p className="mt-1 text-sm text-red-600">{errors.profile_image_url.message}</p>}
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
              {isSubmitting ? 'Saving...' : (editingPersonnel ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Personnel Details"
        size="lg"
      >
        {viewingPersonnel && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {viewingPersonnel.profile_image_url && (
                <img
                  src={viewingPersonnel.profile_image_url}
                  alt={viewingPersonnel.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{viewingPersonnel.name}</h3>
                <p className="text-gray-600">{viewingPersonnel.party_position}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student Council Position</p>
                <p className="text-gray-900">{viewingPersonnel.student_council_position || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Campus</p>
                <p className="text-gray-900">{viewingPersonnel.campus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Faculty</p>
                <p className="text-gray-900">{viewingPersonnel.faculty}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Year</p>
                <p className="text-gray-900">Year {viewingPersonnel.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Gender</p>
                <p className="text-gray-900">{viewingPersonnel.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Committee</p>
                <p className="text-gray-900">{viewingPersonnel.committee?.name || 'No Committee'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Bio</p>
              <p className="text-gray-900 mt-1">{viewingPersonnel.bio}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, personnel: null })}
        onConfirm={confirmDelete}
        title="Delete Personnel"
        message={`Are you sure you want to delete ${deleteConfirm.personnel?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}