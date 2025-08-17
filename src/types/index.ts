import { Database } from './database'

export type Personnel = Database['public']['Tables']['personnel']['Row']
export type PersonnelInsert = Database['public']['Tables']['personnel']['Insert']
export type PersonnelUpdate = Database['public']['Tables']['personnel']['Update']

export type Committee = Database['public']['Tables']['committees']['Row']
export type CommitteeInsert = Database['public']['Tables']['committees']['Insert']
export type CommitteeUpdate = Database['public']['Tables']['committees']['Update']

export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export type MeetingAttendance = Database['public']['Tables']['meeting_attendance']['Row']
export type MeetingAttendanceInsert = Database['public']['Tables']['meeting_attendance']['Insert']

export type Motion = Database['public']['Tables']['motions']['Row']
export type MotionInsert = Database['public']['Tables']['motions']['Insert']
export type MotionUpdate = Database['public']['Tables']['motions']['Update']

export type Policy = Database['public']['Tables']['policies']['Row']
export type PolicyInsert = Database['public']['Tables']['policies']['Insert']
export type PolicyUpdate = Database['public']['Tables']['policies']['Update']

export type News = Database['public']['Tables']['news']['Row']
export type NewsInsert = Database['public']['Tables']['news']['Insert']
export type NewsUpdate = Database['public']['Tables']['news']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export interface PersonnelWithCommittee extends Personnel {
  committee?: Committee | null
}

export interface MotionWithDetails extends Motion {
  proposer?: Personnel
  meeting?: Meeting
}

export interface AttendanceRecord extends MeetingAttendance {
  personnel: Personnel
}