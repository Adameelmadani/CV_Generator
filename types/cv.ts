import type { Profile } from "./profile"

export interface PersonalInfo {
  photo?: File | string
  fullName: string
  title: string
  birthDate: string
  email: string
  phone: string
  address: string
  linkedinUrl?: string
  githubUrl?: string
  professionalSummary: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  city: string
  startDate: string
  endDate?: string
  isCurrently: boolean
  description?: string
}

export interface Experience {
  id: string
  position: string
  employer: string
  city: string
  startDate: string
  endDate?: string
  isCurrently: boolean
  description: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
}

export interface Skill {
  id: string
  name: string
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert"
  category: string
}

export interface Certificate {
  id: string
  name: string
  issueDate: string
  issuer: string
  url?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  organization?: string
}

export interface Publication {
  id: string
  title: string
  authors: string[]
  journal: string
  date: string
  url?: string
  description?: string
}

export interface CVData {
  profile?: Profile
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
  achievements: Achievement[]
  publications: Publication[]
}

export interface Template {
  id: string
  name: string
  description: string
  preview: string
}
