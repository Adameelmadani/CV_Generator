"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Project } from "../types/cv"
import { v4 as uuidv4 } from 'uuid'

interface ProjectsFormProps {
  initialData?: Project[]
  onSubmit: (data: Project[]) => void
  onSkip: () => void
}

export default function ProjectsForm({ initialData = [], onSubmit, onSkip }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Initialize with initialData or create one empty project
    return initialData?.length > 0 
      ? initialData 
      : [{ 
          id: uuidv4(), 
          name: "", 
          description: "", 
          url: "", 
          technologies: [] 
        }]
  })
  const [newTech, setNewTech] = useState<string>("")

  // Fix 1: Properly handle field changes
  const handleFieldChange = (index: number, field: keyof Project, value: string | string[]) => {
    setProjects(prev =>
      prev.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      )
    )
  }

  // Fix 2: Properly handle technologies
  const addTechnology = (index: number) => {
    if (!newTech.trim()) return
    
    setProjects(prev =>
      prev.map((project, i) =>
        i === index 
          ? { ...project, technologies: [...project.technologies, newTech.trim()] }
          : project
      )
    )
    setNewTech("")
  }

  // Fix 3: Remove technology
  const removeTechnology = (projectIndex: number, techIndex: number) => {
    setProjects(prev =>
      prev.map((project, i) =>
        i === projectIndex
          ? {
              ...project,
              technologies: project.technologies.filter((_, tIndex) => tIndex !== techIndex)
            }
          : project
      )
    )
  }

  // Fix 4: Add new project without losing data
  const addProject = () => {
    setProjects(prev => [
      ...prev, 
      { 
        id: uuidv4(), 
        name: "", 
        description: "", 
        url: "", 
        technologies: [] 
      }
    ])
  }

  // Fix 5: Remove project
  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }

  // Fix 6: Add validation to ensure form isn't submitted empty
  const handleSubmit = () => {
    // Filter out completely empty projects
    const validProjects = projects.filter(
      project => project.name || project.description || project.url || project.technologies.length > 0
    )
    onSubmit(validProjects)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Projets</h2>
          <Button onClick={addProject} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un projet
          </Button>
        </div>

        {projects.map((project, index) => (
          <div key={project.id} className="space-y-4 p-4 border rounded-md">
            <div className="flex justify-between">
              <h3 className="font-medium">Projet {index + 1}</h3>
              {projects.length > 1 && (
                <Button
                  onClick={() => removeProject(project.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${project.id}`}>Nom du projet</Label>
                <Input
                  id={`name-${project.id}`}
                  value={project.name}
                  onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  placeholder="Application de gestion de tâches"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`description-${project.id}`}>Description</Label>
                <Textarea
                  id={`description-${project.id}`}
                  value={project.description}
                  onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                  placeholder="Une brève description du projet, ses objectifs et vos réalisations..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`url-${project.id}`}>URL du projet (optionnel)</Label>
                <Input
                  id={`url-${project.id}`}
                  value={project.url}
                  onChange={(e) => handleFieldChange(index, "url", e.target.value)}
                  placeholder="https://exemple.com/projet"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Technologies utilisées</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="React, Node.js, etc."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(index))}
                  />
                  <Button type="button" onClick={() => addTechnology(index)} variant="secondary">
                    Ajouter
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        className="ml-1 rounded-full"
                        onClick={() => removeTechnology(index, techIndex)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onSkip}>
            Passer cette étape
          </Button>
          <Button onClick={handleSubmit}>
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
