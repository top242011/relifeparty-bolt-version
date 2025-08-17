export interface Database {
  public: {
    Tables: {
      personnel: {
        Row: {
          id: string
          name: string
          party_position: string
          student_council_position: string | null
          bio: string
          campus: string
          faculty: string
          year: number
          gender: string
          profile_image_url: string | null
          committee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          party_position: string
          student_council_position?: string | null
          bio: string
          campus: string
          faculty: string
          year: number
          gender: string
          profile_image_url?: string | null
          committee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          party_position?: string
          student_council_position?: string | null
          bio?: string
          campus?: string
          faculty?: string
          year?: number
          gender?: string
          profile_image_url?: string | null
          committee_id?: string | null
          updated_at?: string
        }
      }
      committees: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          date: string
          main_topic: string
          scope: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          main_topic: string
          scope: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          main_topic?: string
          scope?: string
          updated_at?: string
        }
      }
      meeting_attendance: {
        Row: {
          id: string
          meeting_id: string
          personnel_id: string
          attended: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          personnel_id: string
          attended: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          personnel_id?: string
          attended?: boolean
        }
      }
      motions: {
        Row: {
          id: string
          title: string
          description: string
          proposer_id: string
          meeting_id: string
          voting_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          proposer_id: string
          meeting_id: string
          voting_status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          proposer_id?: string
          meeting_id?: string
          voting_status?: string
          updated_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          publish_date: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          publish_date: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          publish_date?: string
          image_url?: string | null
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_date: string
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_date: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_date?: string
          location?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}