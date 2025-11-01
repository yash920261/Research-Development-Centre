"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { contactService } from "@/lib/services/contact.service"
import { toast } from "sonner"

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    message: "",
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

    console.log('🚀 Starting contact form submission...')
    console.log('📋 Form data:', formData)

    try {
      const { data, error } = await contactService.submit({
        name: formData.name,
        email: formData.email,
        inquiry_type: formData.inquiryType,
        message: formData.message,
      })

      console.log('📥 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Error submitting contact message:', error)
        const errorMessage = error.message || error.toString() || 'Unknown error'
        toast.error(`Failed to send message: ${errorMessage}`)
        return
      }

      if (!data) {
        console.error('⚠️ No data returned but no error either')
        toast.error('Message may not have been sent - please try again')
        return
      }

      console.log('✅ Contact message sent successfully!', data)
      toast.success('Message sent successfully!')
      setSubmitted(true)
    } catch (error) {
      console.error('💥 Exception caught:', error)
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
      inquiryType: "",
      message: "",
    })
    console.log('✅ Form reset complete')
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold">Message Sent!</h3>
        <p className="text-center text-muted-foreground">
          Thank you for contacting us. We'll get back to you as soon as possible.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>From:</strong> {formData.name}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Inquiry Type:</strong> {formData.inquiryType}
          </p>
        </div>
        <Button onClick={resetForm}>Send Another Message</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="contact-name">Name *</Label>
        <Input
          id="contact-name"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-email">Email *</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="inquiry-type">Inquiry Type *</Label>
        <Select
          value={formData.inquiryType}
          onValueChange={(value) => handleInputChange("inquiryType", value)}
          required
        >
          <SelectTrigger id="inquiry-type">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Information</SelectItem>
            <SelectItem value="project">Project Support</SelectItem>
            <SelectItem value="mentorship">Mentorship</SelectItem>
            <SelectItem value="partnership">Partnership Opportunities</SelectItem>
            <SelectItem value="faculty">Faculty Inquiries</SelectItem>
            <SelectItem value="research">Research Collaboration</SelectItem>
            <SelectItem value="technical">Technical Support</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          placeholder="How can we help you?"
          className="min-h-[120px]"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending Message..." : "Send Message"}
      </Button>
    </form>
  )
}
