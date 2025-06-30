"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Crown, FileText, Users } from "lucide-react"

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: string) => void
}

export function PlanSelectionModal({ isOpen, onClose, onSelectPlan }: PlanSelectionModalProps) {
  const plans = [
    {
      name: "Start Free",
      price: 0,
      period: "forever",
      description: "Commencez immédiatement avec la création de CV de base",
      features: [
        "1 modèle de CV basique",
        "Exportation PDF standard",
        "Personnalisation de base",
        "Accès instantané",
        "Aucune inscription requise",
      ],
      limitations: [
        "Limité à 1 modèle",
        "Pas de fonctionnalités avancées",
        "Pas de stockage cloud",
      ],
      buttonText: "Commencer maintenant",
      buttonVariant: "default" as const,
      popular: false,
      icon: FileText,
      color: "blue",
    },
    {
      name: "Create Account",
      price: 0,
      period: "free",
      description: "Inscrivez-vous gratuitement pour débloquer plus de fonctionnalités et enregistrer votre travail",
      features: [
        "3 modèles professionnels",
        "Stockage cloud pour vos CV",
        "Multiples formats d’exportation",
        "Enregistrement et édition à tout moment",
      ],
      limitations: [
        "Limité à 3 CV par mois",
        "Modèles de base uniquement",
      ],
      buttonText: "Créer un compte gratuit",
      buttonVariant: "default" as const,
      popular: true,
      icon: Users,
      color: "green",
    },
    {
      name: "Go Premium",
      price: 9.99,
      period: "mois",
      description: "Débloquez toutes les fonctionnalités premium pour créer un CV professionnel",
      features: [
        "50+ modèles premium",
        "Designs optimisés ATS",
        "Création de CV illimitée",
        "Personnalisation avancée",
        "Assistance prioritaire",
        "Suggestions alimentées par l’IA",
      ],
      limitations: [],
      buttonText: "Passer en Premium",
      buttonVariant: "default" as const,
      popular: false,
      icon: Crown,
      color: "purple",
    },
  ]

  const handleSelectPlan = (planName: string) => {
    onSelectPlan(planName)
    onClose()
  }

  const getColorClasses = (color: string, popular: boolean) => {
    const colorMap = {
      blue: {
        border: popular ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300",
        icon: "bg-blue-100 text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      green: {
        border: popular ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300",
        icon: "bg-green-100 text-green-600",
        button: "bg-green-600 hover:bg-green-700",
      },
      purple: {
        border: popular ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300",
        icon: "bg-purple-100 text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2">Choisissez comment commencer</DialogTitle>
          <p className="text-center text-gray-600 mb-6">
            Sélectionnez l’option qui correspond le mieux à vos besoins et commencez à créer votre CV professionnel
          </p>
        </DialogHeader>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            const colors = getColorClasses(plan.color, plan.popular)

            return (
              <div
                key={plan.name}
                className={`relative border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${colors.border}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 py-1">RECOMMANDÉ</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colors.icon}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  <div className="mb-3">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600 ml-1">/{plan.period}</span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full text-white ${colors.button}`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Ce qui est inclus :</h4>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 mt-4">
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
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
