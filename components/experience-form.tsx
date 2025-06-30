"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Briefcase } from "lucide-react"
import type { Experience } from "../types/cv"

interface ExperienceFormProps {
  initialData?: Experience[]
  onSubmit: (data: Experience[]) => void
  onChange?: (data: Experience[]) => void
  onSkip?: () => void
}

export default function ExperienceForm({ initialData = [], onSubmit, onChange, onSkip }: ExperienceFormProps) {
  const [experiences, setExperiences] = useState<Experience[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            position: "",
            employer: "",
            city: "",
            startDate: "",
            endDate: "",
            isCurrently: false,
            description: "",
          },
        ],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: crypto.randomUUID(),
        position: "",
        employer: "",
        city: "",
        startDate: "",
        endDate: "",
        isCurrently: false,
        description: "",
      },
    ])
  }

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      const newExperiences = experiences.filter((exp: Experience) => exp.id !== id)
      setExperiences(newExperiences)
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

  const handleFieldChange = (id: string, field: keyof Experience, value: string | boolean) => {
    const updated = experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    setExperiences(updated)
    
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
    const updated = experiences.map(exp => 
      exp.id === id 
        ? { ...exp, isCurrently: checked, endDate: checked ? "" : exp.endDate }
        : exp
    )
    setExperiences(updated)
    
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
    experiences.forEach((exp: Experience) => {
      if (!exp.position || exp.position.length < 2) newErrors[`position-${exp.id}`] = "Le poste est requis"
      if (!exp.employer || exp.employer.length < 2) newErrors[`employer-${exp.id}`] = "L'employeur est requis"
      if (!exp.city || exp.city.length < 2) newErrors[`city-${exp.id}`] = "La ville est requise"
      if (!exp.startDate) newErrors[`startDate-${exp.id}`] = "La date de début est requise"
      if (!exp.isCurrently && !exp.endDate) newErrors[`endDate-${exp.id}`] = "La date de fin est requise si vous n'occupez pas actuellement ce poste"
      if (!exp.description || exp.description.length < 10) newErrors[`description-${exp.id}`] = "La description doit contenir au moins 10 caractères"
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(experiences)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(experiences)
  }, [experiences, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Expérience professionnelle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {experiences.map((experience, index) => (
            <div key={experience.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Expérience {index + 1}</h3>
                {experiences.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(experience.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`position-${experience.id}`}>Poste *</Label>
                  <Input
                    id={`position-${experience.id}`}
                    value={experience.position}
                    onChange={e => handleFieldChange(experience.id, "position", e.target.value)}
                    placeholder="Développeur Full Stack"
                  />
                  {errors[`position-${experience.id}`] && (
                    <p className="text-sm text-destructive">{errors[`position-${experience.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`employer-${experience.id}`}>Employeur *</Label>
                  <Input
                    id={`employer-${experience.id}`}
                    value={experience.employer}
                    onChange={e => handleFieldChange(experience.id, "employer", e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                  {errors[`employer-${experience.id}`] && (
                    <p className="text-sm text-destructive">{errors[`employer-${experience.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city-${experience.id}`}>Ville *</Label>
                  <Input
                    id={`city-${experience.id}`}
                    value={experience.city}
                    onChange={e => handleFieldChange(experience.id, "city", e.target.value)}
                    placeholder="Paris"
                  />
                  {errors[`city-${experience.id}`] && (
                    <p className="text-sm text-destructive">{errors[`city-${experience.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${experience.id}`}>Date de début *</Label>
                  <Input
                    id={`startDate-${experience.id}`}
                    type="date"
                    value={experience.startDate}
                    onChange={e => handleFieldChange(experience.id, "startDate", e.target.value)}
                  />
                  {errors[`startDate-${experience.id}`] && (
                    <p className="text-sm text-destructive">{errors[`startDate-${experience.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${experience.id}`}>Date de fin</Label>
                  <Input
                    id={`endDate-${experience.id}`}
                    type="date"
                    value={experience.endDate}
                    onChange={e => handleFieldChange(experience.id, "endDate", e.target.value)}
                    disabled={experience.isCurrently}
                  />
                  {errors[`endDate-${experience.id}`] && (
                    <p className="text-sm text-destructive">{errors[`endDate-${experience.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currently-${experience.id}`}
                  checked={experience.isCurrently}
                  onCheckedChange={checked => handleCurrentlyChange(experience.id, checked as boolean)}
                />
                <Label htmlFor={`currently-${experience.id}`}>J'occupe actuellement ce poste</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${experience.id}`}>Description *</Label>
                <Textarea
                  id={`description-${experience.id}`}
                  value={experience.description}
                  onChange={e => handleFieldChange(experience.id, "description", e.target.value)}
                  placeholder="Décrivez vos responsabilités, réalisations et compétences développées..."
                  className="min-h-[100px]"
                />
                {errors[`description-${experience.id}`] && (
                  <p className="text-sm text-destructive">{errors[`description-${experience.id}`]}</p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExperience}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter une expérience
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