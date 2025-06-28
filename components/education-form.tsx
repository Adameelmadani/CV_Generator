"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import type { Education } from "../types/cv"
import { v4 as uuidv4 } from 'uuid'

interface EducationFormProps {
  initialData?: Education[]
  onSubmit: (data: Education[]) => void
  onSkip: () => void
}

export default function EducationForm({ initialData = [], onSubmit, onSkip }: EducationFormProps) {
  const [educations, setEducations] = useState<Education[]>(() => {
    // Initialize with initialData or create one empty education entry
    return initialData?.length > 0 
      ? initialData
      : [{ 
          id: uuidv4(), 
          degree: "", 
          institution: "", 
          city: "", 
          startDate: "", 
          endDate: "", 
          isCurrently: false, 
          description: "" 
        }]
  })

  // Fix 1: Properly handle checkbox changes
  const handleCurrentlyStudying = (index: number, checked: boolean) => {
    setEducations(prev => 
      prev.map((edu, i) => 
        i === index 
          ? { ...edu, isCurrently: checked, endDate: checked ? "" : edu.endDate } 
          : edu
      )
    )
  }

  // Fix 2: Properly handle field changes
  const handleFieldChange = (index: number, field: keyof Education, value: string | boolean) => {
    setEducations(prev =>
      prev.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    )
  }

  // Fix 3: Properly add new education without losing data
  const addEducation = () => {
    setEducations(prev => [
      ...prev,
      { 
        id: uuidv4(), 
        degree: "", 
        institution: "", 
        city: "", 
        startDate: "", 
        endDate: "", 
        isCurrently: false, 
        description: "" 
      }
    ])
  }

  // Fix 4: Properly remove education without causing issues
  const removeEducation = (id: string) => {
    setEducations(prev => prev.filter(edu => edu.id !== id))
  }

  // Fix 5: Add validation to ensure the form isn't submitted empty
  const handleSubmit = () => {
    // Filter out completely empty education entries
    const validEducations = educations.filter(
      edu => edu.degree || edu.institution || edu.city || edu.startDate || edu.description
    )
    onSubmit(validEducations)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Formation académique</h2>
          <Button onClick={addEducation} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une formation
          </Button>
        </div>

        {educations.map((edu, index) => (
          <div key={edu.id} className="space-y-4 p-4 border rounded-md">
            <div className="flex justify-between">
              <h3 className="font-medium">Formation {index + 1}</h3>
              {educations.length > 1 && (
                <Button
                  onClick={() => removeEducation(edu.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`degree-${edu.id}`}>Diplôme / Formation</Label>
                <Input
                  id={`degree-${edu.id}`}
                  value={edu.degree}
                  onChange={(e) => handleFieldChange(index, "degree", e.target.value)}
                  placeholder="Master en Informatique"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`institution-${edu.id}`}>Établissement</Label>
                <Input
                  id={`institution-${edu.id}`}
                  value={edu.institution}
                  onChange={(e) => handleFieldChange(index, "institution", e.target.value)}
                  placeholder="Université de Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`city-${edu.id}`}>Ville</Label>
                <Input
                  id={`city-${edu.id}`}
                  value={edu.city}
                  onChange={(e) => handleFieldChange(index, "city", e.target.value)}
                  placeholder="Paris, France"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`startDate-${edu.id}`}>Date de début</Label>
                <Input
                  id={`startDate-${edu.id}`}
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => handleFieldChange(index, "startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id={`currently-${edu.id}`} 
                    checked={edu.isCurrently} 
                    onCheckedChange={(checked) => handleCurrentlyStudying(index, checked === true)}
                  />
                  <Label htmlFor={`currently-${edu.id}`}>Je suis actuellement en formation</Label>
                </div>
                {!edu.isCurrently && (
                  <>
                    <Label htmlFor={`endDate-${edu.id}`}>Date de fin</Label>
                    <Input
                      id={`endDate-${edu.id}`}
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => handleFieldChange(index, "endDate", e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`description-${edu.id}`}>Description (optionnel)</Label>
              <Textarea
                id={`description-${edu.id}`}
                value={edu.description}
                onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                placeholder="Décrivez votre parcours, spécialisations, projets académiques..."
                rows={3}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onSkip}>
            Passer cette étape
          </Button>
          <Button onClick={handleSubmit}>
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
