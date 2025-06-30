"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import type { Education } from "../types/cv"

// Nettoyage : typage explicite des paramètres, suppression des commentaires obsolètes

interface EducationFormProps {
  initialData?: Education[]
  onSubmit: (data: Education[]) => void
  onChange?: (data: Education[]) => void
  onSkip?: () => void
}

export default function EducationForm({ initialData = [], onSubmit, onChange, onSkip }: EducationFormProps) {
  const [educations, setEducations] = useState<Education[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            degree: "",
            institution: "",
            city: "",
            startDate: "",
            endDate: "",
            isCurrently: false,
            description: "",
          },
        ],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: crypto.randomUUID(),
        degree: "",
        institution: "",
        city: "",
        startDate: "",
        endDate: "",
        isCurrently: false,
        description: "",
      },
    ])
  }

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      const newEducations = educations.filter((edu: Education) => edu.id !== id)
      setEducations(newEducations)
      // Nettoyer les erreurs de l'élément supprimé
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors }
        Object.keys(newErrors).forEach(key => {
          if (key.includes(id)) {
            delete newErrors[key]
          }
        })
        return newErrors
      })
    }
  }

  const handleFieldChange = (id: string, field: keyof Education, value: string | boolean) => {
    const updated = educations.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    setEducations(updated)
    
    // Nettoyer l'erreur pour ce champ spécifique
    const errorKey = `${field}-${id}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleCurrentlyChange = (id: string, checked: boolean) => {
    const updated = educations.map(edu => 
      edu.id === id 
        ? { ...edu, isCurrently: checked, endDate: checked ? "" : edu.endDate }
        : edu
    )
    setEducations(updated)
    
    // Nettoyer l'erreur de endDate si on coche "actuellement"
    if (checked) {
      const errorKey = `endDate-${id}`
      if (errors[errorKey]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[errorKey]
          return newErrors
        })
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    educations.forEach((edu: Education) => {
      if (!edu.degree || edu.degree.length < 2) newErrors[`degree-${edu.id}`] = "Le diplôme est requis"
      if (!edu.institution || edu.institution.length < 2) newErrors[`institution-${edu.id}`] = "L'établissement est requis"
      if (!edu.city || edu.city.length < 2) newErrors[`city-${edu.id}`] = "La ville est requise"
      if (!edu.startDate) newErrors[`startDate-${edu.id}`] = "La date de début est requise"
      if (!edu.isCurrently && !edu.endDate) newErrors[`endDate-${edu.id}`] = "La date de fin est requise si vous n'êtes pas actuellement en formation"
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(educations)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(educations)
  }, [educations, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Formation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {educations.map((education, index) => (
            <div key={education.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Formation {index + 1}</h3>
                {educations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(education.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`degree-${education.id}`}>Diplôme *</Label>
                  <Input
                    id={`degree-${education.id}`}
                    value={education.degree}
                    onChange={e => handleFieldChange(education.id, "degree", e.target.value)}
                    placeholder="Master en Informatique"
                  />
                  {errors[`degree-${education.id}`] && (
                    <p className="text-sm text-destructive">{errors[`degree-${education.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`institution-${education.id}`}>Établissement *</Label>
                  <Input
                    id={`institution-${education.id}`}
                    value={education.institution}
                    onChange={e => handleFieldChange(education.id, "institution", e.target.value)}
                    placeholder="Université de Paris"
                  />
                  {errors[`institution-${education.id}`] && (
                    <p className="text-sm text-destructive">{errors[`institution-${education.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city-${education.id}`}>Ville *</Label>
                  <Input
                    id={`city-${education.id}`}
                    value={education.city}
                    onChange={e => handleFieldChange(education.id, "city", e.target.value)}
                    placeholder="Paris"
                  />
                  {errors[`city-${education.id}`] && (
                    <p className="text-sm text-destructive">{errors[`city-${education.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${education.id}`}>Date de début *</Label>
                  <Input
                    id={`startDate-${education.id}`}
                    type="date"
                    value={education.startDate}
                    onChange={e => handleFieldChange(education.id, "startDate", e.target.value)}
                  />
                  {errors[`startDate-${education.id}`] && (
                    <p className="text-sm text-destructive">{errors[`startDate-${education.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${education.id}`}>Date de fin</Label>
                  <Input
                    id={`endDate-${education.id}`}
                    type="date"
                    value={education.endDate}
                    onChange={e => handleFieldChange(education.id, "endDate", e.target.value)}
                    disabled={education.isCurrently}
                  />
                  {errors[`endDate-${education.id}`] && (
                    <p className="text-sm text-destructive">{errors[`endDate-${education.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currently-${education.id}`}
                  checked={education.isCurrently}
                  onCheckedChange={checked => handleCurrentlyChange(education.id, checked as boolean)}
                />
                <Label htmlFor={`currently-${education.id}`}>Je suis actuellement en formation</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${education.id}`}>Description (optionnel)</Label>
                <Textarea
                  id={`description-${education.id}`}
                  value={education.description}
                  onChange={e => handleFieldChange(education.id, "description", e.target.value)}
                  placeholder="Décrivez les matières principales, projets réalisés, mentions obtenues..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter une formation
          </Button>

          <div className="flex gap-4">
            {onSkip && (
              <Button type="button" variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
                Passer cette étape
              </Button>
            )}
            <Button type="submit" className={onSkip ? "flex-1" : "w-full"}>
              Continuer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}