"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Plus } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import { facultyService } from "@/lib/services/faculty.service"
import { toast } from "sonner"

interface AddFacultyDialogProps {
  onAddFaculty: (facultyData: any) => void
}

export default function AddFacultyDialog({ onAddFaculty }: AddFacultyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const { data, error } = await facultyService.create({
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
        image: profileImage || "/placeholder.svg?height=300&width=300",
        web_profile: {
          personal_statement: formData.get("personalStatement") as string || null,
          website: formData.get("website") as string || null,
          biography: formData.get("biography") as string || null,
          teaching_philosophy: formData.get("teachingPhilosophy") as string || null,
          achievements: (formData.get("achievements") as string)?.split(",").map((s) => s.trim()) || [],
          collaboration_interests: formData.get("collaborationInterests") as string || null,
        },
        analytics: {
          profile_views: 0,
          contact_clicks: 0,
          project_views: 0,
          last_updated: new Date().toISOString(),
        },
      })

      if (error) {
        console.error('Error creating faculty:', error)
        toast.error('Failed to add faculty member. Please try again.')
        setIsLoading(false)
        return
      }

      if (data) {
        onAddFaculty(data)
        toast.success('Faculty member added successfully!')
        setIsOpen(false)
        setProfileImage("")

        // Reset form using ref
        if (formRef.current) {
          formRef.current.reset()
        }
      }
    } catch (error) {
      console.error('Error adding faculty:', error)
      toast.error('Failed to add faculty member. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
          <DialogDescription>Fill in the details to add a new faculty member to the R&D center.</DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload value={profileImage} onChange={setProfileImage} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" placeholder="e.g., Professor, Associate Professor" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select name="department" required>
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
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="office">Office Location *</Label>
              <Input id="office" name="office" placeholder="e.g., Block A, Room 301" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience *</Label>
              <Input id="experience" name="experience" placeholder="e.g., 15+ years" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education *</Label>
            <Input id="education" name="education" placeholder="e.g., Ph.D. in Computer Science, IIT Delhi" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization (comma-separated) *</Label>
            <Input
              id="specialization"
              name="specialization"
              placeholder="e.g., AI, Machine Learning, Data Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="researchInterests">Research Interests (comma-separated) *</Label>
            <Input
              id="researchInterests"
              name="researchInterests"
              placeholder="e.g., AI in Healthcare, NLP, Computer Vision"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publications">Publications *</Label>
              <Input id="publications" name="publications" placeholder="e.g., 50+ research papers" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projects">Current Projects (comma-separated) *</Label>
              <Input id="projects" name="projects" placeholder="e.g., Smart Healthcare, AI Platform" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalStatement">Personal Statement</Label>
            <Textarea id="personalStatement" name="personalStatement" placeholder="Brief personal statement..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Personal Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biography</Label>
            <Textarea id="biography" name="biography" placeholder="Extended biography..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teachingPhilosophy">Teaching Philosophy</Label>
            <Textarea
              id="teachingPhilosophy"
              name="teachingPhilosophy"
              placeholder="Teaching approach and philosophy..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Recent Achievements (comma-separated)</Label>
            <Textarea id="achievements" name="achievements" placeholder="Recent accomplishments..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborationInterests">Collaboration Interests</Label>
            <Textarea
              id="collaborationInterests"
              name="collaborationInterests"
              placeholder="Areas of collaboration interest..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding Faculty..." : "Add Faculty Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
