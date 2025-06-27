"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus, Edit, X } from "lucide-react"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

export function WelcomeModal({ isOpen, onClose, userName = "User" }: WelcomeModalProps) {
  const handleCreateNew = () => {
    onClose()
    window.location.href = "/cv-choice"
  }

  const handleContinueExisting = () => {
    onClose()
    window.location.href = "/builder"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid lg:grid-cols-2 min-h-[500px]">
          {/* Left Side - Content */}
          <div className="p-12 flex flex-col justify-center space-y-8 bg-white">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900">Hello {userName}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Continue your job search and select the option that suits you best.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleCreateNew}
                variant="outline"
                size="lg"
                className="w-full justify-start py-6 text-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 h-auto"
              >
                <Plus className="h-6 w-6 mr-4" />
                <span>Create New CV</span>
              </Button>

              <Button
                onClick={handleContinueExisting}
                size="lg"
                className="w-full justify-start py-6 text-lg bg-teal-600 hover:bg-teal-700 h-auto"
              >
                <Edit className="h-6 w-6 mr-4" />
                <span>Finish My CV</span>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>You can always change your option later</p>
            </div>
          </div>

          {/* Right Side - CV Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 flex items-center justify-center">
            <div className="relative">
              {/* CV Template Mockup */}
              <div className="bg-white rounded-lg shadow-xl p-8 w-80 h-96 border">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <h3 className="font-bold text-lg text-gray-900">John Doe</h3>
                    <p className="text-sm text-gray-600">Software Engineer</p>
                  </div>

                  {/* Content sections */}
                  <div className="space-y-3">
                    <div>
                      <div className="h-3 bg-blue-200 rounded w-20 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-3 bg-green-200 rounded w-24 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-3 bg-purple-200 rounded w-16 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional badge */}
              <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Professional
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
