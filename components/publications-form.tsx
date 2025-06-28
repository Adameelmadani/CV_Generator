"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BookOpen, X } from "lucide-react"
import type { Publication } from "../types/cv"

const publicationSchema = z.object({
  title: z.string().min(2, "Le titre de la publication est requis"),
  authors: z.array(z.string()).min(1, "Au moins un auteur est requis"),
  journal: z.string().min(2, "Le journal/conférence est requis"),
  date: z.string().min(1, "La date de publication est requise"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  description: z.string().optional(),
})

interface PublicationsFormProps {
  initialData?: Publication[]
  onSubmit: (data: Publication[]) => void
  onSkip: () => void
}

export default function PublicationsForm({ initialData = [], onSubmit, onSkip }: PublicationsFormProps) {
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

  const [authorInputs, setAuthorInputs] = useState<{ [key: string]: string }>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(
      z.object({
        publications: z.array(publicationSchema).optional(),
      }),
    ),
    defaultValues: { publications },
  })

  const addPublication = () => {
    const newPublication: Publication = {
      id: crypto.randomUUID(),
      title: "",
      authors: [],
      journal: "",
      date: "",
      url: "",
      description: "",
    }
    setPublications([...publications, newPublication])
  }

  const removePublication = (id: string) => {
    if (publications.length > 1) {
      setPublications(publications.filter((pub) => pub.id !== id))
    }
  }

  const addAuthor = (publicationIndex: number) => {
    const author = authorInputs[`publication-${publicationIndex}`]?.trim()
    if (author) {
      const updatedPublications = [...publications]
      if (!updatedPublications[publicationIndex].authors.includes(author)) {
        updatedPublications[publicationIndex].authors.push(author)
        setPublications(updatedPublications)
        setValue(`publications.${publicationIndex}.authors`, updatedPublications[publicationIndex].authors)
      }
      setAuthorInputs({ ...authorInputs, [`publication-${publicationIndex}`]: "" })
    }
  }

  const removeAuthor = (publicationIndex: number, author: string) => {
    const updatedPublications = [...publications]
    updatedPublications[publicationIndex].authors = updatedPublications[publicationIndex].authors.filter(
      (a) => a !== author,
    )
    setPublications(updatedPublications)
    setValue(`publications.${publicationIndex}.authors`, updatedPublications[publicationIndex].authors)
  }

  const handleAuthorKeyPress = (e: React.KeyboardEvent, publicationIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addAuthor(publicationIndex)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.publications || []))} className="space-y-6">
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
                <Label htmlFor={`title-${index}`}>Titre de la publication *</Label>
                <Input
                  id={`title-${index}`}
                  {...register(`publications.${index}.title`)}
                  placeholder="Machine Learning Applications in Healthcare"
                />
                {errors.publications?.[index]?.title && (
                  <p className="text-sm text-destructive">{errors.publications[index]?.title?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Auteurs *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un auteur"
                    value={authorInputs[`publication-${index}`] || ""}
                    onChange={(e) => setAuthorInputs({ ...authorInputs, [`publication-${index}`]: e.target.value })}
                    onKeyPress={(e) => handleAuthorKeyPress(e, index)}
                  />
                  <Button type="button" variant="outline" onClick={() => addAuthor(index)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {publications[index].authors.map((author, authorIndex) => (
                    <Badge key={authorIndex} variant="secondary" className="flex items-center gap-1">
                      {author}
                      <button
                        type="button"
                        onClick={() => removeAuthor(index, author)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.publications?.[index]?.authors && (
                  <p className="text-sm text-destructive">{errors.publications[index]?.authors?.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`journal-${index}`}>Journal/Conférence *</Label>
                  <Input
                    id={`journal-${index}`}
                    {...register(`publications.${index}.journal`)}
                    placeholder="IEEE Transactions on AI"
                  />
                  {errors.publications?.[index]?.journal && (
                    <p className="text-sm text-destructive">{errors.publications[index]?.journal?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`date-${index}`}>Date de publication *</Label>
                  <Input id={`date-${index}`} type="date" {...register(`publications.${index}.date`)} />
                  {errors.publications?.[index]?.date && (
                    <p className="text-sm text-destructive">{errors.publications[index]?.date?.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`url-${index}`}>URL (optionnel)</Label>
                <Input
                  id={`url-${index}`}
                  {...register(`publications.${index}.url`)}
                  placeholder="https://doi.org/10.1000/publication"
                />
                {errors.publications?.[index]?.url && (
                  <p className="text-sm text-destructive">{errors.publications[index]?.url?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description (optionnel)</Label>
                <Textarea
                  id={`description-${index}`}
                  {...register(`publications.${index}.description`)}
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
