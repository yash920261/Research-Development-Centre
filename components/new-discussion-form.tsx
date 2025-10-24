"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { forumService } from "@/lib/services/forum.service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface NewDiscussionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CATEGORIES = [
  "Technology & Innovation",
  "Research Methodologies",
  "Collaboration Opportunities",
  "Funding & Resources",
  "General Discussion",
]

const TAGS_LIST = [
  "Machine Learning",
  "Climate Science",
  "Data Analysis",
  "Sustainability",
  "Architecture",
  "Qualitative Research",
  "Quantum Computing",
  "Funding",
  "Grants",
  "Undergraduate Research",
]

export default function NewDiscussionForm({ open, onOpenChange, onSuccess }: NewDiscussionFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    console.log('📝 Form submitted')

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    if (!content.trim()) {
      setError("Please enter discussion content")
      return
    }

    if (!category) {
      setError("Please select a category")
      return
    }

    if (selectedTags.length === 0) {
      setError("Please select at least one tag")
      return
    }

    if (!user) {
      setError("You must be logged in to create a discussion")
      toast.error("Please log in to create a discussion")
      return
    }

    setIsSubmitting(true)

    console.log('🚀 Starting discussion creation...')
    console.log('📋 Form data:', { title, category, tags: selectedTags })
    console.log('👤 User:', { id: user.id, name: user.name })

    try {
      const topicData = {
        title,
        content,
        author_id: user.id,
        author_name: user.name,
        author_avatar: "/placeholder.svg?height=40&width=40",
        author_department: user.department || "Unknown Department",
        category,
        tags: selectedTags,
      }

      console.log('📤 Sending to Supabase:', topicData)

      const { data, error: submitError } = await forumService.createTopic(topicData)

      console.log('📥 Supabase response:', { data, error: submitError })

      if (submitError) {
        console.error('❌ Error creating topic:', submitError)
        console.error('Error details:', JSON.stringify(submitError, null, 2))
        setError("Failed to create discussion. Please try again.")
        toast.error(`Failed to create discussion: ${submitError.message || 'Unknown error'}`)
        return
      }

      console.log('✅ Discussion created successfully!', data)
      toast.success("Discussion created successfully!")
      
      // Reset form
      setTitle("")
      setContent("")
      setCategory("")
      setSelectedTags([])
      setError("")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('💥 Exception caught:', err)
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      setError("Failed to create discussion. Please try again.")
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      // ALWAYS stop loading, no matter what
      console.log('🏁 Setting isSubmitting to false')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="What's your discussion about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe your discussion in detail. Be clear and specific about what you're asking or proposing."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <p className="text-xs text-muted-foreground mb-2">Select at least one tag</p>
            <div className="flex flex-wrap gap-2">
              {TAGS_LIST.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1"
                >
                  <span className="text-xs">{tag}</span>
                  <button type="button" onClick={() => toggleTag(tag)} className="text-amber-700 hover:text-amber-900">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Discussion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
