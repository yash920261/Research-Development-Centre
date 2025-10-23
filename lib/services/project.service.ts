import { supabase } from '@/lib/supabase'

export interface ProjectSubmission {
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

export type ProjectSubmissionInsert = Omit<ProjectSubmission, 'id' | 'created_at' | 'updated_at' | 'status'>

export const projectService = {
  /**
   * Submit a new project
   */
  async submit(project: ProjectSubmissionInsert): Promise<{
    data: ProjectSubmission | null
    error: any
  }> {
    try {
      console.log('📤 projectService.submit called with:', project)
      console.log('🔌 Supabase client exists:', !!supabase)
      
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('project_submissions')
        .insert([project as any])
        .select()
        .single()

      console.log('📬 Supabase raw response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
      }

      return { data: data as ProjectSubmission | null, error }
    } catch (error) {
      console.error('💥 Exception in projectService.submit:', error)
      return { data: null, error }
    }
  },

  /**
   * Get all project submissions (admin only)
   */
  async getAll(): Promise<{ data: ProjectSubmission[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      return { data: data as ProjectSubmission[] | null, error }
    } catch (error) {
      console.error('Error fetching project submissions:', error)
      return { data: null, error }
    }
  },

  /**
   * Get user's own submissions
   */
  async getByEmail(email: string): Promise<{ data: ProjectSubmission[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      return { data: data as ProjectSubmission[] | null, error }
    } catch (error) {
      console.error('Error fetching user submissions:', error)
      return { data: null, error }
    }
  },

  /**
   * Update submission status (admin only)
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<{ data: ProjectSubmission | null; error: any }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('project_submissions')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single()

      return { data: data as ProjectSubmission | null, error }
    } catch (error) {
      console.error('Error updating submission status:', error)
      return { data: null, error }
    }
  },

  /**
   * Get submission by ID
   */
  async getById(id: string): Promise<{ data: ProjectSubmission | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('id', id)
        .single()

      return { data: data as ProjectSubmission | null, error }
    } catch (error) {
      console.error('Error fetching submission:', error)
      return { data: null, error }
    }
  }
}
