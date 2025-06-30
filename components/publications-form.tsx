"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BookOpen, X } from "lucide-react"
import type { Publication } from "../types/cv"

interface PublicationsFormProps {
  initialData?: Publication[]
  onSubmit: (data: Publication[]) => void
  onChange?: (data: Publication[]) => void
  onSkip?: () => void
}

export default function PublicationsForm({ initialData = [], onSubmit, onChange, onSkip }: PublicationsFormProps) {
  const [publications, setPublications] = useState<Publication[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            title: "",
            authors: [],
            journal: "",
            date: "",
            url: "",
            description: "",
          },
        ],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [authorInputs, setAuthorInputs] = useState<{ [key: string]: string }>({})

  const addPublication = () => {
    setPublications([
      ...publications,
      {
        id: crypto.randomUUID(),
        title: "",
        authors: [],
        journal: "",
        date: "",
        url: "",
        description: "",
      },
    ])
  }

  const removePublication = (id: string) => {
    if (publications.length > 1) {
      const newPublications = publications.filter((pub: Publication) => pub.id !== id)
      setPublications(newPublications)
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
      // Nettoyer l'input d'auteur
      setAuthorInputs(prev => {
        const newInputs = { ...prev }
        delete newInputs[id]
        return newInputs
      })
    }
  }

  const handleFieldChange = (id: string, field: keyof Publication, value: string | string[]) => {
    const updated = publications.map(pub => 
      pub.id === id ? { ...pub, [field]: value } : pub
    )
    setPublications(updated)
    
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

  const addAuthor = (publicationId: string) => {
    const author = authorInputs[publicationId]?.trim()
    if (author) {
      const publication = publications.find(p => p.id === publicationId)
      if (publication && !publication.authors.includes(author)) {
        handleFieldChange(publicationId, "authors", [...publication.authors, author])
        setAuthorInputs(prev => ({ ...prev, [publicationId]: "" }))
      }
    }
  }

  const removeAuthor = (publicationId: string, authorToRemove: string) => {
    const publication = publications.find(p => p.id === publicationId)
    if (publication) {
      const updatedAuthors = publication.authors.filter(author => author !== authorToRemove)
      handleFieldChange(publicationId, "authors", updatedAuthors)
    }
  }

  const handleAuthorKeyPress = (e: React.KeyboardEvent, publicationId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addAuthor(publicationId)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    publications.forEach((pub: Publication) => {
      if (!pub.title || pub.title.length < 2) newErrors[`title-${pub.id}`] = "Le titre de la publication est requis"
      if (pub.authors.length === 0) newErrors[`authors-${pub.id}`] = "Au moins un auteur est requis"
      if (!pub.journal || pub.journal.length < 2) newErrors[`journal-${pub.id}`] = "Le journal/conférence est requis"
      if (!pub.date) newErrors[`date-${pub.id}`] = "La date de publication est requise"
      if (pub.url && pub.url.length > 0) {
        try {
          new URL(pub.url)
        } catch {
          newErrors[`url-${pub.id}`] = "URL invalide"
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(publications)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(publications)
  }, [publications, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {publications.map((publication, index) => (
            <div key={publication.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Publication {index + 1}</h3>
                {publications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePublication(publication.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`title-${publication.id}`}>Titre de la publication *</Label>
                <Input
                  id={`title-${publication.id}`}
                  value={publication.title}
                  onChange={e => handleFieldChange(publication.id, "title", e.target.value)}
                  placeholder="Machine Learning Applications in Healthcare"
                />
                {errors[`title-${publication.id}`] && (
                  <p className="text-sm text-destructive">{errors[`title-${publication.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Auteurs *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un auteur"
                    value={authorInputs[publication.id] || ""}
                    onChange={e => setAuthorInputs(prev => ({ ...prev, [publication.id]: e.target.value }))}
                    onKeyPress={e => handleAuthorKeyPress(e, publication.id)}
                  />
                  <Button
                    type="button"
                    onClick={() => addAuthor(publication.id)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {publication.authors.map((author, authorIndex) => (
                    <Badge key={authorIndex} variant="secondary" className="flex items-center gap-1">
                      {author}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeAuthor(publication.id, author)}
                      />
                    </Badge>
                  ))}
                </div>
                {errors[`authors-${publication.id}`] && (
                  <p className="text-sm text-destructive">{errors[`authors-${publication.id}`]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`journal-${publication.id}`}>Journal/Conférence *</Label>
                  <Input
                    id={`journal-${publication.id}`}
                    value={publication.journal}
                    onChange={e => handleFieldChange(publication.id, "journal", e.target.value)}
                    placeholder="IEEE Transactions on AI"
                  />
                  {errors[`journal-${publication.id}`] && (
                    <p className="text-sm text-destructive">{errors[`journal-${publication.id}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`date-${publication.id}`}>Date de publication *</Label>
                  <Input 
                    id={`date-${publication.id}`} 
                    type="date" 
                    value={publication.date}
                    onChange={e => handleFieldChange(publication.id, "date", e.target.value)}
                  />
                  {errors[`date-${publication.id}`] && (
                    <p className="text-sm text-destructive">{errors[`date-${publication.id}`]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`url-${publication.id}`}>URL (optionnel)</Label>
                <Input
                  id={`url-${publication.id}`}
                  value={publication.url}
                  onChange={e => handleFieldChange(publication.id, "url", e.target.value)}
                  placeholder="https://doi.org/10.1000/publication"
                />
                {errors[`url-${publication.id}`] && (
                  <p className="text-sm text-destructive">{errors[`url-${publication.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${publication.id}`}>Description (optionnel)</Label>
                <Textarea
                  id={`description-${publication.id}`}
                  value={publication.description || ""}
                  onChange={e => handleFieldChange(publication.id, "description", e.target.value)}
                  placeholder="Résumé ou description de la publication..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addPublication}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter une publication
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