"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Award, X } from "lucide-react"
import type { Skill } from "../types/cv"

interface SkillsFormProps {
  initialData?: Skill[]
  onSubmit: (data: Skill[]) => void
  onChange?: (data: Skill[]) => void
  onSkip?: () => void
}

const skillLevels = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const
const skillCategories = [
  "Langages de programmation",
  "Frameworks",
  "Bases de données",
  "Outils",
  "Soft Skills",
  "Langues",
  "Autre",
]

export default function SkillsForm({ initialData = [], onSubmit, onChange, onSkip }: SkillsFormProps) {
  const [skills, setSkills] = useState<Skill[]>(initialData)
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "Intermédiaire" as const,
    category: "Langages de programmation",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: crypto.randomUUID(),
        name: newSkill.name.trim(),
        level: newSkill.level,
        category: newSkill.category,
      }
      const updatedSkills = [...skills, skill]
      setSkills(updatedSkills)
      setNewSkill({
        name: "",
        level: "Intermédiaire",
        category: "Langages de programmation",
      })
      // Nettoyer l'erreur si il y en avait une
      if (errors["newSkill"]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors["newSkill"]
          return newErrors
        })
      }
    } else {
      setErrors(prev => ({ ...prev, newSkill: "Le nom de la compétence est requis" }))
    }
  }

  const removeSkill = (id: string) => {
    const updatedSkills = skills.filter((skill) => skill.id !== id)
    setSkills(updatedSkills)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (skills.length === 0) newErrors["skills"] = "Au moins une compétence est requise"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(skills)
    }
  }

  useEffect(() => {
    if (typeof onChange === "function") onChange(skills)
  }, [skills, onChange])

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Débutant":
        return "bg-red-100 text-red-800"
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800"
      case "Avancé":
        return "bg-blue-100 text-blue-800"
      case "Expert":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Compétences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Ajouter une nouvelle compétence */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Ajouter une compétence</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillName">Nom de la compétence</Label>
                <Input
                  id="skillName"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="React, JavaScript, etc."
                />
                {errors["newSkill"] && (
                  <p className="text-sm text-destructive">{errors["newSkill"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select
                  value={newSkill.level}
                  onValueChange={(value) => setNewSkill({ ...newSkill, level: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={newSkill.category}
                  onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button type="button" onClick={addSkill} className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {/* Affichage des compétences par catégorie */}
          {Object.keys(groupedSkills).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Compétences ajoutées</h3>
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="outline"
                        className={`flex items-center gap-2 ${getLevelColor(skill.level)}`}
                      >
                        <span>{skill.name}</span>
                        <span className="text-xs">({skill.level})</span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeSkill(skill.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {skills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {errors["skills"] && (
                <p className="text-sm text-destructive mb-2">{errors["skills"]}</p>
              )}
              Aucune compétence ajoutée. Commencez par ajouter vos compétences ci-dessus.
            </div>
          )}

          <div className="flex gap-4">
            {onSkip && (
              <Button type="button" variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
                Passer cette étape
              </Button>
            )}
            <Button type="submit" className={onSkip ? "flex-1" : "w-full"}>
              Terminer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}