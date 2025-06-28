"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Trophy } from "lucide-react"
import type { Achievement } from "../types/cv"

const achievementSchema = z.object({
  title: z.string().min(2, "Le titre de la réalisation est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  date: z.string().min(1, "La date est requise"),
  organization: z.string().optional(),
})

interface AchievementsFormProps {
  initialData?: Achievement[]
  onSubmit: (data: Achievement[]) => void
  onSkip: () => void
}

export default function AchievementsForm({ initialData = [], onSubmit, onSkip }: AchievementsFormProps) {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        achievements: z.array(achievementSchema).optional(),
      }),
    ),
    defaultValues: { achievements },
  })

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      date: "",
      organization: "",
    }
    setAchievements([...achievements, newAchievement])
  }

  const removeAchievement = (id: string) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((ach) => ach.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Réalisations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.achievements || []))} className="space-y-6">
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
                  <Label htmlFor={`title-${index}`}>Titre de la réalisation *</Label>
                  <Input
                    id={`title-${index}`}
                    {...register(`achievements.${index}.title`)}
                    placeholder="Prix du meilleur projet innovant"
                  />
                  {errors.achievements?.[index]?.title && (
                    <p className="text-sm text-destructive">{errors.achievements[index]?.title?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`organization-${index}`}>Organisation (optionnel)</Label>
                  <Input
                    id={`organization-${index}`}
                    {...register(`achievements.${index}.organization`)}
                    placeholder="Université de Paris"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-${index}`}>Date *</Label>
                <Input id={`date-${index}`} type="date" {...register(`achievements.${index}.date`)} />
                {errors.achievements?.[index]?.date && (
                  <p className="text-sm text-destructive">{errors.achievements[index]?.date?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Textarea
                  id={`description-${index}`}
                  {...register(`achievements.${index}.description`)}
                  placeholder="Décrivez votre réalisation, son impact et sa valeur..."
                  className="min-h-[100px]"
                />
                {errors.achievements?.[index]?.description && (
                  <p className="text-sm text-destructive">{errors.achievements[index]?.description?.message}</p>
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
            <Button type="button" variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
              Passer cette étape
            </Button>
            <Button type="submit" className="flex-1">
              Continuer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
