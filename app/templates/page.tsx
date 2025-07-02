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
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const categories = [
    { id: "all", name: "Tous les Modèles", icon: FileText },
    { id: "business", name: "Affaires", icon: Briefcase },
    { id: "creative", name: "Créatif", icon: Palette },
    { id: "tech", name: "Technologie", icon: Code },
    { id: "academic", name: "Académique", icon: GraduationCap },
    { id: "healthcare", name: "Santé", icon: Heart },
    { id: "corporate", name: "Entreprise", icon: Building },
  ]

  const templates = [
    {
      id: 1,
      name: "Professionnel Moderne",
      category: "business",
      level: "premium",
      description: "Design épuré et moderne parfait pour les professionnels d'affaires",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "12.5K",
      tags: ["Compatible ATS", "Moderne", "Professionnel"],
      color: "blue",
    },
    {
      id: 2,
      name: "Portfolio Créatif",
      category: "creative",
      level: "premium",
      description: "Mettez en valeur votre créativité avec ce modèle vibrant",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "8.2K",
      tags: ["Créatif", "Portfolio", "Coloré"],
      color: "purple",
    },
    {
      id: 3,
      name: "Tech Minimaliste",
      category: "tech",
      level: "free",
      description: "Design minimaliste pour les professionnels de la tech",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      downloads: "15.1K",
      tags: ["Minimaliste", "Tech", "Épuré"],
      color: "green",
    },
    {
      id: 4,
      name: "Exécutif Élite",
      category: "corporate",
      level: "premium",
      description: "Modèle sophistiqué pour les cadres supérieurs",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "6.8K",
      tags: ["Exécutif", "Élégant", "Entreprise"],
      color: "indigo",
    },
    {
      id: 5,
      name: "Académique Érudit",
      category: "academic",
      level: "free",
      description: "Parfait pour les postes académiques et de recherche",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      downloads: "9.3K",
      tags: ["Académique", "Recherche", "Traditionnel"],
      color: "emerald",
    },
    {
      id: 6,
      name: "Pro Santé",
      category: "healthcare",
      level: "premium",
      description: "Modèle professionnel pour les travailleurs de la santé",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "7.4K",
      tags: ["Santé", "Professionnel", "Épuré"],
      color: "red",
    },
    {
      id: 7,
      name: "Fondateur Startup",
      category: "business",
      level: "free",
      description: "Modèle dynamique pour entrepreneurs et fondateurs de startup",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      downloads: "11.2K",
      tags: ["Startup", "Dynamique", "Moderne"],
      color: "orange",
    },
    {
      id: 8,
      name: "Vitrine Designer",
      category: "creative",
      level: "premium",
      description: "Parfait pour les designers qui veulent présenter leur travail",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      downloads: "5.9K",
      tags: ["Design", "Portfolio", "Visuel"],
      color: "pink",
    },
    {
      id: 9,
      name: "Focus Développeur",
      category: "tech",
      level: "premium",
      description: "Modèle axé sur le code pour les développeurs logiciels",
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      downloads: "13.7K",
      tags: ["Développeur", "Code", "Technique"],
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
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CVCraft</span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Fonctionnalités
            </Link>
            <Link href="/templates" className="text-sm font-medium text-blue-600 font-semibold">
              Modèles
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Tarifs
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Ressources
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="bg-white text-gray-700 border-gray-300">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">S'inscrire</Button>
            </Link>
          </nav>
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="flex flex-col space-y-2 p-4">
              <Link href="/" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Accueil</Link>
              <Link href="/features" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Fonctionnalités</Link>
              <Link href="/templates" className="text-base font-medium text-blue-600 py-2">Modèles</Link>
              <Link href="/pricing" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Tarifs</Link>
              <Link href="/resources" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Ressources</Link>
              <div className="border-t my-2"></div>
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-white text-gray-700 border-gray-300">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">S'inscrire</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Choisissez parmi <span className="text-blue-600">50+ Modèles</span> de CV Professionnels
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Découvrez notre collection de modèles conçus par des experts, optimisés pour les ATS et créés pour chaque secteur et 
                  niveau de carrière. Trouvez le design parfait pour présenter votre parcours professionnel unique.
                </p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher des modèles..."
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
                    <option value="all">Tous les Niveaux</option>
                    <option value="free">Gratuit</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Note moyenne 4,8/5</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span>500K+ téléchargements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Optimisé ATS</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{filteredTemplates.length} Modèles Trouvés</h2>
              <p className="text-gray-600">
                {selectedCategory !== "all" &&
                  `Affichage des modèles ${categories.find((c) => c.id === selectedCategory)?.name}`}
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
                            Gratuit
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <Button size="sm" variant="secondary" className="bg-white text-gray-900">
                            <Eye className="h-4 w-4 mr-1" />
                            Aperçu
                          </Button>
                          <Link href="/builder">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Utiliser le Modèle
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
                            Utiliser le Modèle
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun modèle trouvé</h3>
                <p className="text-gray-600 mb-4">Essayez d'ajuster vos critères de recherche ou de filtre</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedLevel("all")
                  }}
                >
                  Effacer les Filtres
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Prêt à Créer Votre CV Parfait ?</h2>
              <p className="text-xl text-blue-100">
                Choisissez parmi notre collection de modèles professionnels et commencez à créer votre CV qui vous fera décrocher un emploi dès aujourd'hui
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Commencer Maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    Voir les Tarifs
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
                Créez des CV professionnels qui captent l'attention des recruteurs grâce à notre plateforme intuitive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Modèles</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Exemples</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Centre d’aide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conseils CV</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conseils carrière</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conditions</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CVCraft. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}