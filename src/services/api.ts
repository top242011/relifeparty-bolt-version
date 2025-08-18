import { supabase } from '../lib/supabase'
import { 
  Personnel, PersonnelInsert, PersonnelUpdate,
  Committee, CommitteeInsert, CommitteeUpdate,
  Meeting, MeetingInsert, MeetingUpdate,
  Motion, MotionInsert, MotionUpdate,
  Policy, PolicyInsert, PolicyUpdate,
  News, NewsInsert, NewsUpdate,
  Event, EventInsert, EventUpdate,
  MeetingAttendance, MeetingAttendanceInsert,
  PersonnelWithCommittee,
  MotionWithDetails
} from '../types'

// Personnel API
export const personnelAPI = {
  async getAll(): Promise<PersonnelWithCommittee[]> {
    const { data, error } = await supabase
      .from('personnel')
      .select(`
        *,
        committee:committees(*)
      `)
      .order('name')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<PersonnelWithCommittee | null> {
    const { data, error } = await supabase
      .from('personnel')
      .select(`
        *,
        committee:committees(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(personnel: PersonnelInsert): Promise<Personnel> {
    const { data, error } = await supabase
      .from('personnel')
      .insert(personnel)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, personnel: PersonnelUpdate): Promise<Personnel> {
    const { data, error } = await supabase
      .from('personnel')
      .update({ ...personnel, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Committees API
export const committeesAPI = {
  async getAll(): Promise<Committee[]> {
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async create(committee: CommitteeInsert): Promise<Committee> {
    const { data, error } = await supabase
      .from('committees')
      .insert(committee)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, committee: CommitteeUpdate): Promise<Committee> {
    const { data, error } = await supabase
      .from('committees')
      .update({ ...committee, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('committees')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Meetings API
export const meetingsAPI = {
  async getAll(): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Meeting | null> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(meeting: MeetingInsert): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meeting)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, meeting: MeetingUpdate): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .update({ ...meeting, updated_at: new Date().toISOString() })
      .eq('meeting_id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('meetings')
      .delete()
      .eq('meeting_id', id)

    if (error) throw error
  },

  async getAttendance(meetingId: string) {
    const { data, error } = await supabase
      .from('meeting_attendance')
      .select(`
        *,
        personnel:personnel(*)
      `)
      .eq('meeting_id', meetingId)

    if (error) throw error
    return data || []
  },

  async updateAttendance(attendance: MeetingAttendanceInsert[]): Promise<void> {
    const { error } = await supabase
      .from('meeting_attendance')
      .upsert(attendance)

    if (error) throw error
  }
}

// Motions API
export const motionsAPI = {
  async getAll(): Promise<MotionWithDetails[]> {
    const { data, error } = await supabase
      .from('motions')
      .select(`
        *,
        proposer:personnel(*),
        meeting:meetings(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(motion: MotionInsert): Promise<Motion> {
    const { data, error } = await supabase
      .from('motions')
      .insert(motion)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, motion: MotionUpdate): Promise<Motion> {
    const { data, error } = await supabase
      .from('motions')
      .update({ ...motion, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('motions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Policies API
export const policiesAPI = {
  async getAll(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(policy: PolicyInsert): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, policy: PolicyUpdate): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update({ ...policy, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// News API
export const newsAPI = {
  async getAll(): Promise<News[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('publish_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(news: NewsInsert): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .insert(news)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, news: NewsUpdate): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .update({ ...news, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Events API
export const eventsAPI = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(event: EventInsert): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, event: EventUpdate): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update({ ...event, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}