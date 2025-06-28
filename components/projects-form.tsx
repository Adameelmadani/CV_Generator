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
import { Plus, Trash2, FolderOpen, X } from "lucide-react"
import type { Project } from "../types/cv"

const projectSchema = z.object({
  name: z.string().min(2, "Le nom du projet est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  technologies: z.array(z.string()).min(1, "Au moins une technologie est requise"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
})

interface ProjectsFormProps {
  initialData?: Project[]
  onSubmit: (data: Project[]) => void
  onSkip: () => void
}

export default function ProjectsForm({ initialData = [], onSubmit, onSkip }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: crypto.randomUUID(),
            name: "",
            description: "",
            technologies: [],
            url: "",
          },
        ],
  )

  const [techInputs, setTechInputs] = useState<{ [key: string]: string }>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(
      z.object({
        projects: z.array(projectSchema).optional(),
      }),
    ),
    defaultValues: { projects },
  })

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
      url: "",
    }
    setProjects([...projects, newProject])
  }

  const removeProject = (id: string) => {
    if (projects.length > 1) {
      setProjects(projects.filter((proj) => proj.id !== id))
    }
  }

  const addTechnology = (projectIndex: number) => {
    const tech = techInputs[`project-${projectIndex}`]?.trim()
    if (tech) {
      const updatedProjects = [...projects]
      if (!updatedProjects[projectIndex].technologies.includes(tech)) {
        updatedProjects[projectIndex].technologies.push(tech)
        setProjects(updatedProjects)
        setValue(`projects.${projectIndex}.technologies`, updatedProjects[projectIndex].technologies)
      }
      setTechInputs({ ...techInputs, [`project-${projectIndex}`]: "" })
    }
  }

  const removeTechnology = (projectIndex: number, tech: string) => {
    const updatedProjects = [...projects]
    updatedProjects[projectIndex].technologies = updatedProjects[projectIndex].technologies.filter((t) => t !== tech)
    setProjects(updatedProjects)
    setValue(`projects.${projectIndex}.technologies`, updatedProjects[projectIndex].technologies)
  }

  const handleTechKeyPress = (e: React.KeyboardEvent, projectIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology(projectIndex)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Projets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.projects))} className="space-y-6">
          {projects.map((project, index) => (
            <div key={project.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Projet {index + 1}</h3>
                {projects.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Nom du projet *</Label>
                  <Input
                    id={`name-${index}`}
                    {...register(`projects.${index}.name`)}
                    placeholder="Application E-commerce"
                  />
                  {errors.projects?.[index]?.name && (
                    <p className="text-sm text-destructive">{errors.projects[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${index}`}>URL (optionnel)</Label>
                  <Input
                    id={`url-${index}`}
                    {...register(`projects.${index}.url`)}
                    placeholder="https://github.com/username/project"
                  />
                  {errors.projects?.[index]?.url && (
                    <p className="text-sm text-destructive">{errors.projects[index]?.url?.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Textarea
                  id={`description-${index}`}
                  {...register(`projects.${index}.description`)}
                  placeholder="Décrivez le projet, ses fonctionnalités principales, votre rôle et les défis relevés..."
                  className="min-h-[100px]"
                />
                {errors.projects?.[index]?.description && (
                  <p className="text-sm text-destructive">{errors.projects[index]?.description?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Technologies utilisées *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter une technologie"
                    value={techInputs[`project-${index}`] || ""}
                    onChange={(e) => setTechInputs({ ...techInputs, [`project-${index}`]: e.target.value })}
                    onKeyPress={(e) => handleTechKeyPress(e, index)}
                  />
                  <Button type="button" variant="outline" onClick={() => addTechnology(index)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {projects[index].technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index, tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.projects?.[index]?.technologies && (
                  <p className="text-sm text-destructive">{errors.projects[index]?.technologies?.message}</p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addProject}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Ajouter un projet
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
