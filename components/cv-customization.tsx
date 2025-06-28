"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Download, Palette, Type, Layout } from "lucide-react"
import CVPreview from "./cv-preview"
import type { CVData } from "../types/cv"

interface CVCustomizationProps {
  data: CVData
  onExport: (format: string) => void
}

export default function CVCustomization({ data, onExport }: CVCustomizationProps) {
  const [customization, setCustomization] = useState({
    template: "modern",
    fontSize: 12,
    colorScheme: "blue",
    showPhoto: true,
    showBirthDate: false,
    sectionOrder: ["experience", "education", "projects", "certificates", "achievements", "publications", "skills"],
  })

  const templates = [
    { id: "modern", name: "Moderne" },
    { id: "classic", name: "Classique" },
    { id: "creative", name: "Créatif" },
    { id: "tech", name: "Tech" },
  ]

  const colorSchemes = [
    { id: "blue", name: "Bleu", color: "bg-blue-500" },
    { id: "green", name: "Vert", color: "bg-green-500" },
    { id: "purple", name: "Violet", color: "bg-purple-500" },
    { id: "red", name: "Rouge", color: "bg-red-500" },
    { id: "gray", name: "Gris", color: "bg-gray-500" },
  ]

  const exportFormats = [
    { id: "pdf", name: "PDF", description: "Format standard pour l'impression" },
    { id: "tex", name: "LaTeX", description: "Code source LaTeX éditable" },
    { id: "png", name: "PNG", description: "Image haute résolution" },
    { id: "docx", name: "Word", description: "Document Microsoft Word" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Personnaliser votre CV</h1>
          <p className="text-muted-foreground">
            Ajustez l'apparence et l'organisation de votre CV selon vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panneau de personnalisation */}
          <div className="space-y-6">
            {/* Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Modèle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Choisir un modèle</Label>
                  <Select
                    value={customization.template}
                    onValueChange={(value) => setCustomization({ ...customization, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Apparence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => setCustomization({ ...customization, colorScheme: scheme.id })}
                        className={`w-8 h-8 rounded-full ${scheme.color} ${
                          customization.colorScheme === scheme.id ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Taille de police: {customization.fontSize}px</Label>
                  <Slider
                    value={[customization.fontSize]}
                    onValueChange={([value]) => setCustomization({ ...customization, fontSize: value })}
                    min={10}
                    max={16}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options d'affichage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Options d'affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-photo">Afficher la photo</Label>
                  <Switch
                    id="show-photo"
                    checked={customization.showPhoto}
                    onCheckedChange={(checked) => setCustomization({ ...customization, showPhoto: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-birthdate">Afficher la date de naissance</Label>
                  <Switch
                    id="show-birthdate"
                    checked={customization.showBirthDate}
                    onCheckedChange={(checked) => setCustomization({ ...customization, showBirthDate: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Télécharger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {exportFormats.map((format) => (
                    <Button
                      key={format.id}
                      variant="outline"
                      onClick={() => onExport(format.id)}
                      className="justify-start h-auto p-4 bg-transparent"
                    >
                      <div className="text-left">
                        <div className="font-medium">{format.name}</div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu */}
          <div className="lg:sticky lg:top-8">
            <CVPreview data={data} template={customization.template} />
          </div>
        </div>
      </div>
    </div>
  )
}
