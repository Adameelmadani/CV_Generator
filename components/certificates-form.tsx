"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Award } from "lucide-react"
import type { Certificate } from "../types/cv"

const certificateSchema = z.object({
  name: z.string().min(2, "Le nom du certificat est requis"),
  issueDate: z.string().min(1, "La date d'obtention est requise"),
  issuer: z.string().min(2, "L'organisme délivreur est requis"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
})

interface CertificatesFormProps {
  initialData?: Certificate[]
  onSubmit: (data: Certificate[]) => void
  onSkip: () => void
}

export default function CertificatesForm({ initialData = [], onSubmit, onSkip }: CertificatesFormProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            name: "",
            issueDate: "",
            issuer: "",
            url: "",
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
        certificates: z.array(certificateSchema).optional(),
      }),
    ),
    defaultValues: { certificates },
  })

  const addCertificate = () => {
    const newCertificate: Certificate = {
      id: crypto.randomUUID(),
      name: "",
      issueDate: "",
      issuer: "",
      url: "",
    }
    setCertificates([...certificates, newCertificate])
  }

  const removeCertificate = (id: string) => {
    if (certificates.length > 1) {
      setCertificates(certificates.filter((cert) => cert.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.certificates || []))} className="space-y-6">
          {certificates.map((certificate, index) => (
            <div key={certificate.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Certificat {index + 1}</h3>
                {certificates.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertificate(certificate.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Nom du certificat *</Label>
                  <Input
                    id={`name-${index}`}
                    {...register(`certificates.${index}.name`)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                  {errors.certificates?.[index]?.name && (
                    <p className="text-sm text-destructive">{errors.certificates[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`issuer-${index}`}>Organisme délivreur *</Label>
                  <Input
                    id={`issuer-${index}`}
                    {...register(`certificates.${index}.issuer`)}
                    placeholder="Amazon Web Services"
                  />
                  {errors.certificates?.[index]?.issuer && (
                    <p className="text-sm text-destructive">{errors.certificates[index]?.issuer?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`issueDate-${index}`}>Date d'obtention *</Label>
                  <Input id={`issueDate-${index}`} type="date" {...register(`certificates.${index}.issueDate`)} />
                  {errors.certificates?.[index]?.issueDate && (
                    <p className="text-sm text-destructive">{errors.certificates[index]?.issueDate?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${index}`}>URL de vérification (optionnel)</Label>
                  <Input
                    id={`url-${index}`}
                    {...register(`certificates.${index}.url`)}
                    placeholder="https://verify.certificate.com"
                  />
                  {errors.certificates?.[index]?.url && (
                    <p className="text-sm text-destructive">{errors.certificates[index]?.url?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addCertificate}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter un certificat
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
