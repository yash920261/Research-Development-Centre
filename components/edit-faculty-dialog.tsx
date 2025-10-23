"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import { facultyService } from "@/lib/services/faculty.service"
import { toast } from "sonner"

interface EditFacultyDialogProps {
  faculty: any
  onEditFaculty: (facultyData: any) => void
}

export default function EditFacultyDialog({ faculty, onEditFaculty }: EditFacultyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(faculty.image || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const { data, error } = await facultyService.update(faculty.id, {
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        department: formData.get("department") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        office: formData.get("office") as string,
        experience: formData.get("experience") as string,
        education: formData.get("education") as string,
        specialization: (formData.get("specialization") as string).split(",").map((s) => s.trim()),
        research_interests: (formData.get("researchInterests") as string).split(",").map((s) => s.trim()),
        publications: formData.get("publications") as string,
        projects: (formData.get("projects") as string).split(",").map((s) => s.trim()),
        image: profileImage,
        web_profile: {
          personal_statement: formData.get("personalStatement") as string || null,
          website: formData.get("website") as string || null,
          biography: formData.get("biography") as string || null,
          teaching_philosophy: formData.get("teachingPhilosophy") as string || null,
          achievements: (formData.get("achievements") as string)?.split(",").map((s) => s.trim()) || [],
          collaboration_interests: formData.get("collaborationInterests") as string || null,
        },
      })

      if (error) {
        console.error('Error updating faculty:', error)
        toast.error('Failed to update faculty member. Please try again.')
        setIsLoading(false)
        return
      }

      if (data) {
        onEditFaculty(data)
        toast.success('Faculty member updated successfully!')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error updating faculty:', error)
      toast.error('Failed to update faculty member. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Faculty Member</DialogTitle>
          <DialogDescription>Update the faculty member's information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload value={profileImage} onChange={setProfileImage} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input id="edit-name" name="name" defaultValue={faculty.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" name="title" defaultValue={faculty.title} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-department">Department *</Label>
            <Select name="department" defaultValue={faculty.department} required>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={faculty.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input id="edit-phone" name="phone" defaultValue={faculty.phone} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-office">Office Location *</Label>
              <Input id="edit-office" name="office" defaultValue={faculty.office} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Experience *</Label>
              <Input id="edit-experience" name="experience" defaultValue={faculty.experience} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-education">Education *</Label>
            <Input id="edit-education" name="education" defaultValue={faculty.education} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-specialization">Specialization (comma-separated) *</Label>
            <Input
              id="edit-specialization"
              name="specialization"
              defaultValue={faculty.specialization?.join(", ")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-researchInterests">Research Interests (comma-separated) *</Label>
            <Input
              id="edit-researchInterests"
              name="researchInterests"
              defaultValue={faculty.researchInterests?.join(", ")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-publications">Publications *</Label>
              <Input id="edit-publications" name="publications" defaultValue={faculty.publications} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-projects">Current Projects (comma-separated) *</Label>
              <Input id="edit-projects" name="projects" defaultValue={faculty.projects?.join(", ")} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-personalStatement">Personal Statement</Label>
            <Textarea
              id="edit-personalStatement"
              name="personalStatement"
              defaultValue={faculty.webProfile?.personalStatement}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-website">Personal Website</Label>
            <Input
              id="edit-website"
              name="website"
              type="url"
              defaultValue={faculty.webProfile?.website}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-biography">Biography</Label>
            <Textarea id="edit-biography" name="biography" defaultValue={faculty.webProfile?.biography} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-teachingPhilosophy">Teaching Philosophy</Label>
            <Textarea
              id="edit-teachingPhilosophy"
              name="teachingPhilosophy"
              defaultValue={faculty.webProfile?.teachingPhilosophy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-achievements">Recent Achievements (comma-separated)</Label>
            <Textarea
              id="edit-achievements"
              name="achievements"
              defaultValue={faculty.webProfile?.achievements?.join(", ")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collaborationInterests">Collaboration Interests</Label>
            <Textarea
              id="edit-collaborationInterests"
              name="collaborationInterests"
              defaultValue={faculty.webProfile?.collaborationInterests}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating Faculty..." : "Update Faculty Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
