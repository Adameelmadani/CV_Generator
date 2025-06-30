"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FolderOpen, X } from "lucide-react"
import type { Project } from "../types/cv"

interface ProjectsFormProps {
  initialData?: Project[]
  onSubmit: (data: Project[]) => void
  onChange?: (data: Project[]) => void
  onSkip?: () => void
}

export default function ProjectsForm({ initialData = [], onSubmit, onChange, onSkip }: ProjectsFormProps) {
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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [techInputs, setTechInputs] = useState<{ [key: string]: string }>({})

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        technologies: [],
        url: "",
      },
    ])
  }

  const removeProject = (id: string) => {
    if (projects.length > 1) {
      const newProjects = projects.filter((proj: Project) => proj.id !== id)
      setProjects(newProjects)
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
      // Nettoyer l'input de technologie
      setTechInputs(prev => {
        const newInputs = { ...prev }
        delete newInputs[id]
        return newInputs
      })
    }
  }

  const handleFieldChange = (id: string, field: keyof Project, value: string | string[]) => {
    const updated = projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    )
    setProjects(updated)
    
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

  const addTechnology = (projectId: string) => {
    const techInput = techInputs[projectId]?.trim()
    if (techInput) {
      const project = projects.find(p => p.id === projectId)
      if (project && !project.technologies.includes(techInput)) {
        handleFieldChange(projectId, "technologies", [...project.technologies, techInput])
        setTechInputs(prev => ({ ...prev, [projectId]: "" }))
      }
    }
  }

  const removeTechnology = (projectId: string, techToRemove: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      const updatedTechs = project.technologies.filter(tech => tech !== techToRemove)
      handleFieldChange(projectId, "technologies", updatedTechs)
    }
  }

  const handleTechInputKeyPress = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology(projectId)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    projects.forEach((proj: Project) => {
      if (!proj.name || proj.name.length < 2) newErrors[`name-${proj.id}`] = "Le nom du projet est requis"
      if (!proj.description || proj.description.length < 10) newErrors[`description-${proj.id}`] = "La description doit contenir au moins 10 caractères"
      if (proj.technologies.length === 0) newErrors[`technologies-${proj.id}`] = "Au moins une technologie est requise"
      if (proj.url && proj.url.length > 0) {
        try {
          new URL(proj.url)
        } catch {
          newErrors[`url-${proj.id}`] = "URL invalide"
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(projects)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(projects)
  }, [projects, onChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Projets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor={`name-${project.id}`}>Nom du projet *</Label>
                <Input
                  id={`name-${project.id}`}
                  value={project.name}
                  onChange={e => handleFieldChange(project.id, "name", e.target.value)}
                  placeholder="Mon super projet"
                />
                {errors[`name-${project.id}`] && (
                  <p className="text-sm text-destructive">{errors[`name-${project.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${project.id}`}>Description *</Label>
                <Textarea
                  id={`description-${project.id}`}
                  value={project.description}
                  onChange={e => handleFieldChange(project.id, "description", e.target.value)}
                  placeholder="Décrivez votre projet, ses objectifs et ses fonctionnalités..."
                  className="min-h-[100px]"
                />
                {errors[`description-${project.id}`] && (
                  <p className="text-sm text-destructive">{errors[`description-${project.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Technologies utilisées *</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInputs[project.id] || ""}
                    onChange={e => setTechInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                    onKeyPress={e => handleTechInputKeyPress(e, project.id)}
                    placeholder="React, Node.js, etc."
                  />
                  <Button
                    type="button"
                    onClick={() => addTechnology(project.id)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTechnology(project.id, tech)}
                      />
                    </Badge>
                  ))}
                </div>
                {errors[`technologies-${project.id}`] && (
                  <p className="text-sm text-destructive">{errors[`technologies-${project.id}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`url-${project.id}`}>URL (optionnel)</Label>
                <Input
                  id={`url-${project.id}`}
                  type="url"
                  value={project.url}
                  onChange={e => handleFieldChange(project.id, "url", e.target.value)}
                  placeholder="https://github.com/username/project"
                />
                {errors[`url-${project.id}`] && (
                  <p className="text-sm text-destructive">{errors[`url-${project.id}`]}</p>
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