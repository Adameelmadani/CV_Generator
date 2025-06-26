"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Check, X, Crown, Shield, Headphones, Star, ArrowRight, Users, Building, Lock } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [activeTab, setActiveTab] = useState("individual")

  const individualPlans = [
    {
      name: "Start Free",
      description: "Perfect for trying out CVCraft",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: FileText,
      badge: null,
      features: [
        "1 basic CV template",
        "Standard PDF export",
        "Basic customization",
        "Community support",
        "CVCraft watermark",
      ],
      limitations: ["Limited to 1 CV", "No ATS optimization", "No cloud storage", "Basic support only"],
      cta: "Start Free",
      popular: false,
      color: "gray",
    },
    {
      name: "Create Account",
      description: "Best for job seekers",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Users,
      badge: "Most Popular",
      features: [
        "3 professional templates",
        "Cloud storage & sync",
        "Multiple export formats",
        "Email support",
        "No watermark",
        "Save & edit anytime",
        "Mobile responsive",
      ],
      limitations: ["3 CVs per month limit", "Basic templates only", "Standard support"],
      cta: "Create Free Account",
      popular: true,
      color: "blue",
    },
    {
      name: "Go Premium",
      description: "For serious professionals",
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      icon: Crown,
      badge: "Best Value",
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
        "Custom branding",
        "Portfolio integration",
      ],
      limitations: [],
      cta: "Go Premium",
      popular: false,
      color: "purple",
    },
  ]

  const businessPlans = [
    {
      name: "Team",
      description: "For small teams & agencies",
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      icon: Users,
      badge: "Popular",
      features: [
        "Everything in Premium",
        "Up to 10 team members",
        "Team collaboration tools",
        "Centralized billing",
        "Team analytics",
        "Brand customization",
        "Admin dashboard",
        "Bulk operations",
        "Team templates library",
      ],
      limitations: [],
      cta: "Start Team Trial",
      popular: true,
      color: "green",
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 199.99,
      yearlyPrice: 1999.99,
      icon: Building,
      badge: "Custom",
      features: [
        "Everything in Team",
        "Unlimited team members",
        "Advanced security & compliance",
        "Custom integrations",
        "Dedicated support",
        "Training & onboarding",
        "SLA guarantees",
        "White-label solution",
        "API access",
        "Custom workflows",
      ],
      limitations: [],
      cta: "Contact Sales",
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
      category: "Templates & Design",
      items: [
        {
          feature: "CV Templates",
          free: "1 basic",
          account: "3 professional",
          premium: "50+ premium",
          team: "50+ premium",
          enterprise: "Unlimited custom",
        },
        {
          feature: "Cover Letter Templates",
          free: false,
          account: false,
          premium: "25+",
          team: "25+",
          enterprise: "Unlimited",
        },
        { feature: "ATS Optimization", free: false, account: false, premium: true, team: true, enterprise: true },
        {
          feature: "Custom Branding",
          free: false,
          account: false,
          premium: "Basic",
          team: "Advanced",
          enterprise: "Full white-label",
        },
      ],
    },
    {
      category: "Features & Tools",
      items: [
        {
          feature: "Export Formats",
          free: "PDF only",
          account: "PDF, Word",
          premium: "All formats",
          team: "All formats",
          enterprise: "All + custom",
        },
        {
          feature: "Cloud Storage",
          free: false,
          account: "5 CVs",
          premium: "Unlimited",
          team: "Unlimited",
          enterprise: "Unlimited",
        },
        { feature: "AI Suggestions", free: false, account: false, premium: true, team: true, enterprise: true },
        {
          feature: "Analytics Dashboard",
          free: false,
          account: false,
          premium: "Basic",
          team: "Advanced",
          enterprise: "Enterprise",
        },
      ],
    },
    {
      category: "Collaboration & Support",
      items: [
        { feature: "Team Members", free: "1", account: "1", premium: "1", team: "Up to 10", enterprise: "Unlimited" },
        {
          feature: "Support Level",
          free: "Community",
          account: "Email",
          premium: "Priority",
          team: "Priority",
          enterprise: "Dedicated",
        },
        {
          feature: "Training & Onboarding",
          free: false,
          account: false,
          premium: false,
          team: "Basic",
          enterprise: "Full",
        },
        { feature: "SLA", free: false, account: false, premium: false, team: false, enterprise: "99.9%" },
      ],
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "TechCorp",
      image: "/placeholder.svg?height=60&width=60",
      content: "CVCraft helped me land my dream job! The ATS optimization feature made all the difference.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      company: "StartupXYZ",
      image: "/placeholder.svg?height=60&width=60",
      content: "The premium templates are absolutely stunning. Worth every penny for a professional look.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "HR Director",
      company: "Global Inc",
      image: "/placeholder.svg?height=60&width=60",
      content: "We use CVCraft for our entire team. The collaboration features are game-changing.",
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "Yes, we offer a 14-day free trial for Premium, Team, and Enterprise plans. No credit card required to start your trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Absolutely. You can cancel your subscription at any time from your account settings. No cancellation fees or long-term commitments.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll provide a full refund.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Yes, we use enterprise-grade security with SSL encryption, regular security audits, and comply with GDPR and other privacy regulations.",
    },
    {
      question: "Can I export my CV to different formats?",
      answer:
        "Yes, depending on your plan, you can export to PDF, Word, HTML, and other formats. Premium plans include all export options.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes, we provide different levels of support based on your plan - from community support for free users to dedicated account managers for Enterprise customers.",
    },
  ]

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
            <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-blue-600 font-semibold">
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
                  💰 Simple, Transparent Pricing
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Choose the Perfect Plan for <span className="text-blue-600">Your Success</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  From free tools to enterprise solutions, we have the right plan to accelerate your career growth.
                  Start free and scale as you succeed.
                </p>
              </div>

              {/* Plan Type Toggle */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="individual" className="data-[state=active]:bg-white">
                    For Individuals
                  </TabsTrigger>
                  <TabsTrigger value="business" className="data-[state=active]:bg-white">
                    For Teams
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 bg-white rounded-full p-2 shadow-lg max-w-xs mx-auto">
                <span className={`text-sm font-medium ${!isYearly ? "text-blue-600" : "text-gray-500"}`}>Monthly</span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-blue-600" />
                <span className={`text-sm font-medium ${isYearly ? "text-blue-600" : "text-gray-500"}`}>Yearly</span>
                {isYearly && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    Save 17%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
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
                            <span className="text-4xl font-bold text-gray-900">Free</span>
                          ) : (
                            <>
                              <span className="text-4xl font-bold text-gray-900">
                                ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                              </span>
                              <span className="text-gray-500">/month</span>
                            </>
                          )}
                        </div>
                        {isYearly && plan.monthlyPrice > 0 && (
                          <div className="text-sm text-gray-500">
                            <span className="line-through">${plan.monthlyPrice * 12}</span>
                            <span className="text-green-600 ml-2 font-medium">
                              Save ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <Link href={plan.name === "Start Free" ? "/builder" : "/auth/signup"}>
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
                        <h4 className="font-semibold text-gray-900">What's included:</h4>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}

                        {plan.limitations.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Compare All Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See exactly what's included in each plan to make the best choice for your needs
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
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 w-1/4">Feature</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Start Free</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Create Account</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-900">Go Premium</th>
                          {activeTab === "business" && (
                            <>
                              <th className="text-center py-4 px-6 font-semibold text-gray-900">Team</th>
                              <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
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

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Trusted by Professionals Worldwide</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See what our customers say about their success with CVCraft
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
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">30-Day Money Back</h3>
                <p className="text-gray-600">Not satisfied? Get a full refund within 30 days, no questions asked.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Headphones className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">24/7 Support</h3>
                <p className="text-gray-600">Get help whenever you need it with our dedicated support team.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Enterprise Security</h3>
                <p className="text-gray-600">Bank-level security with SSL encryption and GDPR compliance.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Trusted by 500K+</h3>
                <p className="text-gray-600">
                  Join thousands of professionals who trust CVCraft for their career success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about our pricing and plans
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

        {/* Final CTA */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Accelerate Your Career?</h2>
              <p className="text-xl text-blue-100">
                Join over 500,000 professionals who have successfully advanced their careers with CVCraft
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    Contact Sales
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
