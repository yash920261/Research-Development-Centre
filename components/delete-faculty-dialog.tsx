"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { facultyService } from "@/lib/services/faculty.service"
import { toast } from "sonner"

interface DeleteFacultyDialogProps {
  faculty: {
    id?: string
    name: string
    title: string
    department: string
  }
  onDeleteFaculty: (facultyId: string) => void
}

export default function DeleteFacultyDialog({ faculty, onDeleteFaculty }: DeleteFacultyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await facultyService.delete(faculty.id || "")

      if (error) {
        console.error('Error deleting faculty:', error)
        toast.error('Failed to delete faculty member. Please try again.')
        setIsLoading(false)
        return
      }

      onDeleteFaculty(faculty.id || "")
      toast.success('Faculty member deleted successfully!')
      setIsOpen(false)
    } catch (error) {
      console.error('Error deleting faculty:', error)
      toast.error('Failed to delete faculty member. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Faculty Member
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the faculty member's profile and all associated
            data.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> You are about to permanently delete the following faculty member:
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="font-semibold">{faculty.name}</div>
          <div className="text-sm text-muted-foreground">{faculty.title}</div>
          <div className="text-sm text-muted-foreground">{faculty.department}</div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Faculty Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
