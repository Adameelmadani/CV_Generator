"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Zap,
  CheckCircle,
  Download,
  Users,
  Star,
  ArrowRight,
  Palette,
  Bot,
  BarChart3,
  Shield,
  Smartphone,
  Cloud,
  Target,
  Sparkles,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const features = [
    {
      icon: Palette,
      title: "50+ Modèles Professionnels",
      description: "Choisissez parmi une vaste collection de modèles optimisés pour les ATS conçus par des experts en carrière",
      category: "Design",
      color: "blue",
    },
    {
      icon: Bot,
      title: "Suggestions Optimisées par IA",
      description: "Obtenez des recommandations intelligentes pour le contenu, la mise en forme et l'optimisation",
      category: "IA",
      color: "purple",
    },
    {
      icon: Target,
      title: "Optimisation ATS",
      description: "Assurez-vous que votre CV passe les systèmes de suivi des candidatures avec notre moteur d'optimisation",
      category: "Optimisation",
      color: "green",
    },
    {
      icon: Cloud,
      title: "Stockage Cloud & Synchronisation",
      description: "Accédez à vos CV de n'importe où avec synchronisation automatique dans le cloud",
      category: "Stockage",
      color: "cyan",
    },
    {
      icon: Users,
      title: "Collaboration d'Équipe",
      description: "Travaillez ensemble avec les membres de l'équipe sur la création et les revues de CV",
      category: "Collaboration",
      color: "pink",
    },
    {
      icon: Smartphone,
      title: "Responsive Mobile",
      description: "Créez et modifiez des CV sur n'importe quel appareil avec notre design responsive",
      category: "Mobile",
      color: "orange",
    },
  ]

  const benefits = [
    {
      title: "Gagnez du Temps",
      description: "Créez des CV professionnels en minutes, pas en heures",
      icon: Zap,
      stats: "5x plus rapide que les méthodes traditionnelles",
    },
    {
      title: "Augmentez votre Taux de Réussite",
      description: "Les modèles optimisés pour ATS améliorent vos chances",
      icon: Target,
      stats: "95% de taux de passage via les systèmes ATS",
    },
    {
      title: "Qualité Professionnelle",
      description: "Des modèles de qualité professionnelle qui impressionnent les recruteurs",
      icon: Star,
      stats: "Utilisé par des professionnels",
    },
    {
      title: "Toujours à Jour",
      description: "Restez à jour avec les dernières tendances CV et meilleures pratiques",
      icon: Sparkles,
      stats: "Mises à jour mensuelles des modèles",
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      indigo: "bg-indigo-100 text-indigo-600",
      cyan: "bg-cyan-100 text-cyan-600",
      pink: "bg-pink-100 text-pink-600",
      emerald: "bg-emerald-100 text-emerald-600",
      red: "bg-red-100 text-red-600",
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
            <Link href="/features" className="text-sm font-medium text-blue-600 font-semibold">
              Fonctionnalités
            </Link>
            <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
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
              <Link href="/features" className="text-base font-medium text-blue-600 py-2">Fonctionnalités</Link>
              <Link href="/templates" className="text-base font-medium text-gray-700 hover:text-blue-600 py-2">Modèles</Link>
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
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Tout ce dont vous avez besoin pour <span className="text-blue-600">vous démarquer</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Des suggestions optimisées par IA à l'optimisation ATS, CVCraft fournit tous les outils nécessaires pour créer un CV gagnant qui vous permettra d'être embauché.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/builder">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-3 py-3">
                      Essayez toutes les fonctionnalités gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white text-gray-700 border-gray-300 text-lg px-3 py-3"
                    >
                      Voir les tarifs
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Image
                    src="/img2.png?height=400&width=400"
                    alt="Tableau de bord des fonctionnalités CVCraft"
                    width={400}
                    height={400}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Ensemble Complet de Fonctionnalités</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Chaque fonctionnalité est conçue pour vous aider à créer le CV parfait et à décrocher l'emploi de vos rêves
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(feature.color)}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Pourquoi les Professionnels Choisissent CVCraft</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Des avantages réels qui font la différence dans la réussite de votre carrière
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                    <div className="text-sm font-medium text-blue-600">{benefit.stats}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Feature Spotlight */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Des Suggestions Intelligentes qui Font la Différence
                </h2>
                <p className="text-xl text-gray-600">
                  Notre IA analyse votre contenu et fournit des suggestions intelligentes d'amélioration, garantissant que votre CV se démarque auprès des systèmes ATS et des recruteurs.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Suggestions d'optimisation de contenu</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Recommandations de mots-clés</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Conseils spécifiques à l'industrie</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Retour en temps réel</span>
                  </li>
                </ul>
                <Link href="/builder">
                  <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
                    Essayer les fonctionnalités IA
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Image
                  src="/img3.png?height=400&width=400"
                  alt="Suggestions optimisées par IA"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Prêt à Découvrir Toutes les Fonctionnalités ?</h2>
              <p className="text-xl text-blue-100">
                Commencez avec notre plan gratuit et explorez toutes les fonctionnalités puissantes qui transformeront votre recherche d'emploi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Commencer Gratuitement Aujourd'hui
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    Voir Tous les Plans
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
