import { supabase } from '@/lib/supabase'

export interface AnalyticsOverview {
  totalFaculty: number
  totalViews: number
  totalContacts: number
  totalProjectSubmissions: number
  totalForumTopics: number
  totalForumReplies: number
}

export interface FacultyAnalytics {
  id: string
  name: string
  department: string
  profileViews: number
  contactClicks: number
  projectViews: number
  lastUpdated: string
}

export interface DepartmentStats {
  name: string
  value: number
  facultyCount: number
}

export const analyticsService = {
  /**
   * Get overview analytics
   */
  async getOverview(): Promise<{ data: AnalyticsOverview | null; error: any }> {
    try {
      // Get total faculty count
      const { count: facultyCount, error: facultyError } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true })

      if (facultyError) throw facultyError

      // Get total views from all faculty
      const { data: facultyData, error: viewsError } = await supabase
        .from('faculty')
        .select('analytics')

      if (viewsError) throw viewsError

      const totalViews = (facultyData as any)?.reduce((sum: number, f: any) => sum + (f.analytics?.profile_views || 0), 0) || 0
      const totalContacts = (facultyData as any)?.reduce((sum: number, f: any) => sum + (f.analytics?.contact_clicks || 0), 0) || 0

      // Get project submissions count
      const { count: projectCount, error: projectError } = await supabase
        .from('project_submissions')
        .select('*', { count: 'exact', head: true })

      if (projectError) throw projectError

      // Get forum topics count
      const { count: topicsCount, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })

      if (topicsError) throw topicsError

      // Get forum replies count
      const { count: repliesCount, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*', { count: 'exact', head: true })

      if (repliesError) throw repliesError

      const overview: AnalyticsOverview = {
        totalFaculty: facultyCount || 0,
        totalViews,
        totalContacts,
        totalProjectSubmissions: projectCount || 0,
        totalForumTopics: topicsCount || 0,
        totalForumReplies: repliesCount || 0,
      }

      return { data: overview, error: null }
    } catch (error) {
      console.error('Error fetching overview:', error)
      return { data: null, error }
    }
  },

  /**
   * Get faculty analytics
   */
  async getFacultyAnalytics(): Promise<{ data: FacultyAnalytics[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('id, name, department, analytics, updated_at')
        .order('analytics->profile_views', { ascending: false })

      if (error) throw error

      const facultyAnalytics: FacultyAnalytics[] = data?.map((f: any) => ({
        id: f.id,
        name: f.name,
        department: f.department,
        profileViews: f.analytics?.profile_views || 0,
        contactClicks: f.analytics?.contact_clicks || 0,
        projectViews: f.analytics?.project_views || 0,
        lastUpdated: f.updated_at,
      })) || []

      return { data: facultyAnalytics, error: null }
    } catch (error) {
      console.error('Error fetching faculty analytics:', error)
      return { data: null, error }
    }
  },

  /**
   * Get department statistics
   */
  async getDepartmentStats(): Promise<{ data: DepartmentStats[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('department, analytics')

      if (error) throw error

      // Group by department
      const departmentMap = new Map<string, { views: number; count: number }>()

      data?.forEach((f: any) => {
        const dept = f.department
        const views = f.analytics?.profile_views || 0
        
        if (departmentMap.has(dept)) {
          const existing = departmentMap.get(dept)!
          departmentMap.set(dept, {
            views: existing.views + views,
            count: existing.count + 1
          })
        } else {
          departmentMap.set(dept, { views, count: 1 })
        }
      })

      const departmentStats: DepartmentStats[] = Array.from(departmentMap.entries()).map(([name, data]) => ({
        name,
        value: data.views,
        facultyCount: data.count,
      }))

      // Sort by views
      departmentStats.sort((a, b) => b.value - a.value)

      return { data: departmentStats, error: null }
    } catch (error) {
      console.error('Error fetching department stats:', error)
      return { data: null, error }
    }
  },

  /**
   * Get contact messages count
   */
  async getContactMessagesCount(): Promise<{ total: number; unread: number; error: any }> {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })

      if (totalError) throw totalError

      const { count: unreadCount, error: unreadError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')

      if (unreadError) throw unreadError

      return {
        total: totalCount || 0,
        unread: unreadCount || 0,
        error: null
      }
    } catch (error) {
      console.error('Error fetching contact messages count:', error)
      return { total: 0, unread: 0, error }
    }
  },

  /**
   * Get project submissions by status
   */
  async getProjectSubmissionsByStatus(): Promise<{
    data: { status: string; count: number }[] | null
    error: any
  }> {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('status')

      if (error) throw error

      // Count by status
      const statusMap = new Map<string, number>()
      data?.forEach((p: any) => {
        const status = p.status
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
      })

      const statusData = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count
      }))

      return { data: statusData, error: null }
    } catch (error) {
      console.error('Error fetching project submissions by status:', error)
      return { data: null, error }
    }
  }
}
