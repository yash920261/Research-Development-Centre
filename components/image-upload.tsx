"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload to a cloud service like Cloudinary or AWS S3
      // For demo purposes, we'll create a local URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label>Profile Picture</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, at least 300x300px</p>
        </div>
      </div>
    </div>
  )
}
