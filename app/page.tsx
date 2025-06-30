"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PlanSelectionModal } from "@/components/plan-selection-modal"
import { WelcomeModal } from "@/components/welcome-modal"
import { CVChoiceModal } from "@/components/cv-choice-modal"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Zap, Users, Star, CheckCircle, ArrowRight, User, ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showCVChoiceModal, setShowCVChoiceModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com" })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    const loginSuccess = searchParams.get("login")
    const signupSuccess = searchParams.get("signup")
    const userType = searchParams.get("user")
    const accountType = searchParams.get("type")
    const selectedPlan = searchParams.get("plan")

    if (loginSuccess === "success" || signupSuccess === "success") {
      setIsAuthenticated(true)

      if (signupSuccess === "success") {
        setTimeout(() => {
          setShowWelcomeModal(true)
        }, 500)
      } else if (loginSuccess === "success" && userType === "returning") {
        setTimeout(() => {
          setShowWelcomeModal(true)
        }, 500)
      }

      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [searchParams])

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      setShowCVChoiceModal(true)
    } else {
      setShowPlanModal(true)
    }
  }

  const handleSelectPlan = (plan: string) => {
    console.log("Selected plan:", plan)

    if (plan === "Start Free") {
      setShowPlanModal(false)
      setTimeout(() => {
        setShowCVChoiceModal(true)
      }, 300)
    } else if (plan === "Create Account") {
      window.location.href = "/auth/signup"
    } else if (plan === "Go Premium") {
      window.location.href = "/auth/signup?plan=premium"
    }
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setUser({ name: "", email: "" })
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
            <Link href="/" className="text-sm font-medium text-blue-600 font-semibold">
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
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Créez votre <span className="text-blue-600">CV professionnel</span> en quelques minutes
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Créez et partagez votre CV en quelques clics. Notre plateforme permet aux recruteurs de découvrir votre profil et de vous contacter directement, simplifiant votre recherche d'emploi.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                    onClick={handleStartBuilding}
                  >
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white text-gray-700 border-gray-300 text-lg px-8 py-3"
                  >
                    Voir les modèles
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Image
                    src="/img1.png?height=400&width=400"
                    alt="Aperçu du modèle de CV"
                    width={400}
                    height={400}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Pourquoi choisir CVCraft ?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour créer un CV professionnel qui vous décroche un job
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Ultra rapide</CardTitle>
                  <CardDescription>
                    Créez un CV professionnel en moins de 5 minutes avec notre éditeur intuitif
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Optimisé ATS</CardTitle>
                  <CardDescription>Tous les modèles passent les systèmes de suivi de candidature</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Formats multiples</CardTitle>
                  <CardDescription>Téléchargez votre CV en PDF, XML ou LATEX</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Modèles pro</CardTitle>
                  <CardDescription>
                    Plus de 50 modèles professionnels pour tous les secteurs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Conseils d’experts</CardTitle>
                  <CardDescription>Suggestions IA et conseils de recruteurs professionnels</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle>Aperçu en temps réel</CardTitle>
                  <CardDescription>Visualisez vos modifications instantanément</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Sections stats, CTA et footer sont inchangées, veux-tu que je les traduise aussi maintenant ? */}
      </main>

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

      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user.name.split(" ")[0]}
      />

      <CVChoiceModal isOpen={showCVChoiceModal} onClose={() => setShowCVChoiceModal(false)} />
    </div>
  );
}
