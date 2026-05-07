'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showError } from '@/lib/showError'

type UploadFieldProps = {
  label: string
  endpoint: string // bv. '/api/uploads/boulders-images'
  accept: string // bv. 'image/*' of 'video/mp4,video/webm'
  value?: string // huidige url (uit state/db)
  onUploaded: (url: string) => void

  helperTextWhenEmpty?: string
  buttonText?: string

  preview?: 'image' | 'video' | 'none'
  maxPreviewHeightClassName?: string
}

export function UploadField({
  label,
  endpoint,
  accept,
  value,
  onUploaded,
  helperTextWhenEmpty = 'No file uploaded yet',
  buttonText = 'Upload',
  preview = 'none',
  maxPreviewHeightClassName = 'max-h-48',
}: UploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const clearSelection = () => {
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = '' //  belangrijk: reset native file input
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('No file selected')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch(endpoint, { method: 'POST', body: formData })

      // eerst proberen JSON te lezen
      const text = await res.text().catch(() => '')
      let json: any = null
      try {
        json = text ? JSON.parse(text) : null
      } catch {
        showError(`Upload failed (${res.status}). ${text || 'No JSON returned'}`)
        return
      }


      if (!res.ok || !json?.ok) {
        showError(json?.error || `Upload failed (${res.status})`)
        return
      }

      onUploaded(json.url as string)

      // reset state + input zodat volgende upload altijd werkt
      clearSelection()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : buttonText}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          disabled={isUploading && !selectedFile}
        >
          Clear
        </Button>

        <span className="text-sm text-muted-foreground">
          {value ? value : helperTextWhenEmpty}
        </span>
      </div>

      {preview === 'image' && value ? (
        
        <img
          src={value}
          alt="Preview"
          className={`mt-2 rounded-md border object-contain ${maxPreviewHeightClassName}`}
        />
      ) : null}

      {preview === 'video' && value ? (
        <video className="mt-2 w-full rounded-md border" controls src={value} />
      ) : null}
    </div>
  )
}
