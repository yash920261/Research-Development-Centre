"use client"

import { useState } from "react"
import { Mail, Send, User, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ProjectSubmission } from "@/lib/services/project.service"

interface ReplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectSubmission
}

export default function ReplyDialog({ open, onOpenChange, project }: ReplyDialogProps) {
  const [subject, setSubject] = useState(`Re: ${project.project_title}`)
  const [message, setMessage] = useState(
    `Dear ${project.name},

Thank you for submitting your project idea "${project.project_title}".

`
  )
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = () => {
    // Construct mailto link
    const mailtoLink = `mailto:${project.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Show success message
    toast.success("Email client opened")
    
    // Close dialog
    onOpenChange(false)
  }

  const handleCopyToClipboard = async () => {
    const emailContent = `To: ${project.email}\nSubject: ${subject}\n\n${message}`
    
    try {
      await navigator.clipboard.writeText(emailContent)
      toast.success("Email content copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-500" />
            Reply to Student
          </DialogTitle>
          <DialogDescription>
            Send a response to the student regarding their project submission
          </DialogDescription>
        </DialogHeader>

        {/* Project Summary */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{project.project_title}</h3>
            <Badge variant={
              project.status === "approved" ? "default" : 
              project.status === "rejected" ? "destructive" : 
              "outline"
            }>
              {project.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{project.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{project.email}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-500/20">
            <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
            <p className="text-sm line-clamp-3">{project.project_description}</p>
          </div>

          {project.resources && (
            <div className="pt-2 border-t border-amber-500/20">
              <p className="text-sm font-medium text-muted-foreground mb-1">Resources Needed:</p>
              <p className="text-sm line-clamp-2">{project.resources}</p>
            </div>
          )}
        </div>

        {/* Email Compose Form */}
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              value={project.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[200px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            type="button"
          >
            Copy to Clipboard
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending || !subject.trim() || !message.trim()}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Open in Email Client
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          This will open your default email client with the pre-filled message
        </p>
      </DialogContent>
    </Dialog>
  )
}
