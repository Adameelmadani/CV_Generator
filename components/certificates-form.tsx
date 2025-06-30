"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Award } from "lucide-react"
import type { Certificate } from "../types/cv"

interface CertificatesFormProps {
  initialData?: Certificate[]
  onSubmit: (data: Certificate[]) => void
  onChange?: (data: Certificate[]) => void
  onSkip?: () => void
}

export default function CertificatesForm({ initialData = [], onSubmit, onChange, onSkip }: CertificatesFormProps) {
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

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      {
        id: crypto.randomUUID(),
        name: "",
        issueDate: "",
        issuer: "",
        url: "",
      },
    ])
  }

  const removeCertificate = (id: string) => {
    if (certificates.length > 1) {
      const newCertificates = certificates.filter((cert: Certificate) => cert.id !== id)
      setCertificates(newCertificates)
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

  const handleFieldChange = (id: string, field: keyof Certificate, value: string) => {
    const updated = certificates.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    )
    setCertificates(updated)
    
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
    certificates.forEach((cert: Certificate) => {
      if (!cert.name || cert.name.length < 2) newErrors[`name-${cert.id}`] = "Le nom du certificat est requis"
      if (!cert.issueDate) newErrors[`issueDate-${cert.id}`] = "La date d'obtention est requise"
      if (!cert.issuer || cert.issuer.length < 2) newErrors[`issuer-${cert.id}`] = "L'organisme délivreur est requis"
      if (cert.url && cert.url.length > 0) {
        try {
          new URL(cert.url)
        } catch {
          newErrors[`url-${cert.id}`] = "URL invalide"
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(certificates)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(certificates)
  }, [certificates, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  <Label htmlFor={`name-${certificate.id}`}>Nom du certificat *</Label>
                  <Input
                    id={`name-${certificate.id}`}
                    value={certificate.name}
                    onChange={e => handleFieldChange(certificate.id, "name", e.target.value)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                  {errors[`name-${certificate.id}`] && (
                    <p className="text-sm text-destructive">{errors[`name-${certificate.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`issuer-${certificate.id}`}>Organisme délivreur *</Label>
                  <Input
                    id={`issuer-${certificate.id}`}
                    value={certificate.issuer}
                    onChange={e => handleFieldChange(certificate.id, "issuer", e.target.value)}
                    placeholder="Amazon Web Services"
                  />
                  {errors[`issuer-${certificate.id}`] && (
                    <p className="text-sm text-destructive">{errors[`issuer-${certificate.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`issueDate-${certificate.id}`}>Date d'obtention *</Label>
                  <Input 
                    id={`issueDate-${certificate.id}`} 
                    type="date" 
                    value={certificate.issueDate}
                    onChange={e => handleFieldChange(certificate.id, "issueDate", e.target.value)}
                  />
                  {errors[`issueDate-${certificate.id}`] && (
                    <p className="text-sm text-destructive">{errors[`issueDate-${certificate.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${certificate.id}`}>URL de vérification (optionnel)</Label>
                  <Input
                    id={`url-${certificate.id}`}
                    value={certificate.url}
                    onChange={e => handleFieldChange(certificate.id, "url", e.target.value)}
                    placeholder="https://verify.certificate.com"
                  />
                  {errors[`url-${certificate.id}`] && (
                    <p className="text-sm text-destructive">{errors[`url-${certificate.id}`]}</p>
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