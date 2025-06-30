"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Trophy } from "lucide-react"
import type { Achievement } from "../types/cv"

interface AchievementsFormProps {
  initialData?: Achievement[]
  onSubmit: (data: Achievement[]) => void
  onChange?: (data: Achievement[]) => void
  onSkip?: () => void
}

export default function AchievementsForm({ initialData = [], onSubmit, onChange, onSkip }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            title: "",
            description: "",
            date: "",
            organization: "",
          },
        ],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        date: "",
        organization: "",
      },
    ])
  }

  const removeAchievement = (id: string) => {
    if (achievements.length > 1) {
      const newAchievements = achievements.filter((ach: Achievement) => ach.id !== id)
      setAchievements(newAchievements)
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

  const handleFieldChange = (id: string, field: keyof Achievement, value: string) => {
    const updated = achievements.map(ach => 
      ach.id === id ? { ...ach, [field]: value } : ach
    )
    setAchievements(updated)
    
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    achievements.forEach((ach: Achievement) => {
      if (!ach.title || ach.title.length < 2) newErrors[`title-${ach.id}`] = "Le titre de la réalisation est requis"
      if (!ach.description || ach.description.length < 10) newErrors[`description-${ach.id}`] = "La description doit contenir au moins 10 caractères"
      if (!ach.date) newErrors[`date-${ach.id}`] = "La date est requise"
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(achievements)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(achievements)
  }, [achievements, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Réalisations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {achievements.map((achievement, index) => (
            <div key={achievement.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Réalisation {index + 1}</h3>
                {achievements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(achievement.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${achievement.id}`}>Titre de la réalisation *</Label>
                  <Input
                    id={`title-${achievement.id}`}
                    value={achievement.title}
                    onChange={e => handleFieldChange(achievement.id, "title", e.target.value)}
                    placeholder="Prix du meilleur projet innovant"
                  />
                  {errors[`title-${achievement.id}`] && (
                    <p className="text-sm text-destructive">{errors[`title-${achievement.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`organization-${achievement.id}`}>Organisation (optionnel)</Label>
                  <Input
                    id={`organization-${achievement.id}`}
                    value={achievement.organization || ""}
                    onChange={e => handleFieldChange(achievement.id, "organization", e.target.value)}
                    placeholder="Université de Paris"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-${achievement.id}`}>Date *</Label>
                <Input 
                  id={`date-${achievement.id}`} 
                  type="date" 
                  value={achievement.date}
                  onChange={e => handleFieldChange(achievement.id, "date", e.target.value)}
                />
                {errors[`date-${achievement.id}`] && (
                  <p className="text-sm text-destructive">{errors[`date-${achievement.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${achievement.id}`}>Description *</Label>
                <Textarea
                  id={`description-${achievement.id}`}
                  value={achievement.description}
                  onChange={e => handleFieldChange(achievement.id, "description", e.target.value)}
                  placeholder="Décrivez votre réalisation, son impact et sa valeur..."
                  className="min-h-[100px]"
                />
                {errors[`description-${achievement.id}`] && (
                  <p className="text-sm text-destructive">{errors[`description-${achievement.id}`]}</p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAchievement}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter une réalisation
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