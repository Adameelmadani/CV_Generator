"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Timeline from "../../components/timeline"
import ProfileSelector from "../../components/profile-selector"
import TemplateSelector from "../../components/template-selector"
import PersonalInfoForm from "../../components/personal-info-form"
import EducationForm from "../../components/education-form"
import ExperienceForm from "../../components/experience-form"
import ProjectsForm from "../../components/projects-form"
import SkillsForm from "../../components/skills-form"
import CertificatesForm from "../../components/certificates-form"
import AchievementsForm from "../../components/achievements-form"
import PublicationsForm from "../../components/publications-form"
import CVPreview from "../../components/cv-preview"
import CVCustomization from "../../components/cv-customization"
import { useProfileSections } from "../../hooks/use-profile-sections"
import type {
  Template,
  CVData,
  PersonalInfo,
  Education,
  Experience,
  Project,
  Skill,
  Certificate,
  Achievement,
  Publication,
} from "../../types/cv"
import type { Profile, SectionType } from "../../types/profile"

type Step =
  | "profile"
  | "template"
  | "personal"
  | "education"
  | "experience"
  | "projects"
  | "certificates"
  | "achievements"
  | "publications"
  | "skills"
  | "customization"

const allSteps = [
  { id: "profile", title: "Profil", description: "Choisir votre profil professionnel" },
  { id: "template", title: "Template", description: "Choisir un modèle" },
  { id: "personal", title: "Personnel", description: "Informations personnelles" },
  { id: "education", title: "Formation", description: "Parcours académique" },
  { id: "experience", title: "Expérience", description: "Parcours professionnel" },
  { id: "projects", title: "Projets", description: "Réalisations" },
  { id: "certificates", title: "Certificats", description: "Certifications obtenues" },
  { id: "achievements", title: "Réalisations", description: "Prix et distinctions" },
  { id: "publications", title: "Publications", description: "Articles et recherches" },
  { id: "skills", title: "Compétences", description: "Savoir-faire" },
  { id: "customization", title: "Finalisation", description: "Personnalisation et export" },
]

export default function CVGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>("profile")
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [cvData, setCvData] = useState<Partial<CVData>>({})
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [skippedSteps, setSkippedSteps] = useState<string[]>([])

  const profileConfig = useProfileSections(selectedProfile)

  // Filtrer les étapes selon le profil sélectionné
  const availableSteps = allSteps.filter((step) => {
    if (step.id === "profile" || step.id === "template" || step.id === "customization") {
      return true
    }
    return profileConfig.shouldShowSection(step.id as SectionType)
  })

  const markStepAsCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const markStepAsSkipped = (stepId: string) => {
    if (!skippedSteps.includes(stepId)) {
      setSkippedSteps([...skippedSteps, stepId])
    }
  }

  const getNextStep = (currentStepId: Step): Step => {
    const currentIndex = availableSteps.findIndex((step) => step.id === currentStepId)
    if (currentIndex < availableSteps.length - 1) {
      return availableSteps[currentIndex + 1].id as Step
    }
    return "customization"
  }

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId as Step)
  }

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile)
    setCvData((prev) => ({ ...prev, profile }))
    markStepAsCompleted("profile")
    setCurrentStep("template")
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    markStepAsCompleted("template")
    setCurrentStep("personal")
  }

  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setCvData((prev) => ({ ...prev, personalInfo: data }))
    markStepAsCompleted("personal")
    setCurrentStep(getNextStep("personal"))
  }

  const handleEducationSubmit = (data: Education[]) => {
    setCvData((prev) => ({ ...prev, education: data || [] }))
    markStepAsCompleted("education")
    setCurrentStep(getNextStep("education"))
  }

  const handleExperienceSubmit = (data: Experience[]) => {
    setCvData((prev) => ({ ...prev, experience: data || [] }))
    markStepAsCompleted("experience")
    setCurrentStep(getNextStep("experience"))
  }

  const handleProjectsSubmit = (data: Project[]) => {
    setCvData((prev) => ({ ...prev, projects: data || [] }))
    markStepAsCompleted("projects")
    setCurrentStep(getNextStep("projects"))
  }

  const handleCertificatesSubmit = (data: Certificate[]) => {
    setCvData((prev) => ({ ...prev, certificates: data || [] }))
    markStepAsCompleted("certificates")
    setCurrentStep(getNextStep("certificates"))
  }

  const handleAchievementsSubmit = (data: Achievement[]) => {
    setCvData((prev) => ({ ...prev, achievements: data || [] }))
    markStepAsCompleted("achievements")
    setCurrentStep(getNextStep("achievements"))
  }

  const handlePublicationsSubmit = (data: Publication[]) => {
    setCvData((prev) => ({ ...prev, publications: data || [] }))
    markStepAsCompleted("publications")
    setCurrentStep(getNextStep("publications"))
  }

  const handleSkillsSubmit = (data: Skill[]) => {
    setCvData((prev) => ({ ...prev, skills: data || [] }))
    markStepAsCompleted("skills")
    setCurrentStep("customization")
  }

  // Fonctions de skip (seulement pour les sections optionnelles)
  const handlePersonalInfoSkip = () => {
    markStepAsSkipped("personal")
    setCurrentStep(getNextStep("personal"))
  }
  const handleEducationSkip = () => {
    markStepAsSkipped("education")
    setCurrentStep(getNextStep("education"))
  }
  const handleExperienceSkip = () => {
    markStepAsSkipped("experience")
    setCurrentStep(getNextStep("experience"))
  }
  const handleProjectsSkip = () => {
    markStepAsSkipped("projects")
    setCurrentStep(getNextStep("projects"))
  }
  const handleCertificatesSkip = () => {
    markStepAsSkipped("certificates")
    setCurrentStep(getNextStep("certificates"))
  }
  const handleAchievementsSkip = () => {
    markStepAsSkipped("achievements")
    setCurrentStep(getNextStep("achievements"))
  }
  const handlePublicationsSkip = () => {
    markStepAsSkipped("publications")
    setCurrentStep(getNextStep("publications"))
  }
  const handleSkillsSkip = () => {
    markStepAsSkipped("skills")
    setCurrentStep("customization")
  }

  const handleExport = (format: string) => {
    console.log(`Exporting CV in ${format} format`)
    // Ici, vous implémenteriez la logique d'export
  }

  const goBack = () => {
    const currentIndex = availableSteps.findIndex((step) => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(availableSteps[currentIndex - 1].id as Step)
    }
  }

  const canSkipSection = (section: SectionType) => {
    return profileConfig.isOptional(section)
  }

  // Correction du typage pour la prop onSkip : on ne la passe que si elle existe
  // --- Ajout des handlers de changement en temps réel ---
  const handleEducationChange = useCallback((data: Education[]) => {
    setCvData((prev) => ({ ...prev, education: data || [] }))
  }, [])
  
  const handleExperienceChange = useCallback((data: Experience[]) => {
    setCvData((prev) => ({ ...prev, experience: data || [] }))
  }, [])
  
  const handleProjectsChange = useCallback((data: Project[]) => {
    setCvData((prev) => ({ ...prev, projects: data || [] }))
  }, [])
  
  const handleCertificatesChange = useCallback((data: Certificate[]) => {
    setCvData((prev) => ({ ...prev, certificates: data || [] }))
  }, [])
  
  const handleAchievementsChange = useCallback((data: Achievement[]) => {
    setCvData((prev) => ({ ...prev, achievements: data || [] }))
  }, [])
  
  const handlePublicationsChange = useCallback((data: Publication[]) => {
    setCvData((prev) => ({ ...prev, publications: data || [] }))
  }, [])
  
  const handleSkillsChange = useCallback((data: Skill[]) => {
    setCvData((prev) => ({ ...prev, skills: data || [] }))
  }, [])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "profile":
        return <ProfileSelector onProfileSelect={handleProfileSelect} />
      case "template":
        return <TemplateSelector onTemplateSelect={handleTemplateSelect} />
      case "personal":
        return (
          <PersonalInfoForm
            initialData={cvData.personalInfo}
            onSubmit={handlePersonalInfoSubmit}
            {...(canSkipSection("personal") ? { onSkip: handlePersonalInfoSkip } : {})}
          />
        )
      case "education":
        return (
          <EducationForm
            initialData={cvData.education}
            onChange={handleEducationChange}
            onSubmit={handleEducationSubmit}
            {...(canSkipSection("education") ? { onSkip: handleEducationSkip } : {})}
          />
        )
      case "experience":
        return (
          <ExperienceForm
            initialData={cvData.experience}
            onChange={handleExperienceChange}
            onSubmit={handleExperienceSubmit}
            {...(canSkipSection("experience") ? { onSkip: handleExperienceSkip } : {})}
          />
        )
      case "projects":
        return (
          <ProjectsForm
            initialData={cvData.projects}
            onChange={handleProjectsChange}
            onSubmit={handleProjectsSubmit}
            {...(canSkipSection("projects") ? { onSkip: handleProjectsSkip } : {})}
          />
        )
      case "certificates":
        return (
          <CertificatesForm
            initialData={cvData.certificates}
            onChange={handleCertificatesChange}
            onSubmit={handleCertificatesSubmit}
            {...(canSkipSection("certificates") ? { onSkip: handleCertificatesSkip } : {})}
          />
        )
      case "achievements":
        return (
          <AchievementsForm
            initialData={cvData.achievements}
            onChange={handleAchievementsChange}
            onSubmit={handleAchievementsSubmit}
            {...(canSkipSection("achievements") ? { onSkip: handleAchievementsSkip } : {})}
          />
        )
      case "publications":
        return (
          <PublicationsForm
            initialData={cvData.publications}
            onChange={handlePublicationsChange}
            onSubmit={handlePublicationsSubmit}
            {...(canSkipSection("publications") ? { onSkip: handlePublicationsSkip } : {})}
          />
        )
      case "skills":
        return (
          <SkillsForm
            initialData={cvData.skills}
            onChange={handleSkillsChange}
            onSubmit={handleSkillsSubmit}
            {...(canSkipSection("skills") ? { onSkip: handleSkillsSkip } : {})}
          />
        )
      case "customization":
        return <CVCustomization data={cvData as CVData} onExport={handleExport} />
      default:
        return null
    }
  }

  const showTwoColumnLayout = currentStep !== "profile" && currentStep !== "template" && currentStep !== "customization"
  const showHeader = currentStep !== "profile" && currentStep !== "customization"

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div>
                  <h2 className="font-semibold">{availableSteps.find((step) => step.id === currentStep)?.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {availableSteps.find((step) => step.id === currentStep)?.description}
                  </p>
                  {selectedProfile && (
                    <p className="text-xs text-muted-foreground">
                      Profil : {selectedProfile.name} •
                      {profileConfig.isRequired(currentStep as SectionType) ? (
                        <span className="text-green-600 font-medium"> Section obligatoire</span>
                      ) : (
                        <span className="text-blue-600"> Section optionnelle</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <Timeline
              steps={availableSteps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
              skippedSteps={skippedSteps}
            />
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {showTwoColumnLayout ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div>{renderCurrentStep()}</div>
            {/* Aperçu */}
            <div className="lg:sticky lg:top-8">
              <CVPreview data={cvData} />
            </div>
          </div>
        ) : (
          renderCurrentStep()
        )}
      </main>
    </div>
  )
}