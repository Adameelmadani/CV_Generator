"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Upload, Plus, ArrowRight, Cloud, X } from "lucide-react"

interface CVChoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CVChoiceModal({ isOpen, onClose }: CVChoiceModalProps) {
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
    console.log("Fichiers importés :", files)
    onClose()
    window.location.href = "/builder"
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleCreateNew = () => {
    onClose()
    window.location.href = "/builder"
  }

  const handleBrowseFiles = () => {
    document.getElementById("cv-file-upload")?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>

        <div className="p-8">
          <DialogHeader className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CVCraft</span>
            </div>
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">Importer votre CV</DialogTitle>
            <p className="text-gray-600 text-lg">Glissez-déposez votre fichier ou parcourez vos documents</p>
          </DialogHeader>

          <div className="space-y-8">
            {/* Zone d'import */}
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
                  <p className="text-xl font-medium text-gray-900">Glissez et déposez votre CV ici</p>
                  <p className="text-gray-600">ou cliquez pour sélectionner un fichier</p>
                </div>

                <input
                  type="file"
                  id="cv-file-upload"
                  className="hidden"
                  accept=".doc,.docx,.pdf,.htm,.html,.rtf,.txt"
                  onChange={handleFileInput}
                />

                <Button
                  type="button"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  onClick={handleBrowseFiles}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Parcourir les fichiers
                </Button>
              </div>
            </div>

            {/* Formats supportés */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Formats pris en charge :</strong> XML
              </p>
            </div>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
              </div>
            </div>

            {/* Option de création */}
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">Vous préférez commencer de zéro ?</p>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8"
                onClick={handleCreateNew}
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer un nouveau CV
              </Button>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleBrowseFiles}>
                Continuer
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
