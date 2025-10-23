export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'student' | 'admin'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'student' | 'admin'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'student' | 'admin'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      faculty: {
        Row: {
          id: string
          name: string
          title: string
          department: string
          image: string
          email: string
          phone: string
          office: string
          specialization: string[]
          experience: string
          education: string
          research_interests: string[]
          publications: string
          projects: string[]
          web_profile: {
            personal_statement: string | null
            website: string | null
            biography: string | null
            teaching_philosophy: string | null
            achievements: string[]
            collaboration_interests: string | null
          }
          analytics: {
            profile_views: number
            contact_clicks: number
            project_views: number
            last_updated: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          department: string
          image?: string
          email: string
          phone: string
          office: string
          specialization: string[]
          experience: string
          education: string
          research_interests: string[]
          publications: string
          projects: string[]
          web_profile?: {
            personal_statement?: string | null
            website?: string | null
            biography?: string | null
            teaching_philosophy?: string | null
            achievements?: string[]
            collaboration_interests?: string | null
          }
          analytics?: {
            profile_views?: number
            contact_clicks?: number
            project_views?: number
            last_updated?: string
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          department?: string
          image?: string
          email?: string
          phone?: string
          office?: string
          specialization?: string[]
          experience?: string
          education?: string
          research_interests?: string[]
          publications?: string
          projects?: string[]
          web_profile?: {
            personal_statement?: string | null
            website?: string | null
            biography?: string | null
            teaching_philosophy?: string | null
            achievements?: string[]
            collaboration_interests?: string | null
          }
          analytics?: {
            profile_views?: number
            contact_clicks?: number
            project_views?: number
            last_updated?: string
          }
          created_at?: string
          updated_at?: string
        }
      }
      forum_topics: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          author_name: string
          author_avatar: string
          author_department: string
          category: string
          tags: string[]
          views: number
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          author_name: string
          author_avatar?: string
          author_department: string
          category: string
          tags?: string[]
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          author_name?: string
          author_avatar?: string
          author_department?: string
          category?: string
          tags?: string[]
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          topic_id: string
          author_id: string
          author_name: string
          author_avatar: string
          author_department: string
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          author_id: string
          author_name: string
          author_avatar?: string
          author_department: string
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          author_id?: string
          author_name?: string
          author_avatar?: string
          author_department?: string
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_likes: {
        Row: {
          id: string
          user_id: string
          topic_id: string | null
          reply_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id?: string | null
          reply_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string | null
          reply_id?: string | null
          created_at?: string
        }
      }
      project_submissions: {
        Row: {
          id: string
          name: string
          email: string
          department: string
          project_title: string
          project_description: string
          resources: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          department: string
          project_title: string
          project_description: string
          resources?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string
          project_title?: string
          project_description?: string
          resources?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Export convenience types
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row']
export type ForumTopicInsert = Database['public']['Tables']['forum_topics']['Insert']
export type ForumTopicUpdate = Database['public']['Tables']['forum_topics']['Update']

export type ForumReply = Database['public']['Tables']['forum_replies']['Row']
export type ForumReplyInsert = Database['public']['Tables']['forum_replies']['Insert']
export type ForumReplyUpdate = Database['public']['Tables']['forum_replies']['Update']

export type ForumLike = Database['public']['Tables']['forum_likes']['Row']
export type ForumLikeInsert = Database['public']['Tables']['forum_likes']['Insert']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Faculty = Database['public']['Tables']['faculty']['Row']
export type FacultyInsert = Database['public']['Tables']['faculty']['Insert']
export type FacultyUpdate = Database['public']['Tables']['faculty']['Update']

export type ProjectSubmission = Database['public']['Tables']['project_submissions']['Row']
export type ProjectSubmissionInsert = Database['public']['Tables']['project_submissions']['Insert']
export type ProjectSubmissionUpdate = Database['public']['Tables']['project_submissions']['Update']
