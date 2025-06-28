"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Template } from "../types/cv"

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void
}

const templates: Template[] = [
  {
    id: "modern",
    name: "Moderne",
    description: "Design épuré et contemporain avec une mise en page claire",
    preview: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "classic",
    name: "Classique",
    description: "Format traditionnel adapté aux secteurs conservateurs",
    preview: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "creative",
    name: "Créatif",
    description: "Design original pour les métiers créatifs et artistiques",
    preview: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Optimisé pour les développeurs et professions techniques",
    preview: "/placeholder.svg?height=300&width=200",
  },
]

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template.id)
    onTemplateSelect(template)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisissez votre template de CV</h1>
        <p className="text-muted-foreground">
          Sélectionnez le modèle qui correspond le mieux à votre profil professionnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(template)}
          >
            <CardHeader className="pb-2">
              <div className="aspect-[3/4] bg-muted rounded-md mb-3 overflow-hidden">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={`Aperçu ${template.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-3">{template.description}</CardDescription>
              {selectedTemplate === template.id && (
                <Badge variant="default" className="w-full justify-center">
                  Sélectionné
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="text-center mt-8">
          <Button
            size="lg"
            onClick={() => {
              const template = templates.find((t) => t.id === selectedTemplate)
              if (template) onTemplateSelect(template)
            }}
          >
            Continuer avec ce template
          </Button>
        </div>
      )}
    </div>
  )
}
