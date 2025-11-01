"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { projectService } from "@/lib/services/project.service"
import { toast } from "sonner"

export default function ProjectSubmissionForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    projectTitle: "",
    projectDescription: "",
    resources: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isLoading) {
      console.log('⚠️ Already submitting, ignoring duplicate request')
      return
    }
    
    setIsLoading(true)

    console.log('🚀 Starting project submission...')
    console.log('📋 Form data:', formData)

    try {
      const submissionData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        project_title: formData.projectTitle,
        project_description: formData.projectDescription,
        resources: formData.resources || null,
      }

      console.log('📤 Sending to Supabase:', submissionData)

      const { data, error } = await projectService.submit(submissionData)

      console.log('📥 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Error submitting project:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // More detailed error message
        const errorMessage = error.message || error.toString() || 'Unknown error'
        toast.error(`Failed to submit: ${errorMessage}`)
        return
      }

      if (!data) {
        console.error('⚠️ No data returned but no error either')
        toast.error('Submission may have failed - please check Supabase')
        return
      }

      console.log('✅ Project submitted successfully!', data)
      toast.success('Project submitted successfully!')
      setSubmitted(true)
    } catch (error) {
      console.error('💥 Exception caught:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      // ALWAYS stop loading, no matter what
      console.log('🏁 Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    console.log('🔄 Resetting form...')
    setSubmitted(false)
    setIsLoading(false)  // Make sure loading is false
    setFormData({
      name: "",
      email: "",
      department: "",
      projectTitle: "",
      projectDescription: "",
      resources: "",
    })
    console.log('✅ Form reset complete')
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold">Submission Received!</h3>
        <p className="text-center text-muted-foreground">
          Thank you for submitting your project idea. Our team will review your submission and get back to you within
          3-5 business days.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Project:</strong> {formData.projectTitle}
          </p>
          <p>
            <strong>Submitted by:</strong> {formData.name}
          </p>
          <p>
            <strong>Department:</strong> {formData.department}
          </p>
        </div>
        <Button onClick={resetForm}>Submit Another Idea</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your university email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="department">Department *</Label>
        <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)} required>
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="computer-science">Computer Science</SelectItem>
            <SelectItem value="electronics-communication">Electronics & Communication</SelectItem>
            <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
            <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
            <SelectItem value="biotechnology">Biotechnology</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="psychology">Psychology</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="arts">Arts & Humanities</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project-title">Project Title *</Label>
        <Input
          id="project-title"
          placeholder="A concise title for your project"
          value={formData.projectTitle}
          onChange={(e) => handleInputChange("projectTitle", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project-description">Project Description *</Label>
        <Textarea
          id="project-description"
          placeholder="Describe your project idea, its objectives, and potential impact"
          className="min-h-[120px]"
          value={formData.projectDescription}
          onChange={(e) => handleInputChange("projectDescription", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="resources">Resources Needed</Label>
        <Textarea
          id="resources"
          placeholder="What resources, equipment, or support would you need to complete this project?"
          className="min-h-[80px]"
          value={formData.resources}
          onChange={(e) => handleInputChange("resources", e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting Project Idea..." : "Submit Project Idea"}
      </Button>
    </form>
  )
}
