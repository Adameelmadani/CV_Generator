"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Check, X, Crown, Shield, Headphones, Star, ArrowRight, Users, Building, Lock, Menu } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [activeTab, setActiveTab] = useState("individual")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const individualPlans = [
    {
      name: "Commencer Gratuitement",
      description: "Parfait pour essayer CVCraft",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: FileText,
      badge: null,
      features: [
        "1 modèle de CV basique",
        "Export PDF standard",
        "Personnalisation basique",
        "Support communautaire",
        "Filigrane CVCraft",
      ],
      limitations: ["Limité à 1 CV", "Pas d'optimisation ATS", "Pas de stockage cloud", "Support basique uniquement"],
      cta: "Commencer Gratuitement",
      popular: false,
      color: "gray",
    },
    {
      name: "Créer un Compte",
      description: "Idéal pour les chercheurs d'emploi",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Users,
      badge: "Le Plus Populaire",
      features: [
        "3 modèles professionnels",
        "Stockage cloud & synchronisation",
        "Multiples formats d'export",
        "Support par email",
        "Pas de filigrane",
        "Sauvegarde & édition à tout moment",
        "Adapté aux mobiles",
      ],
      limitations: ["Limite de 3 CVs par mois", "Modèles basiques uniquement", "Support standard"],
      cta: "Créer un Compte Gratuit",
      popular: true,
      color: "blue",
    },
    {
      name: "Passer Premium",
      description: "Pour les professionnels sérieux",
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      icon: Crown,
      badge: "Meilleur Rapport Qualité-Prix",
      features: [
        "50+ modèles premium",
        "Designs optimisés pour ATS",
        "Générateur de lettre de motivation",
        "Création illimitée de CVs",
        "Personnalisation avancée",
        "Support prioritaire",
        "Tableau de bord analytique",
        "Intégration LinkedIn",
        "Suggestions par IA",
        "Personnalisation de la marque",
        "Intégration de portfolio",
      ],
      limitations: [],
      cta: "Passer Premium",
      popular: false,
      color: "purple",
    },
  ]

  const businessPlans = [
    {
      name: "Équipe",
      description: "Pour petites équipes & agences",
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      icon: Users,
      badge: "Populaire",
      features: [
        "Tout inclus dans Premium",
        "Jusqu'à 10 membres d'équipe",
        "Outils de collaboration d'équipe",
        "Facturation centralisée",
        "Analytiques d'équipe",
        "Personnalisation de marque",
        "Tableau de bord admin",
        "Opérations en masse",
        "Bibliothèque de modèles d'équipe",
      ],
      limitations: [],
      cta: "Essai Équipe Gratuit",
      popular: true,
      color: "green",
    },
    {
      name: "Entreprise",
      description: "Pour grandes organisations",
      monthlyPrice: 199.99,
      yearlyPrice: 1999.99,
      icon: Building,
      badge: "Personnalisé",
      features: [
        "Tout inclus dans Équipe",
        "Membres d'équipe illimités",
        "Sécurité & conformité avancées",
        "Intégrations personnalisées",
        "Support dédié",
        "Formation & intégration",
        "Garanties SLA",
        "Solution white-label",
        "Accès API",
        "Workflows personnalisés",
      ],
      limitations: [],
      cta: "Contacter les Ventes",
      popular: false,
      color: "indigo",
    },
  ]

  const plans = activeTab === "individual" ? individualPlans : businessPlans

  const getColorClasses = (color: string) => {
    const colorMap = {
      gray: "border-gray-300 hover:border-gray-400",
      blue: "border-blue-500 bg-blue-50 shadow-blue-100",
      purple: "border-purple-500 hover:border-purple-600",
      green: "border-green-500 bg-green-50 shadow-green-100",
      indigo: "border-indigo-500 hover:border-indigo-600",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const features = [
    {
      category: "Modèles & Design",
      items: [
        {
          feature: "Modèles de CV",
          free: "1 basique",
          account: "3 professionnels",
          premium: "50+ premium",
          team: "50+ premium",
          enterprise: "Illimités personnalisés",
        },
        {
          feature: "Modèles de lettre de motivation",
          free: false,
          account: false,
          premium: "25+",
          team: "25+",
          enterprise: "Illimités",
        },
        { feature: "Optimisation ATS", free: false, account: false, premium: true, team: true, enterprise: true },
        {
          feature: "Personnalisation de marque",
          free: false,
          account: false,
          premium: "Basique",
          team: "Avancée",
          enterprise: "White-label complet",
        },
      ],
    },
    {
      category: "Fonctionnalités & Outils",
      items: [
        {
          feature: "Formats d'export",
          free: "PDF uniquement",
          account: "PDF, Word",
          premium: "Tous formats",
          team: "Tous formats",
          enterprise: "Tous + personnalisés",
        },
        {
          feature: "Stockage cloud",
          free: false,
          account: "5 CVs",
          premium: "Illimité",
          team: "Illimité",
          enterprise: "Illimité",
        },
        { feature: "Suggestions IA", free: false, account: false, premium: true, team: true, enterprise: true },
        {
          feature: "Tableau de bord analytique",
          free: false,
          account: false,
          premium: "Basique",
          team: "Avancé",
          enterprise: "Entreprise",
        },
      ],
    },
    {
      category: "Collaboration & Support",
      items: [
        { feature: "Membres d'équipe", free: "1", account: "1", premium: "1", team: "Jusqu'à 10", enterprise: "Illimités" },
        {
          feature: "Niveau de support",
          free: "Communauté",
          account: "Email",
          premium: "Prioritaire",
          team: "Prioritaire",
          enterprise: "Dédié",
        },
        {
          feature: "Formation & Intégration",
          free: false,
          account: false,
          premium: false,
          team: "Basique",
          enterprise: "Complète",
        },
        { feature: "SLA", free: false, account: false, premium: false, team: false, enterprise: "99.9%" },
      ],
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Responsable Marketing",
      company: "TechCorp",
      image: "/review_img1.jpg?height=60&width=60",
      content: "CVCraft m'a aidé à décrocher mon emploi de rêve ! La fonction d'optimisation ATS a fait toute la différence.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Ingénieur Logiciel",
      company: "StartupXYZ",
      image: "/review_img2.jpg?height=60&width=60",
      content: "Les modèles premium sont absolument magnifiques. Ça vaut chaque centime pour un look professionnel.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Directrice RH",
      company: "Global Inc",
      image: "/review_img3.jpg?height=60&width=60",
      content: "Nous utilisons CVCraft pour toute notre équipe. Les fonctionnalités de collaboration changent la donne.",
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer:
        "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements seront effectifs à votre prochain cycle de facturation, et nous ajusterons le prix au prorata.",
    },
    {
      question: "Y a-t-il un essai gratuit pour les plans payants ?",
      answer:
        "Oui, nous proposons un essai gratuit de 14 jours pour les plans Premium, Équipe et Entreprise. Aucune carte bancaire requise pour commencer votre essai.",
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer:
        "Nous acceptons toutes les cartes bancaires (Visa, MasterCard, American Express), PayPal, et virements bancaires pour les clients Entreprise.",
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer:
        "Absolument. Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte. Pas de frais d'annulation ni d'engagement à long terme.",
    },
    {
      question: "Proposez-vous des remboursements ?",
      answer:
        "Oui, nous offrons une garantie satisfait ou remboursé de 30 jours pour tous les plans payants. Si vous n'êtes pas satisfait, nous vous rembourserons intégralement.",
    },
    {
      question: "Mes données sont-elles sécurisées et privées ?",
      answer:
        "Oui, nous utilisons une sécurité de niveau entreprise avec chiffrement SSL, audits de sécurité réguliers, et nous respectons le RGPD et autres réglementations.",
    },
    {
      question: "Puis-je exporter mon CV vers différents formats ?",
      answer:
        "Oui, selon votre plan, vous pouvez exporter en PDF, Word, HTML et autres formats. Les plans Premium incluent toutes les options d'export.",
    },
    {
      question: "Proposez-vous un support client ?",
      answer:
        "Oui, nous fournissons différents niveaux de support selon votre plan - du support communautaire pour les utilisateurs gratuits aux gestionnaires de compte dédiés pour les clients Entreprise.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* En-tête */}
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
            <Link href="/pricing" className="text-sm font-medium text-blue-600 font-semibold">
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
              <Link href="/pricing" className="text-base font-medium text-blue-600 py-2">Tarifs</Link>
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
        {/* Section Hero */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Choisissez le Plan Parfait pour <span className="text-blue-600">Votre Succès</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Des outils gratuits aux solutions professionnelles, nous avons le bon plan pour accélérer votre croissance professionnelle.
                  Commencez gratuitement et évoluez avec votre succès.
                </p>
              </div>

              {/* Sélecteur de type de plan */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="individual" className="data-[state=active]:bg-white">
                    Pour Particuliers
                  </TabsTrigger>
                  <TabsTrigger value="business" className="data-[state=active]:bg-white">
                    Pour Équipes
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sélecteur de facturation */}
              <div className="flex items-center justify-center space-x-4 bg-white rounded-full p-2 shadow-lg max-w-xs mx-auto">
                <span className={`text-sm font-medium ${!isYearly ? "text-blue-600" : "text-gray-500"}`}>Mensuel</span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-blue-600" />
                <span className={`text-sm font-medium ${isYearly ? "text-blue-600" : "text-gray-500"}`}>Annuel</span>
                {isYearly && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    Économisez 17%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Cartes de tarification */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className={`grid gap-8 max-w-7xl mx-auto ${plans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
              {plans.map((plan) => {
                const Icon = plan.icon
                return (
                  <Card
                    key={plan.name}
                    className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                      plan.popular ? getColorClasses(plan.color) : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white px-4 py-1">{plan.badge}</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            plan.color === "blue"
                              ? "bg-blue-100"
                              : plan.color === "purple"
                                ? "bg-purple-100"
                                : plan.color === "green"
                                  ? "bg-green-100"
                                  : plan.color === "indigo"
                                    ? "bg-indigo-100"
                                    : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`h-8 w-8 ${
                              plan.color === "blue"
                                ? "text-blue-600"
                                : plan.color === "purple"
                                  ? "text-purple-600"
                                  : plan.color === "green"
                                    ? "text-green-600"
                                    : plan.color === "indigo"
                                      ? "text-indigo-600"
                                      : "text-gray-600"
                            }`}
                          />
                        </div>
                      </div>

                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-600">{plan.description}</CardDescription>

                      <div className="space-y-2 mt-4">
                        <div className="flex items-baseline justify-center space-x-2">
                          {plan.monthlyPrice === 0 ? (
                            <span className="text-4xl font-bold text-gray-900">Gratuit</span>
                          ) : (
                            <>
                              <span className="text-4xl font-bold text-gray-900">
                                ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                              </span>
                              <span className="text-gray-500">/mois</span>
                            </>
                          )}
                        </div>
                        {isYearly && plan.monthlyPrice > 0 && (
                          <div className="text-sm text-gray-500">
                            <span className="line-through">${plan.monthlyPrice * 12}</span>
                            <span className="text-green-600 ml-2 font-medium">
                              Économisez ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <Link href={plan.name === "Commencer Gratuitement" ? "/builder" : "/auth/signup"}>
                        <Button
                          className={`w-full ${
                            plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                          }`}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Ce qui est inclus :</h4>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}

                        {plan.limitations.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Limitations :</h4>
                            {plan.limitations.map((limitation, index) => (
                              <div key={index} className="flex items-start space-x-3 mb-2">
                                <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-500">{limitation}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tableau comparatif */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Comparez Toutes les Fonctionnalités</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Voyez exactement ce qui est inclus dans chaque plan pour faire le meilleur choix selon vos besoins
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                {features.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="bg-gray-100 px-6 py-3">
                      <h3 className="font-semibold text-gray-900">{category.category}</h3>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 w-1/4">Fonctionnalité</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Commencer Gratuitement</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Créer un Compte</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Passer Premium</th>
                          {activeTab === "business" && (
                            <>
                              <th className="text-center py-4 px-6 font-semibold text-gray-900">Équipe</th>
                              <th className="text-center py-4 px-6 font-semibold text-gray-900">Entreprise</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {category.items.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                            <td className="py-4 px-6 text-center">
                              {typeof row.free === "boolean" ? (
                                row.free ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-700">{row.free}</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {typeof row.account === "boolean" ? (
                                row.account ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-700">{row.account}</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {typeof row.premium === "boolean" ? (
                                row.premium ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-700">{row.premium}</span>
                              )}
                            </td>
                            {activeTab === "business" && (
                              <>
                                <td className="py-4 px-6 text-center">
                                  {typeof row.team === "boolean" ? (
                                    row.team ? (
                                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                                    ) : (
                                      <X className="h-5 w-5 text-gray-400 mx-auto" />
                                    )
                                  ) : (
                                    <span className="text-gray-700">{row.team}</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  {typeof row.enterprise === "boolean" ? (
                                    row.enterprise ? (
                                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                                    ) : (
                                      <X className="h-5 w-5 text-gray-400 mx-auto" />
                                    )
                                  ) : (
                                    <span className="text-gray-700">{row.enterprise}</span>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Recommandé par des Professionnels du Monde Entier</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez ce que nos clients disent de leur succès avec CVCraft
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role} chez {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Signaux de confiance */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Remboursement 30 Jours</h3>
                <p className="text-gray-600">Pas satisfait ? Remboursement intégral sous 30 jours, sans questions.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Headphones className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Support 24/7</h3>
                <p className="text-gray-600">Obtenez de l'aide quand vous en avez besoin avec notre équipe dédiée.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sécurité Entreprise</h3>
                <p className="text-gray-600">Sécurité bancaire avec chiffrement SSL et conformité RGPD.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Utilisé par 500K+</h3>
                <p className="text-gray-600">
                  Rejoignez des milliers de professionnels qui font confiance à CVCraft pour leur succès professionnel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Questions Fréquentes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur nos tarifs et plans
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
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