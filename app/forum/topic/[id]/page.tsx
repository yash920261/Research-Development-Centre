"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Share2, ThumbsUp, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ForumReplyForm from "@/components/forum-reply-form"
import { forumService } from "@/lib/services/forum.service"
import type { ForumTopic, ForumReply } from "@/types/database.types"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface TopicPageProps {
  params: { id: string }
}

export default function TopicPage({ params }: TopicPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadTopic() {
      setLoading(true)
      const { topic: topicData, replies: repliesData, error } = await forumService.getTopicById(params.id)
      
      if (error) {
        console.error('Error loading topic:', error)
        setTopic(null)
        setReplies([])
      } else {
        setTopic(topicData)
        setReplies(repliesData || [])
      }
      
      setLoading(false)
    }

    loadTopic()
  }, [params.id, refreshKey])

  const handleLikeTopic = async () => {
    if (!topic || !user) {
      toast.error('Please log in to like this topic')
      return
    }
    
    const { liked, error } = await forumService.toggleTopicLike(topic.id, user.id)
    if (error) {
      console.error('Error liking topic:', error)
      toast.error('Failed to like topic')
    } else {
      setIsLiked(liked)
      setRefreshKey((prev) => prev + 1)
      toast.success(liked ? 'Topic liked!' : 'Like removed')
    }
  }

  const handleLikeReply = async (replyId: string) => {
    if (!user) {
      toast.error('Please log in to like this reply')
      return
    }
    
    const { liked, error } = await forumService.toggleReplyLike(replyId, user.id)
    if (error) {
      console.error('Error liking reply:', error)
      toast.error('Failed to like reply')
    } else {
      setRefreshKey((prev) => prev + 1)
      toast.success(liked ? 'Reply liked!' : 'Like removed')
    }
  }

  const handleReplySuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleDeleteTopic = async () => {
    if (!topic) return

    setIsDeleting(true)
    const { error } = await forumService.deleteTopic(topic.id)

    if (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete discussion')
      setIsDeleting(false)
    } else {
      toast.success('Discussion deleted successfully')
      // Redirect to forum page after successful deletion
      router.push('/forum')
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container py-10">
        <p className="text-center text-muted-foreground">Discussion not found</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/forum" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Forums
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{topic.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {topic.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="bg-amber-50 text-background">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {user?.role === 'admin' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Discussion
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={topic.author_avatar || "/placeholder.svg"} alt={topic.author_name} />
                <AvatarFallback>{topic.author_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{topic.author_name}</p>
                <p className="text-xs text-muted-foreground">{topic.author_department}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Posted on {new Date(topic.created_at).toLocaleDateString()}</div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-wrap text-foreground">{topic.content}</div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>{replies.length} replies</span>
              </div>
              <div className="flex items-center">
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{topic.likes} likes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleLikeTopic} disabled={isLiked}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Replies ({replies.length})</h2>

          {replies.length === 0 ? (
            <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={reply.author_avatar || "/placeholder.svg"} alt={reply.author_name} />
                      <AvatarFallback>{reply.author_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{reply.author_name}</p>
                      <p className="text-xs text-muted-foreground">{reply.author_department}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{reply.content}</div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      <span>{reply.likes} likes</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleLikeReply(reply.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Like
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Add Your Reply</h2>
          <ForumReplyForm topicId={params.id} onSuccess={handleReplySuccess} />
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discussion? This action cannot be undone and will also delete all {replies.length} {replies.length === 1 ? 'reply' : 'replies'} to this discussion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
