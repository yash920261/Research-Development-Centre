"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Lightbulb, MessageSquare, Users, Beaker, BookOpen, Briefcase, Globe } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface CategoryStats {
  category: string
  topics: number
  posts: number
}

interface CategoryInfo {
  id: string
  title: string
  description: string
  icon: string
  topics: number
  posts: number
}

export default function ForumCategoryList() {
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Define category metadata
  const categoryMetadata: Record<string, { title: string; description: string; icon: string }> = {
    "Research": {
      title: "Research",
      description: "Discuss research methodologies, approaches, and best practices.",
      icon: "Beaker",
    },
    "Collaboration": {
      title: "Collaboration",
      description: "Find team members and collaborators for your research projects.",
      icon: "Users",
    },
    "General": {
      title: "General Discussion",
      description: "General topics, questions, and community discussions.",
      icon: "MessageSquare",
    },
    "Brainstorming": {
      title: "Brainstorming",
      description: "Share and develop innovative ideas and solutions.",
      icon: "Lightbulb",
    },
    "Resources": {
      title: "Academic Resources",
      description: "Share and discover helpful academic resources and tools.",
      icon: "BookOpen",
    },
    "Career": {
      title: "Career Development",
      description: "Discuss career paths, internships, and professional development.",
      icon: "Briefcase",
    },
  }

  useEffect(() => {
    fetchCategoryStats()
  }, [])

  async function fetchCategoryStats() {
    try {
      console.log('🔍 Fetching category statistics...')
      
      // Fetch all topics with their categories
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('category, id')

      if (topicsError) {
        console.error('Error fetching topics:', topicsError)
        setLoading(false)
        return
      }

      // Fetch all replies to count posts
      const { data: replies, error: repliesError } = await supabase
        .from('forum_replies')
        .select('topic_id')

      if (repliesError) {
        console.error('Error fetching replies:', repliesError)
      }

      // Calculate stats per category
      const statsMap: Record<string, CategoryStats> = {}

      // Count topics per category
      if (topics) {
        topics.forEach((topic: any) => {
          if (!statsMap[topic.category]) {
            statsMap[topic.category] = {
              category: topic.category,
              topics: 0,
              posts: 0,
            }
          }
          statsMap[topic.category].topics++
        })
      }

      // Count replies per category
      if (replies && topics) {
        const topicCategoryMap: Record<string, string> = {}
        topics.forEach((topic: any) => {
          topicCategoryMap[topic.id] = topic.category
        })

        replies.forEach((reply: any) => {
          const category = topicCategoryMap[reply.topic_id]
          if (category && statsMap[category]) {
            statsMap[category].posts++
          }
        })
      }

      // Convert to array and merge with metadata
      const categoryList: CategoryInfo[] = Object.values(statsMap).map((stat) => {
        const metadata = categoryMetadata[stat.category] || {
          title: stat.category,
          description: `Discussions about ${stat.category.toLowerCase()}`,
          icon: "MessageSquare",
        }

        return {
          id: stat.category.toLowerCase().replace(/\s+/g, '-'),
          title: metadata.title,
          description: metadata.description,
          icon: metadata.icon,
          topics: stat.topics,
          posts: stat.posts,
        }
      })

      // Sort by number of topics (most active first)
      categoryList.sort((a, b) => b.topics - a.topics)

      console.log('✅ Category stats:', categoryList)
      setCategories(categoryList)
      setLoading(false)
    } catch (error) {
      console.error('Exception fetching category stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full animate-pulse">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories found. Start a discussion to create the first category!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        // Determine which icon to use
        const iconMap: Record<string, any> = {
          "FileText": FileText,
          "Lightbulb": Lightbulb,
          "Users": Users,
          "Beaker": Beaker,
          "BookOpen": BookOpen,
          "Briefcase": Briefcase,
          "MessageSquare": MessageSquare,
          "Globe": Globe,
        }
        
        const IconComponent = iconMap[category.icon] || MessageSquare

        return (
          <Card key={category.id} className="h-full hover:border-amber-300 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <IconComponent className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription className="mt-1.5">{category.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  <span>{category.topics} {category.topics === 1 ? 'topic' : 'topics'}</span>
                </div>
                <div>
                  <span>{category.posts} {category.posts === 1 ? 'post' : 'posts'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
