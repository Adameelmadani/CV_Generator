"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Calendar, ExternalLink, Award, Trophy, BookOpen } from "lucide-react"
import type { CVData } from "../types/cv"

interface CVPreviewProps {
  data: Partial<CVData>
  template?: string
}

export default function CVPreview({ data, template = "modern" }: CVPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Aperçu du CV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* En-tête */}
        {data.personalInfo && (
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">{data.personalInfo.fullName}</h1>
            {data.personalInfo.title && <p className="text-lg text-muted-foreground">{data.personalInfo.title}</p>}

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {data.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {data.personalInfo.email}
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {data.personalInfo.phone}
                </div>
              )}
              {data.personalInfo.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {data.personalInfo.address}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Résumé professionnel */}
        {data.personalInfo?.professionalSummary && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Profil professionnel</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.personalInfo.professionalSummary}</p>
          </div>
        )}

        <Separator />

        {/* Expériences */}
        {data.experience && data.experience.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Expérience professionnelle</h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={exp.id || `experience-${index}`} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{exp.position}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.employer} • {exp.city}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(exp.startDate)} - {exp.isCurrently ? "Présent" : formatDate(exp.endDate || "")}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formation */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Formation</h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={edu.id || `education-${index}`} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution} • {edu.city}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(edu.startDate)} - {edu.isCurrently ? "En cours" : formatDate(edu.endDate || "")}
                    </div>
                  </div>
                  {edu.description && <p className="text-sm text-muted-foreground">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projets */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Projets</h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={project.id || `project-${index}`} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{project.name}</h3>
                    {project.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificats */}
        {data.certificates && data.certificates.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificats
            </h2>
            <div className="space-y-3">
              {data.certificates.map((cert, index) => (
                <div key={cert.id || `certificate-${index}`} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(cert.issueDate)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Réalisations */}
        {data.achievements && data.achievements.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Réalisations
            </h2>
            <div className="space-y-3">
              {data.achievements.map((achievement, index) => (
                <div key={achievement.id || `achievement-${index}`} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{achievement.title}</h3>
                    <div className="text-xs text-muted-foreground">{formatDate(achievement.date)}</div>
                  </div>
                  {achievement.organization && (
                    <p className="text-sm text-muted-foreground">{achievement.organization}</p>
                  )}
                  <p className="text-sm leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications */}
        {data.publications && data.publications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Publications
            </h2>
            <div className="space-y-3">
              {data.publications.map((pub, index) => (
                <div key={pub.id || `publication-${index}`} className="space-y-1">
                  <h3 className="font-medium">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pub.authors.join(", ")} • {pub.journal} • {formatDate(pub.date)}
                  </p>
                  {pub.description && <p className="text-sm leading-relaxed">{pub.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compétences */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Compétences</h2>
            <div className="space-y-3">
              {Object.entries(
                data.skills.reduce(
                  (acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = []
                    acc[skill.category].push(skill)
                    return acc
                  },
                  {} as Record<string, typeof data.skills>,
                ),
              ).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="outline" className="text-xs">
                        {skill.name} ({skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
