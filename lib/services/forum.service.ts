import { supabase } from '@/lib/supabase'

export interface ForumTopic {
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
  reply_count?: number
}

export interface ForumReply {
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

export interface ForumAuthor {
  id: string
  name: string
  avatar: string
  department: string
  joinDate: string
}

export const forumService = {
  /**
   * Get all forum topics
   */
  async getAllTopics(): Promise<{ data: ForumTopic[] | null; error: any }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*, forum_replies(count)')
        .order('created_at', { ascending: false })

      return { data: data as ForumTopic[] | null, error }
    } catch (error) {
      console.error('Error fetching forum topics:', error)
      return { data: null, error }
    }
  },

  /**
   * Get topic by ID with replies
   */
  async getTopicById(id: string): Promise<{ 
    topic: ForumTopic | null
    replies: ForumReply[] | null
    error: any 
  }> {
    try {
      // Increment views
      await this.incrementTopicViews(id)

      // @ts-ignore - Supabase type inference issue
      const { data: topic, error: topicError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('id', id)
        .single()

      if (topicError) {
        return { topic: null, replies: null, error: topicError }
      }

      const { data: replies, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', id)
        .order('created_at', { ascending: true })

      return { 
        topic: topic as ForumTopic | null, 
        replies: replies as ForumReply[] | null, 
        error: repliesError 
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
      return { topic: null, replies: null, error }
    }
  },

  /**
   * Create a new topic
   */
  async createTopic(topic: Omit<ForumTopic, 'id' | 'views' | 'likes' | 'created_at' | 'updated_at'>): Promise<{
    data: ForumTopic | null
    error: any
  }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('forum_topics')
        .insert([topic as any])
        .select()
        .single()

      return { data: data as ForumTopic | null, error }
    } catch (error) {
      console.error('Error creating topic:', error)
      return { data: null, error }
    }
  },

  /**
   * Create a reply
   */
  async createReply(reply: Omit<ForumReply, 'id' | 'likes' | 'created_at' | 'updated_at'>): Promise<{
    data: ForumReply | null
    error: any
  }> {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('forum_replies')
        .insert([reply as any])
        .select()
        .single()

      return { data: data as ForumReply | null, error }
    } catch (error) {
      console.error('Error creating reply:', error)
      return { data: null, error }
    }
  },

  /**
   * Increment topic views
   */
  async incrementTopicViews(topicId: string): Promise<{ error: any }> {
    try {
      const { data, error: fetchError } = await supabase
        .from('forum_topics')
        .select('views')
        .eq('id', topicId)
        .single()

      if (fetchError) return { error: fetchError }

      const currentViews = (data as any)?.views || 0

      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('forum_topics')
        .update({ views: currentViews + 1 } as any)
        .eq('id', topicId)

      return { error }
    } catch (error) {
      console.error('Error incrementing views:', error)
      return { error }
    }
  },

  /**
   * Toggle like on topic
   */
  async toggleTopicLike(topicId: string, userId: string): Promise<{ liked: boolean; error: any }> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single()

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', userId)
          .eq('topic_id', topicId)

        if (deleteError) return { liked: true, error: deleteError }

        // Decrement likes count
        await this.updateTopicLikesCount(topicId, -1)

        return { liked: false, error: null }
      } else {
        // Like
        // @ts-ignore - Supabase type inference issue
        const { error: insertError } = await supabase
          .from('forum_likes')
          .insert([{ user_id: userId, topic_id: topicId } as any])

        if (insertError) return { liked: false, error: insertError }

        // Increment likes count
        await this.updateTopicLikesCount(topicId, 1)

        return { liked: true, error: null }
      }
    } catch (error) {
      console.error('Error toggling topic like:', error)
      return { liked: false, error }
    }
  },

  /**
   * Toggle like on reply
   */
  async toggleReplyLike(replyId: string, userId: string): Promise<{ liked: boolean; error: any }> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('reply_id', replyId)
        .single()

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', userId)
          .eq('reply_id', replyId)

        if (deleteError) return { liked: true, error: deleteError }

        // Decrement likes count
        await this.updateReplyLikesCount(replyId, -1)

        return { liked: false, error: null }
      } else {
        // Like
        // @ts-ignore - Supabase type inference issue
        const { error: insertError } = await supabase
          .from('forum_likes')
          .insert([{ user_id: userId, reply_id: replyId } as any])

        if (insertError) return { liked: false, error: insertError }

        // Increment likes count
        await this.updateReplyLikesCount(replyId, 1)

        return { liked: true, error: null }
      }
    } catch (error) {
      console.error('Error toggling reply like:', error)
      return { liked: false, error }
    }
  },

  /**
   * Update topic likes count
   */
  async updateTopicLikesCount(topicId: string, increment: number): Promise<{ error: any }> {
    try {
      const { data, error: fetchError } = await supabase
        .from('forum_topics')
        .select('likes')
        .eq('id', topicId)
        .single()

      if (fetchError) return { error: fetchError }

      const currentLikes = (data as any)?.likes || 0

      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('forum_topics')
        .update({ likes: currentLikes + increment } as any)
        .eq('id', topicId)

      return { error }
    } catch (error) {
      console.error('Error updating topic likes:', error)
      return { error }
    }
  },

  /**
   * Update reply likes count
   */
  async updateReplyLikesCount(replyId: string, increment: number): Promise<{ error: any }> {
    try {
      const { data, error: fetchError } = await supabase
        .from('forum_replies')
        .select('likes')
        .eq('id', replyId)
        .single()

      if (fetchError) return { error: fetchError }

      const currentLikes = (data as any)?.likes || 0

      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('forum_replies')
        .update({ likes: currentLikes + increment } as any)
        .eq('id', replyId)

      return { error }
    } catch (error) {
      console.error('Error updating reply likes:', error)
      return { error }
    }
  },

  /**
   * Search topics
   */
  async searchTopics(query: string): Promise<{ data: ForumTopic[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      return { data: data as ForumTopic[] | null, error }
    } catch (error) {
      console.error('Error searching topics:', error)
      return { data: null, error }
    }
  },

  /**
   * Filter topics by category
   */
  async filterByCategory(category: string): Promise<{ data: ForumTopic[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      return { data: data as ForumTopic[] | null, error }
    } catch (error) {
      console.error('Error filtering topics by category:', error)
      return { data: null, error }
    }
  }
}
