"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import type { Education } from "../types/cv"

const educationSchema = z
  .object({
    degree: z.string().min(2, "Le diplôme est requis"),
    institution: z.string().min(2, "L'établissement est requis"),
    city: z.string().min(2, "La ville est requise"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().optional(),
    isCurrently: z.boolean(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrently && !data.endDate) {
        return false
      }
      return true
    },
    {
      message: "La date de fin est requise si vous n'êtes pas actuellement en formation",
      path: ["endDate"],
    },
  )

interface EducationFormProps {
  initialData?: Education[]
  onSubmit: (data: Education[]) => void
  onSkip?: () => void
}

export default function EducationForm({ initialData = [], onSubmit, onSkip }: EducationFormProps) {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(
      z.object({
        educations: z.array(educationSchema).optional(),
      }),
    ),
  })

  // Synchroniser les données du formulaire avec le state
  useEffect(() => {
    reset({ educations })
  }, [educations, reset])

  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      degree: "",
      institution: "",
      city: "",
      startDate: "",
      endDate: "",
      isCurrently: false,
      description: "",
    }
    setEducations([...educations, newEducation])
  }

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      const filtered = educations.filter((edu) => edu.id !== id)
      setEducations(filtered)
    }
  }

  const handleCurrentlyChange = (index: number, checked: boolean) => {
    const updated = [...educations]
    updated[index].isCurrently = checked
    if (checked) {
      updated[index].endDate = ""
    }
    setEducations(updated)
  }

  const handleFormSubmit = (data: { educations: Education[] }) => {
    // Ajouter les IDs aux données avant de les soumettre
    const educationsWithIds =
      data.educations?.map((edu, index) => ({
        ...edu,
        id: educations[index]?.id || crypto.randomUUID(),
      })) || []
    onSubmit(educationsWithIds)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Formation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  <Label htmlFor={`degree-${index}`}>Diplôme *</Label>
                  <Input
                    id={`degree-${index}`}
                    {...register(`educations.${index}.degree`)}
                    placeholder="Master en Informatique"
                  />
                  {errors.educations?.[index]?.degree && (
                    <p className="text-sm text-destructive">{errors.educations[index]?.degree?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`institution-${index}`}>Établissement *</Label>
                  <Input
                    id={`institution-${index}`}
                    {...register(`educations.${index}.institution`)}
                    placeholder="Université de Paris"
                  />
                  {errors.educations?.[index]?.institution && (
                    <p className="text-sm text-destructive">{errors.educations[index]?.institution?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city-${index}`}>Ville *</Label>
                  <Input id={`city-${index}`} {...register(`educations.${index}.city`)} placeholder="Paris" />
                  {errors.educations?.[index]?.city && (
                    <p className="text-sm text-destructive">{errors.educations[index]?.city?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>Date de début *</Label>
                  <Input id={`startDate-${index}`} type="date" {...register(`educations.${index}.startDate`)} />
                  {errors.educations?.[index]?.startDate && (
                    <p className="text-sm text-destructive">{errors.educations[index]?.startDate?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>Date de fin</Label>
                  <Input
                    id={`endDate-${index}`}
                    type="date"
                    {...register(`educations.${index}.endDate`)}
                    disabled={watch(`educations.${index}.isCurrently`)}
                  />
                  {errors.educations?.[index]?.endDate && (
                    <p className="text-sm text-destructive">{errors.educations[index]?.endDate?.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currently-${index}`}
                  checked={watch(`educations.${index}.isCurrently`)}
                  onCheckedChange={(checked) => handleCurrentlyChange(index, checked as boolean)}
                />
                <Label htmlFor={`currently-${index}`}>Je suis actuellement en formation</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description (optionnel)</Label>
                <Textarea
                  id={`description-${index}`}
                  {...register(`educations.${index}.description`)}
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
