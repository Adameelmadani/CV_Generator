"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Download,
  Eye,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
}

interface Experience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  location: string
  graduationDate: string
  gpa?: string
}

interface Skill {
  id: string
  name: string
  level: string
}

export default function CVBuilder() {
  const [activeTab, setActiveTab] = useState("personal")

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  })

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ])

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: "",
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([{ id: "1", name: "", level: "Beginner" }])

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setExperiences([...experiences, newExp])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: "",
    }
    setEducation([...education, newEdu])
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: "Beginner",
    }
    setSkills([...skills, newSkill])
  }

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id))
  }

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">CV Builder</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Build Your Professional CV</h1>
              <p className="text-gray-600 mb-6">Fill in your information to create a stunning resume</p>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Experience</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 mt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input
                      id="website"
                      value={personalInfo.website}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                      placeholder="https://johndoe.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                      placeholder="Write a brief summary of your professional background and career objectives..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <Button onClick={addExperience} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>

                  {experiences.map((exp, index) => (
                    <Card key={exp.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        {experiences.length > 1 && (
                          <Button
                            onClick={() => removeExperience(exp.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company *</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                            disabled={exp.current}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Job Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="education" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <Button onClick={addEducation} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>

                  {education.map((edu, index) => (
                    <Card key={edu.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        {education.length > 1 && (
                          <Button
                            onClick={() => removeEducation(edu.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School/University *</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                            placeholder="University of California"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                            placeholder="Berkeley, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Graduation Date</Label>
                          <Input
                            type="month"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GPA (Optional)</Label>
                          <Input
                            value={edu.gpa || ""}
                            onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <Button onClick={addSkill} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {skills.map((skill, index) => (
                      <div key={skill.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <Input
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                            placeholder="JavaScript, Project Management, etc."
                          />
                        </div>
                        <div className="w-32">
                          <select
                            value={skill.level}
                            onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        {skills.length > 1 && (
                          <Button
                            onClick={() => removeSkill(skill.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-24">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <Badge variant="secondary">Professional Template</Badge>
              </div>

              <div className="bg-white border rounded-lg p-6 shadow-sm min-h-[600px] text-sm">
                {/* CV Preview */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{personalInfo.fullName || "Your Name"}</h1>
                    <div className="text-gray-600 mt-2 space-y-1">
                      {personalInfo.email && <div>{personalInfo.email}</div>}
                      {personalInfo.phone && <div>{personalInfo.phone}</div>}
                      {personalInfo.location && <div>{personalInfo.location}</div>}
                      {personalInfo.website && <div>{personalInfo.website}</div>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
                      <p className="text-gray-700">{personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {experiences.some((exp) => exp.jobTitle || exp.company) && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h2>
                      <div className="space-y-4">
                        {experiences
                          .filter((exp) => exp.jobTitle || exp.company)
                          .map((exp) => (
                            <div key={exp.id}>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-medium text-gray-900">
                                  {exp.jobTitle} {exp.company && `at ${exp.company}`}
                                </h3>
                                <span className="text-gray-600 text-xs">
                                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                </span>
                              </div>
                              {exp.location && <p className="text-gray-600 text-xs mb-2">{exp.location}</p>}
                              {exp.description && <p className="text-gray-700 text-xs">{exp.description}</p>}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.some((edu) => edu.degree || edu.school) && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                      <div className="space-y-3">
                        {education
                          .filter((edu) => edu.degree || edu.school)
                          .map((edu) => (
                            <div key={edu.id}>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                <span className="text-gray-600 text-xs">{edu.graduationDate}</span>
                              </div>
                              <p className="text-gray-600 text-xs">
                                {edu.school} {edu.location && `• ${edu.location}`}
                              </p>
                              {edu.gpa && <p className="text-gray-600 text-xs">GPA: {edu.gpa}</p>}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.some((skill) => skill.name) && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {skills
                          .filter((skill) => skill.name)
                          .map((skill) => (
                            <div key={skill.id} className="flex justify-between">
                              <span className="text-gray-700 text-xs">{skill.name}</span>
                              <span className="text-gray-500 text-xs">{skill.level}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
