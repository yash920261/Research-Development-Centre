import { supabase } from '@/lib/supabase'

export interface Faculty {
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
    personal_statement?: string | null
    website?: string | null
    biography?: string | null
    teaching_philosophy?: string | null
    achievements?: string[]
    collaboration_interests?: string | null
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

export type FacultyInsert = Omit<Faculty, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type FacultyUpdate = Partial<FacultyInsert>

export const facultyService = {
  /**
   * Get all faculty members
   */
  async getAll(): Promise<{ data: Faculty[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      return { data: null, error }
    }
  },

  /**
   * Get faculty member by ID
   */
  async getById(id: string): Promise<{ data: Faculty | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', id)
        .single()

      return { data: data as Faculty | null, error }
    } catch (error) {
      console.error('Error fetching faculty by ID:', error)
      return { data: null, error }
    }
  },

  /**
   * Create a new faculty member
   */
  async create(faculty: FacultyInsert): Promise<{ data: Faculty | null; error: any }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('faculty')
        .insert([faculty as any])
        .select()
        .single()

      return { data: data as Faculty | null, error }
    } catch (error) {
      console.error('Error creating faculty:', error)
      return { data: null, error }
    }
  },

  /**
   * Update faculty member
   */
  async update(id: string, updates: FacultyUpdate): Promise<{ data: Faculty | null; error: any }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('faculty')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      return { data: data as Faculty | null, error }
    } catch (error) {
      console.error('Error updating faculty:', error)
      return { data: null, error }
    }
  },

  /**
   * Delete faculty member
   */
  async delete(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Error deleting faculty:', error)
      return { error }
    }
  },

  /**
   * Search faculty by name or department
   */
  async search(query: string): Promise<{ data: Faculty[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .or(`name.ilike.%${query}%,department.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error searching faculty:', error)
      return { data: null, error }
    }
  },

  /**
   * Filter faculty by department
   */
  async filterByDepartment(department: string): Promise<{ data: Faculty[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error filtering faculty by department:', error)
      return { data: null, error }
    }
  },

  /**
   * Increment analytics counters
   */
  async incrementAnalytics(
    id: string,
    field: 'profile_views' | 'contact_clicks' | 'project_views'
  ): Promise<{ error: any }> {
    try {
      const { data: facultyData, error: fetchError } = await supabase
        .from('faculty')
        .select('analytics')
        .eq('id', id)
        .single()

      if (fetchError) return { error: fetchError }

      const faculty = facultyData as any
      const analytics = faculty?.analytics || {
        profile_views: 0,
        contact_clicks: 0,
        project_views: 0,
        last_updated: new Date().toISOString()
      }

      analytics[field] = (analytics[field] || 0) + 1
      analytics.last_updated = new Date().toISOString()

      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('faculty')
        .update({ analytics } as any)
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Error incrementing analytics:', error)
      return { error }
    }
  }
}
