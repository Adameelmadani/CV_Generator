export type ProfileType = "student" | "engineer" | "manager" | "teacher" | "technician" | "researcher" | "other"

export type SectionType =
  | "personal"
  | "education"
  | "experience"
  | "projects"
  | "certificates"
  | "achievements"
  | "publications"
  | "skills"

export interface Profile {
  id: ProfileType
  name: string
  description: string
  icon: string
  requiredSections: SectionType[]
  optionalSections: SectionType[]
}

export const profiles: Profile[] = [
  {
    id: "student",
    name: "Étudiant",
    description: "Profil pour étudiants en recherche de stage ou premier emploi",
    icon: "🎓",
    requiredSections: ["personal", "education", "skills"],
    optionalSections: ["projects", "certificates", "achievements"],
  },
  {
    id: "engineer",
    name: "Ingénieur",
    description: "Profil technique avec focus sur les projets et compétences",
    icon: "⚙️",
    requiredSections: ["personal", "education", "experience", "projects", "skills"],
    optionalSections: ["certificates", "achievements", "publications"],
  },
  {
    id: "manager",
    name: "Manager / RH",
    description: "Profil managérial avec focus sur l'expérience et le leadership",
    icon: "👔",
    requiredSections: ["personal", "education", "experience", "skills"],
    optionalSections: ["achievements", "certificates", "projects"],
  },
  {
    id: "teacher",
    name: "Enseignant / Formateur",
    description: "Profil éducatif avec focus sur la pédagogie et les publications",
    icon: "📚",
    requiredSections: ["personal", "education", "experience", "skills"],
    optionalSections: ["publications", "achievements", "certificates"],
  },
  {
    id: "technician",
    name: "Technicien / Ouvrier",
    description: "Profil technique avec focus sur l'expérience pratique",
    icon: "🔧",
    requiredSections: ["personal", "education", "experience", "skills"],
    optionalSections: ["projects", "certificates"],
  },
  {
    id: "researcher",
    name: "Chercheur / Doctorant",
    description: "Profil académique avec focus sur la recherche et les publications",
    icon: "🔬",
    requiredSections: ["personal", "education", "publications", "skills"],
    optionalSections: ["projects", "experience", "certificates", "achievements"],
  },
  {
    id: "other",
    name: "Autre profil",
    description: "Profil générique adaptable à tous les secteurs",
    icon: "💼",
    requiredSections: ["personal", "education", "skills"],
    optionalSections: ["experience", "projects", "certificates", "achievements", "publications"],
  },
]
