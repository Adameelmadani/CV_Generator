"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, User } from "lucide-react"
import type { PersonalInfo } from "../types/cv"

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  title: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  linkedinUrl: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
  githubUrl: z.string().url("URL GitHub invalide").optional().or(z.literal("")),
  professionalSummary: z.string().optional(),
})

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfo>
  onSubmit: (data: PersonalInfo) => void
  onSkip?: () => void
}

export default function PersonalInfoForm({ initialData, onSubmit, onSkip }: PersonalInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialData,
  })

  const professionalSummary = watch("professionalSummary", "")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Télécharger une photo
              </Button>
            </div>
          </div>

          {/* Nom et Titre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Jean Dupont" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titre professionnel</Label>
              <Input id="title" {...register("title")} placeholder="Développeur Full Stack" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
          </div>

          {/* Date de naissance et Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
              {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="jean.dupont@email.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Téléphone et Adresse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input id="phone" {...register("phone")} placeholder="+33 6 12 34 56 78" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" {...register("address")} placeholder="123 Rue de la Paix, 75001 Paris" />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          {/* LinkedIn et GitHub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn (optionnel)</Label>
              <Input id="linkedinUrl" {...register("linkedinUrl")} placeholder="https://linkedin.com/in/votre-profil" />
              {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub (optionnel)</Label>
              <Input id="githubUrl" {...register("githubUrl")} placeholder="https://github.com/votre-username" />
              {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl.message}</p>}
            </div>
          </div>

          {/* Résumé professionnel */}
          <div className="space-y-2">
            <Label htmlFor="professionalSummary">Résumé professionnel</Label>
            <Textarea
              id="professionalSummary"
              {...register("professionalSummary")}
              placeholder="Décrivez brièvement votre profil professionnel, vos compétences clés et vos objectifs..."
              className="min-h-[120px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{professionalSummary?.length || 0} caractères</span>
              <span>Minimum 50 caractères</span>
            </div>
            {errors.professionalSummary && (
              <p className="text-sm text-destructive">{errors.professionalSummary.message}</p>
            )}
          </div>

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
