"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Search,
  ArrowRight,
  Star,
  Download,
  Eye,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Heart,
  Building,
  Zap,
  Crown,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const categories = [
    { id: "all", name: "All Templates", icon: FileText },
    { id: "business", name: "Business", icon: Briefcase },
    { id: "creative", name: "Creative", icon: Palette },
    { id: "tech", name: "Technology", icon: Code },
    { id: "academic", name: "Academic", icon: GraduationCap },
    { id: "healthcare", name: "Healthcare", icon: Heart },
    { id: "corporate", name: "Corporate", icon: Building },
  ]

  const templates = [
    {
      id: 1,
      name: "Modern Professional",
      category: "business",
      level: "premium",
      description: "Clean, modern design perfect for business professionals",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "12.5K",
      tags: ["ATS-Friendly", "Modern", "Professional"],
      color: "blue",
    },
    {
      id: 2,
      name: "Creative Portfolio",
      category: "creative",
      level: "premium",
      description: "Showcase your creativity with this vibrant template",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "8.2K",
      tags: ["Creative", "Portfolio", "Colorful"],
      color: "purple",
    },
    {
      id: 3,
      name: "Tech Minimalist",
      category: "tech",
      level: "free",
      description: "Minimalist design for tech professionals",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      downloads: "15.1K",
      tags: ["Minimalist", "Tech", "Clean"],
      color: "green",
    },
    {
      id: 4,
      name: "Executive Elite",
      category: "corporate",
      level: "premium",
      description: "Sophisticated template for senior executives",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "6.8K",
      tags: ["Executive", "Elegant", "Corporate"],
      color: "indigo",
    },
    {
      id: 5,
      name: "Academic Scholar",
      category: "academic",
      level: "free",
      description: "Perfect for academic and research positions",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      downloads: "9.3K",
      tags: ["Academic", "Research", "Traditional"],
      color: "emerald",
    },
    {
      id: 6,
      name: "Healthcare Pro",
      category: "healthcare",
      level: "premium",
      description: "Professional template for healthcare workers",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "7.4K",
      tags: ["Healthcare", "Professional", "Clean"],
      color: "red",
    },
    {
      id: 7,
      name: "Startup Founder",
      category: "business",
      level: "free",
      description: "Dynamic template for entrepreneurs and startup founders",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      downloads: "11.2K",
      tags: ["Startup", "Dynamic", "Modern"],
      color: "orange",
    },
    {
      id: 8,
      name: "Designer Showcase",
      category: "creative",
      level: "premium",
      description: "Perfect for designers to showcase their work",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "5.9K",
      tags: ["Design", "Portfolio", "Visual"],
      color: "pink",
    },
    {
      id: 9,
      name: "Developer Focus",
      category: "tech",
      level: "premium",
      description: "Code-focused template for software developers",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "13.7K",
      tags: ["Developer", "Code", "Technical"],
      color: "cyan",
    },
  ]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || template.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 hover:border-blue-400",
      purple: "border-purple-200 hover:border-purple-400",
      green: "border-green-200 hover:border-green-400",
      indigo: "border-indigo-200 hover:border-indigo-400",
      emerald: "border-emerald-200 hover:border-emerald-400",
      red: "border-red-200 hover:border-red-400",
      orange: "border-orange-200 hover:border-orange-400",
      pink: "border-pink-200 hover:border-pink-400",
      cyan: "border-cyan-200 hover:border-cyan-400",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CVCraft</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="/templates" className="text-sm font-medium text-blue-600 font-semibold">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Resources
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="bg-white text-gray-700 border-gray-300">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  🎨 Professional Templates
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Choose from <span className="text-blue-600">50+ Professional</span> CV Templates
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover our collection of expertly designed, ATS-optimized templates crafted for every industry and
                  career level. Find the perfect design to showcase your unique professional story.
                </p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.8/5 average rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span>500K+ downloads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>ATS-optimized</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{filteredTemplates.length} Templates Found</h2>
              <p className="text-gray-600">
                {selectedCategory !== "all" &&
                  `Showing ${categories.find((c) => c.id === selectedCategory)?.name} templates`}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`group border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getColorClasses(template.color)}`}
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={template.image || "/placeholder.svg"}
                        alt={template.name}
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        {template.level === "premium" ? (
                          <Badge className="bg-yellow-500 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Free
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <Button size="sm" variant="secondary" className="bg-white text-gray-900">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Link href="/builder">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Use Template
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{template.description}</CardDescription>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="h-4 w-4 text-gray-400" />
                            <span>{template.downloads}</span>
                          </div>
                        </div>
                        <Link href="/builder">
                          <Button size="sm" variant="outline">
                            Use Template
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedLevel("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Create Your Perfect CV?</h2>
              <p className="text-xl text-blue-100">
                Choose from our collection of professional templates and start building your career-winning CV today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CVCraft</span>
              </div>
              <p className="text-gray-400">
                Create professional CVs that get you hired. Trusted by professionals worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/templates" className="hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/examples" className="hover:text-white transition-colors">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-white transition-colors">
                    CV Tips
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Career Advice
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CVCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
