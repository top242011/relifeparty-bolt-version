import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Eye } from 'lucide-react'
import { DataTable, Column } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { StatusBadge } from '../components/common/StatusBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Meeting, PersonnelWithCommittee, MeetingAttendance, AttendanceRecord } from '../types'
import { meetingsAPI, personnelAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { isValidUUID } from '../lib/utils'

const meetingSchema = z.object({
  date: z.string().min(1, 'Meeting date is required'),
  main_topic: z.string().min(5, 'Main topic must be at least 5 characters'),
  scope: z.string().min(1, 'Scope is required'),
})

type MeetingFormData = z.infer<typeof meetingSchema>

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [personnel, setPersonnel] = useState<PersonnelWithCommittee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; meeting: Meeting | null }>({
    isOpen: false,
    meeting: null
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema)
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [meetingsData, personnelData] = await Promise.all([
        meetingsAPI.getAll(),
        personnelAPI.getAll()
      ])
      setMeetings(meetingsData)
      setPersonnel(personnelData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load meetings data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingMeeting(null)
    reset({
      date: '',
      main_topic: '',
      scope: 'General Assembly'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    reset({
      date: meeting.date,
      main_topic: meeting.main_topic,
      scope: meeting.scope
    })
    setIsModalOpen(true)
  }

  const handleAttendance = async (meeting: Meeting) => {
    // Validate meeting ID before proceeding
    if (!isValidUUID(meeting.meeting_id)) {
      toast.error('Invalid meeting ID. Cannot load attendance.')
      return
    }

    setSelectedMeeting(meeting)
    
    try {
      const attendance = await meetingsAPI.getAttendance(meeting.meeting_id)
      setAttendanceRecords(attendance)
      
      // Create attendance data map
      const attendanceMap: Record<string, boolean> = {}
      personnel.forEach(person => {
        const record = attendance.find(a => a.personnel_id === person.id)
        attendanceMap[person.id] = record?.attended || false
      })
      setAttendanceData(attendanceMap)
      
      setIsAttendanceModalOpen(true)
    } catch (error) {
      console.error('Error loading attendance:', error)
      toast.error('Failed to load attendance data')
    }
  }

  const handleDelete = (meeting: Meeting) => {
    setDeleteConfirm({ isOpen: true, meeting })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.meeting) return

    // Validate meeting ID before proceeding
    if (!isValidUUID(deleteConfirm.meeting.meeting_id)) {
      toast.error('Invalid meeting ID. Cannot delete meeting.')
      setDeleteConfirm({ isOpen: false, meeting: null })
      return
    }

    try {
      await meetingsAPI.delete(deleteConfirm.meeting.meeting_id)
      setMeetings(prev => prev.filter(m => m.meeting_id !== deleteConfirm.meeting!.meeting_id))
      toast.success('Meeting deleted successfully')
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error('Failed to delete meeting')
    } finally {
      setDeleteConfirm({ isOpen: false, meeting: null })
    }
  }

  const onSubmit = async (data: MeetingFormData) => {
    try {
      if (editingMeeting) {
        const updated = await meetingsAPI.update(editingMeeting.meeting_id, data)
        setMeetings(prev => prev.map(m => m.meeting_id === updated.meeting_id ? updated : m))
        toast.success('Meeting updated successfully')
      } else {
        const created = await meetingsAPI.create(data)
        setMeetings(prev => [created, ...prev])
        toast.success('Meeting created successfully')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving meeting:', error)
      toast.error('Failed to save meeting')
    }
  }

  const saveAttendance = async () => {
    if (!selectedMeeting) return

    try {
      const attendanceInserts = Object.entries(attendanceData).map(([personnelId, attended]) => ({
        meeting_id: selectedMeeting.meeting_id,
        personnel_id: personnelId,
        attended
      }))

      await meetingsAPI.updateAttendance(attendanceInserts)
      toast.success('Attendance updated successfully')
      setIsAttendanceModalOpen(false)
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('Failed to save attendance')
    }
  }

  const handleAttendanceChange = (personnelId: string, attended: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [personnelId]: attended
    }))
  }

  const columns: Column<Meeting>[] = [
    {
      key: 'date', 
      title: 'Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'main_topic',
      title: 'Main Topic',
      sortable: true,
      filterable: true,
    },
    {
      key: 'scope',
      title: 'Scope',
      sortable: true,
      filterable: true,
      render: (value) => (
        <StatusBadge 
          status={value} 
          variant={value === 'General Assembly' ? 'info' : 'default'}
        />
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
            onClick={() => handleAttendance(row)}
            className="text-green-600 hover:text-green-800"
            title="Manage Attendance"
          >
            <Users className="h-4 w-4" />
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
    return <LoadingSpinner text="Loading meetings..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings Management</h1>
          <p className="text-gray-600 mt-1">Schedule meetings and track attendance</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      <DataTable
        data={meetings}
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
        title={editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Date *</label>
            <input
              {...register('date')}
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Main Topic *</label>
            <input
              {...register('main_topic')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Budget Planning for Q1"
            />
            {errors.main_topic && <p className="mt-1 text-sm text-red-600">{errors.main_topic.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scope *</label>
            <select
              {...register('scope')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="General Assembly">General Assembly</option>
              <option value="Tha Prachan">Tha Prachan</option>
              <option value="Rangsit">Rangsit</option>
              <option value="Lampang">Lampang</option>
              <option value="Pattaya">Pattaya</option>
              <option value="Executive Committee">Executive Committee</option>
            </select>
            {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>}
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
              {isSubmitting ? 'Saving...' : (editingMeeting ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Manage Attendance - ${selectedMeeting?.main_topic}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Meeting Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Date:</strong> {selectedMeeting && format(new Date(selectedMeeting.date), 'MMMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Scope:</strong> {selectedMeeting?.scope}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {personnel.map(person => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-600">{person.party_position}</p>
                      <p className="text-xs text-gray-500">{person.campus}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <label
                      htmlFor={`attendance-${person.id}`}
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`attendance-${person.id}`}
                          className="sr-only"
                          checked={attendanceData[person.id] || false}
                          onChange={(e) => handleAttendanceChange(person.id, e.target.checked)}
                        />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            attendanceData[person.id] ? 'translate-x-6 bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                      <div className="ml-3 text-gray-700 font-medium">
                        {attendanceData[person.id] ? 'Present' : 'Absent'}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={saveAttendance}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, meeting: null })}
        onConfirm={confirmDelete}
        title="Delete Meeting"
        message={`Are you sure you want to delete the meeting "${deleteConfirm.meeting?.main_topic}"? This will also delete all associated attendance records.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}