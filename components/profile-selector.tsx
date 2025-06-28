"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { profiles, type Profile } from "../types/profile"

interface ProfileSelectorProps {
  onProfileSelect: (profile: Profile) => void
}

const sectionNames = {
  personal: "Informations personnelles",
  education: "Formation",
  experience: "Expériences professionnelles",
  projects: "Projets",
  certificates: "Certificats",
  achievements: "Réalisations",
  publications: "Publications",
  skills: "Compétences",
}

export default function ProfileSelector({ onProfileSelect }: ProfileSelectorProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  const handleSelect = (profile: Profile) => {
    setSelectedProfile(profile)
    // Passer directement à l'étape suivante après une courte animation
    setTimeout(() => {
      onProfileSelect(profile)
    }, 300)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisissez votre profil professionnel</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sélectionnez le profil qui correspond le mieux à votre situation. Cela nous permettra de personnaliser les
          sections de votre CV selon vos besoins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedProfile?.id === profile.id ? "ring-2 ring-[rgb(37,99,235)] shadow-lg scale-105" : ""
            }`}
            onClick={() => handleSelect(profile)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{profile.icon}</div>
                {selectedProfile?.id === profile.id && (
                  <CheckCircle2 className="h-5 w-5 text-[rgb(37,99,235)] animate-pulse" />
                )}
              </div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <CardDescription className="text-sm">{profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">Sections obligatoires</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.requiredSections.map((section) => (
                    <Badge key={section} variant="default" className="text-xs bg-green-100 text-green-800">
                      {sectionNames[section]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">Sections optionnelles</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.optionalSections.map((section) => (
                    <Badge key={section} variant="outline" className="text-xs border-blue-200 text-blue-700">
                      {sectionNames[section]}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProfile && (
        <div className="text-center">
          <div className="bg-[rgb(37,99,235)] text-white rounded-lg p-6 mb-6 max-w-2xl mx-auto animate-pulse">
            <h3 className="font-semibold mb-2">✓ Profil sélectionné : {selectedProfile.name}</h3>
            <p className="text-sm opacity-90">Redirection en cours...</p>
          </div>
        </div>
      )}
    </div>
  )
}
