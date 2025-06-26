"use client"

import { useState } from "react"
import { PlanSelectionModal } from "@/components/plan-selection-modal"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Zap, Users, Star, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [showPlanModal, setShowPlanModal] = useState(false)

  const handleStartBuilding = () => {
    setShowPlanModal(true)
  }

  const handleSelectPlan = (plan: string) => {
    // Handle plan selection logic here
    console.log("Selected plan:", plan)

    // Different flows based on plan selection
    if (plan === "Start Free") {
      // Free plan - go directly to CV builder without registration
      window.location.href = "/builder"
    } else if (plan === "Create Account") {
      // Free account - redirect to signup page
      window.location.href = "/auth/signup"
    } else if (plan === "Go Premium") {
      // Premium plan - redirect to signup with premium plan
      window.location.href = "/auth/signup?plan=premium"
    }
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
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
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
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    ✨ Professional CV Builder
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Create Your Perfect <span className="text-blue-600">Professional CV</span> in Minutes
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Build stunning, ATS-friendly resumes with our AI-powered CV generator. Choose from professional
                    templates and land your dream job faster.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                    onClick={handleStartBuilding}
                  >
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white text-gray-700 border-gray-300 text-lg px-8 py-3"
                  >
                    View Templates
                  </Button>
                </div>

                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">4.9/5 from 10,000+ users</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Image
                    src="/placeholder.svg?height=600&width=400"
                    alt="Professional CV Template Preview"
                    width={400}
                    height={600}
                    className="rounded-lg"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  ATS Friendly
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Choose CVCraft?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to create a professional CV that gets you hired
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Create professional CVs in under 5 minutes with our intuitive builder
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>ATS Optimized</CardTitle>
                  <CardDescription>All templates are designed to pass Applicant Tracking Systems</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Multiple Formats</CardTitle>
                  <CardDescription>Download your CV in PDF, Word, or share with a custom link</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Professional Templates</CardTitle>
                  <CardDescription>
                    Choose from 50+ professionally designed templates for every industry
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Expert Tips</CardTitle>
                  <CardDescription>Get AI-powered suggestions and tips from HR professionals</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle>Real-time Preview</CardTitle>
                  <CardDescription>See your changes instantly with our live preview feature</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">500K+</div>
                <div className="text-gray-600">CVs Created</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-600">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-purple-600">50+</div>
                <div className="text-gray-600">Templates</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Land Your Dream Job?</h2>
              <p className="text-xl text-blue-100">
                Join thousands of professionals who have successfully created their perfect CV with CVCraft
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  onClick={handleStartBuilding}
                >
                  Start Building Your CV
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                >
                  View Sample CVs
                </Button>
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
                  <Link href="#" className="hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    CV Tips
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Career Advice
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
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
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
