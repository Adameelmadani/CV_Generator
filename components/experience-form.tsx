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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Briefcase } from "lucide-react"
import type { Experience } from "../types/cv"

const experienceSchema = z
  .object({
    position: z.string().min(2, "Le poste est requis"),
    employer: z.string().min(2, "L'employeur est requis"),
    city: z.string().min(2, "La ville est requise"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().optional(),
    isCurrently: z.boolean(),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  })
  .refine(
    (data) => {
      if (!data.isCurrently && !data.endDate) {
        return false
      }
      return true
    },
    {
      message: "La date de fin est requise si vous n'occupez pas actuellement ce poste",
      path: ["endDate"],
    },
  )

interface ExperienceFormProps {
  initialData?: Experience[]
  onSubmit: (data: Experience[]) => void
  onSkip: () => void
}

export default function ExperienceForm({ initialData = [], onSubmit, onSkip }: ExperienceFormProps) {
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
        experiences: z.array(experienceSchema).optional(),
      }),
    ),
  })

  const addExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      position: "",
      employer: "",
      city: "",
      startDate: "",
      endDate: "",
      isCurrently: false,
      description: "",
    }
    setExperiences([...experiences, newExperience])
  }

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id))
    }
  }

  const handleCurrentlyChange = (index: number, checked: boolean) => {
    const updated = [...experiences]
    updated[index].isCurrently = checked
    if (checked) {
      updated[index].endDate = ""
    }
    setExperiences(updated)
    setValue(`experiences.${index}.isCurrently`, checked)
    if (checked) {
      setValue(`experiences.${index}.endDate`, "")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Expériences professionnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.experiences))} className="space-y-6">
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
                  <Label htmlFor={`position-${index}`}>Poste *</Label>
                  <Input
                    id={`position-${index}`}
                    {...register(`experiences.${index}.position`)}
                    placeholder="Développeur Full Stack"
                  />
                  {errors.experiences?.[index]?.position && (
                    <p className="text-sm text-destructive">{errors.experiences[index]?.position?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`employer-${index}`}>Employeur *</Label>
                  <Input
                    id={`employer-${index}`}
                    {...register(`experiences.${index}.employer`)}
                    placeholder="Tech Company"
                  />
                  {errors.experiences?.[index]?.employer && (
                    <p className="text-sm text-destructive">{errors.experiences[index]?.employer?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city-${index}`}>Ville *</Label>
                  <Input id={`city-${index}`} {...register(`experiences.${index}.city`)} placeholder="Paris" />
                  {errors.experiences?.[index]?.city && (
                    <p className="text-sm text-destructive">{errors.experiences[index]?.city?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>Date de début *</Label>
                  <Input id={`startDate-${index}`} type="date" {...register(`experiences.${index}.startDate`)} />
                  {errors.experiences?.[index]?.startDate && (
                    <p className="text-sm text-destructive">{errors.experiences[index]?.startDate?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>Date de fin</Label>
                  <Input
                    id={`endDate-${index}`}
                    type="date"
                    {...register(`experiences.${index}.endDate`)}
                    disabled={watch(`experiences.${index}.isCurrently`)}
                  />
                  {errors.experiences?.[index]?.endDate && (
                    <p className="text-sm text-destructive">{errors.experiences[index]?.endDate?.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currently-${index}`}
                  checked={watch(`experiences.${index}.isCurrently`)}
                  onCheckedChange={(checked) => handleCurrentlyChange(index, checked as boolean)}
                />
                <Label htmlFor={`currently-${index}`}>J'occupe actuellement ce poste</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Textarea
                  id={`description-${index}`}
                  {...register(`experiences.${index}.description`)}
                  placeholder="Décrivez vos missions, responsabilités, réalisations et technologies utilisées..."
                  className="min-h-[100px]"
                />
                {errors.experiences?.[index]?.description && (
                  <p className="text-sm text-destructive">{errors.experiences[index]?.description?.message}</p>
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
