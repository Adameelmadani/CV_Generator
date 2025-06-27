"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Plus, ArrowRight, Cloud } from "lucide-react"
import Link from "next/link"

export default function CVChoicePage() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    console.log("Files uploaded:", files)
    // Handle file upload logic here
    // Redirect to CV builder with imported data
    window.location.href = "/builder"
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CVCraft</span>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Import Your CV</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Drag and drop your file or browse your documents
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-blue-100 p-6 rounded-full">
                  <Cloud className="h-12 w-12 text-blue-600" />
                </div>

                <div className="space-y-2">
                  <p className="text-xl font-medium text-gray-900">Drag and drop your CV here</p>
                  <p className="text-gray-600">or click to select a file</p>
                </div>

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".doc,.docx,.pdf,.htm,.html,.rtf,.txt"
                  onChange={handleFileInput}
                />

                <label htmlFor="file-upload">
                  <Button type="button" size="lg" className="bg-blue-600 hover:bg-blue-700 px-8" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-5 w-5 mr-2" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Supported formats */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Supported formats:</strong> DOC, DOCX, PDF, HTM, RTF, TXT
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            {/* Create new CV option */}
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">Prefer to start from scratch?</p>
              <Link href="/builder">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New CV
                </Button>
              </Link>
            </div>

            {/* Next button */}
            <div className="pt-6">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
