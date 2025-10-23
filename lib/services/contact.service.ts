import { supabase } from '@/lib/supabase'

export interface ContactMessage {
  id: string
  name: string
  email: string
  inquiry_type: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

export type ContactMessageInsert = Omit<ContactMessage, 'id' | 'created_at' | 'updated_at' | 'status'>

export const contactService = {
  /**
   * Submit a new contact message
   */
  async submit(message: ContactMessageInsert): Promise<{
    data: ContactMessage | null
    error: any
  }> {
    try {
      console.log('📤 contactService.submit called with:', message)
      
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([message as any])
        .select()
        .single()

      console.log('📬 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Error submitting contact message:', error)
      }

      return { data: data as ContactMessage | null, error }
    } catch (error) {
      console.error('💥 Exception in contactService.submit:', error)
      return { data: null, error }
    }
  },

  /**
   * Get all contact messages (admin only)
   */
  async getAll(): Promise<{ data: ContactMessage[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      return { data: data as ContactMessage[] | null, error }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      return { data: null, error }
    }
  },

  /**
   * Get unread messages count
   */
  async getUnreadCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')

      return { count: count || 0, error }
    } catch (error) {
      console.error('Error getting unread count:', error)
      return { count: 0, error }
    }
  },

  /**
   * Update message status (admin only)
   */
  async updateStatus(
    id: string,
    status: 'unread' | 'read' | 'replied' | 'archived'
  ): Promise<{ data: ContactMessage | null; error: any }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single()

      return { data: data as ContactMessage | null, error }
    } catch (error) {
      console.error('Error updating message status:', error)
      return { data: null, error }
    }
  },

  /**
   * Delete message (admin only)
   */
  async delete(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { error }
    }
  }
}
