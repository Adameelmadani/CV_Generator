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
      description: "Get started immediately with basic CV creation",
      features: [
        "1 basic CV template",
        "Standard PDF export",
        "Basic customization",
        "Instant access",
        "No registration required",
      ],
      limitations: ["Limited to 1 template", "CVCraft watermark included", "No advanced features", "No cloud storage"],
      buttonText: "Start Creating Now",
      buttonVariant: "default" as const,
      popular: false,
      icon: FileText,
      color: "blue",
    },
    {
      name: "Create Account",
      price: 0,
      period: "free",
      description: "Sign up for free to unlock more features and save your work",
      features: [
        "3 professional templates",
        "Cloud storage for your CVs",
        "Multiple export formats",
        "Save and edit anytime",
        "Email support",
        "No watermark",
      ],
      limitations: ["Limited to 3 CVs per month", "Basic templates only", "Standard support"],
      buttonText: "Create Free Account",
      buttonVariant: "default" as const,
      popular: true,
      icon: Users,
      color: "green",
    },
    {
      name: "Go Premium",
      price: 9.99,
      period: "month",
      description: "Unlock all premium features for professional CV creation",
      features: [
        "50+ premium templates",
        "ATS-optimized designs",
        "Cover letter builder",
        "Unlimited CV creation",
        "Advanced customization",
        "Priority support",
        "Analytics dashboard",
        "LinkedIn integration",
        "AI-powered suggestions",
      ],
      limitations: [],
      buttonText: "Go Premium Now",
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
          <DialogTitle className="text-center text-2xl font-bold mb-2">Choose How to Get Started</DialogTitle>
          <p className="text-center text-gray-600 mb-6">
            Select the option that best fits your needs and start creating your professional CV
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
                    <Badge className="bg-green-600 text-white px-3 py-1">RECOMMENDED</Badge>
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
                      <span className="text-3xl font-bold text-gray-900">Free</span>
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
                  <h4 className="font-semibold text-gray-900 text-sm">What's included:</h4>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 mt-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Limitations:</h4>
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

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            You can always upgrade your plan later.{" "}
            <button className="text-blue-600 hover:underline">Learn more</button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
