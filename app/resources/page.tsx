"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Book, BookOpen, FileText, Lightbulb, Menu, Newspaper, PlayCircle, Search, UserCheck, Video, X } from "lucide-react"
import Image from "next/image"

function ResourcesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const resources = [
    {
      id: 1,
      title: "Le Guide Ultime pour Rédiger un CV",
      type: "guide",
      category: "Rédaction",
      description: "Guide complet pour rédiger un CV efficace qui se démarque",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "15 min de lecture",
      icon: Book,
      color: "blue",
    },
    {
      id: 2,
      title: "Modèles de CV Compatibles ATS",
      type: "article",
      category: "Modèles",
      description: "Comment s'assurer que votre CV passe les systèmes de suivi des candidats",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "8 min de lecture",
      icon: FileText,
      color: "green",
    },
    {
      id: 3,
      title: "Masterclass sur la Lettre de Motivation",
      type: "video",
      category: "Rédaction",
      description: "Apprenez à rédiger des lettres de motivation percutantes qui obtiennent des réponses",
      image: "/placeholder.svg?height=400&width=300",
      duration: "22 minutes",
      icon: Video,
      color: "purple",
    },
    {
      id: 4,
      title: "Boîte à Outils pour Préparer un Entretien",
      type: "guide",
      category: "Entretiens",
      description: "Préparez-vous aux questions d'entretien courantes avec ce guide complet",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "25 min de lecture",
      icon: UserCheck,
      color: "orange",
    },
    {
      id: 5,
      title: "Tendances du Marché de l'Emploi 2023",
      type: "rapport",
      category: "Marché de l'emploi",
      description: "Dernières informations sur les tendances d'embauche dans différents secteurs",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "12 min de lecture",
      icon: Newspaper,
      color: "indigo",
    },
    {
      id: 6,
      title: "Changement de Carrière : étape par étape",
      type: "guide",
      category: "Carrière",
      description: "Comment réussir votre transition vers une nouvelle carrière",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "18 min de lecture",
      icon: BookOpen,
      color: "pink",
    },
  ]

  const quickTips = [
    {
      title: "Personnalisez Votre CV",
      description: "Adaptez toujours votre CV pour chaque candidature",
      icon: Lightbulb,
    },
    {
      title: "Quantifiez Vos Réalisations",
      description: "Incluez des chiffres et des indicateurs pour montrer votre impact",
      icon: Search,
    },
    {
      title: "Soyez Concis",
      description: "Limitez votre CV à 1-2 pages avec un contenu ciblé",
      icon: FileText,
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap: {[key: string]: string} = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      indigo: "bg-indigo-100 text-indigo-600",
      pink: "bg-pink-100 text-pink-600",
    }
    
    return colorMap[color] || "bg-gray-100 text-gray-600"
  }

  return (
    <div className="flex min-h-screen flex-col">
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
            <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Modèles
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Tarifs
            </Link>
            <Link href="/resources" className="text-sm font-medium text-blue-600 font-semibold">
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
              <Link href="/templates" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Modèles</Link>
              <Link href="/pricing" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Tarifs</Link>
              <Link href="/resources" className="text-base font-medium text-blue-600 py-2">Ressources</Link>
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
        {/* Section Hero */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Boostez Votre Carrière avec Nos <span className="text-blue-600">Ressources Expertes</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Guides complets, modèles et conseils professionnels pour vous aider à décrocher le job de vos rêves et faire avancer votre parcours professionnel.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  Parcourir les Ressources
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/builder">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white text-gray-700 border-gray-300 text-lg px-8 py-3"
                  >
                    Créez Votre CV Maintenant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section Ressources */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Ressources CV & Carrière</h2>
              <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
                Découvrez notre collection de ressources créées par des experts pour vous aider à chaque étape de votre parcours professionnel
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getColorClasses(resource.color)}>
                        {resource.category}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <resource.icon className={`h-5 w-5 text-${resource.color}-600`} />
                      <span className="text-sm font-medium text-gray-500">{resource.type.toUpperCase()}</span>
                    </div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      {resource.readTime || resource.duration}
                    </div>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800 p-0">
                      Lire plus <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Voir Toutes les Ressources
              </Button>
            </div>
          </div>
        </section>

        {/* Section Astuces Rapides */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Astuces Rapides pour CV</h2>
                <p className="text-xl text-gray-600 mt-4">
                  Conseils pratiques pour améliorer immédiatement votre CV
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {quickTips.map((tip, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                        <tip.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="mt-4">{tip.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{tip.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Prêt à Accélérer Votre Carrière ?</h2>
              <p className="text-xl text-blue-100">
                Rejoignez plus de 500 000 professionnels qui ont réussi à faire progresser leur carrière avec CVCraft
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Commencer Gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    Contacter les Ventes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pied de page */}
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

export default ResourcesPage