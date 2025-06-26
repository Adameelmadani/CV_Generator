"use client"

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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
  const features = [
    {
      icon: Palette,
      title: "50+ Professional Templates",
      description: "Choose from a vast collection of ATS-optimized templates designed by career experts",
      category: "Design",
      color: "blue",
    },
    {
      icon: Bot,
      title: "AI-Powered Suggestions",
      description: "Get intelligent recommendations for content, formatting, and optimization",
      category: "AI",
      color: "purple",
    },
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Ensure your CV passes Applicant Tracking Systems with our optimization engine",
      category: "Optimization",
      color: "green",
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Export to PDF, Word, HTML, or share with a custom link",
      category: "Export",
      color: "orange",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track views, downloads, and engagement with detailed analytics",
      category: "Analytics",
      color: "indigo",
    },
    {
      icon: Cloud,
      title: "Cloud Storage & Sync",
      description: "Access your CVs from anywhere with automatic cloud synchronization",
      category: "Storage",
      color: "cyan",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with team members on CV creation and reviews",
      category: "Collaboration",
      color: "pink",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Create and edit CVs on any device with our responsive design",
      category: "Mobile",
      color: "emerald",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SSL encryption and GDPR compliance",
      category: "Security",
      color: "red",
    },
  ]

  const benefits = [
    {
      title: "Save Time",
      description: "Create professional CVs in minutes, not hours",
      icon: Zap,
      stats: "5x faster than traditional methods",
    },
    {
      title: "Increase Success Rate",
      description: "ATS-optimized templates improve your chances",
      icon: Target,
      stats: "95% pass rate through ATS systems",
    },
    {
      title: "Professional Quality",
      description: "Designer-quality templates that impress recruiters",
      icon: Star,
      stats: "Used by 500K+ professionals",
    },
    {
      title: "Always Updated",
      description: "Stay current with latest CV trends and best practices",
      icon: Sparkles,
      stats: "Monthly template updates",
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
            <Link href="/features" className="text-sm font-medium text-blue-600 font-semibold">
              Features
            </Link>
            <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
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
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    🚀 Powerful Features
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Everything You Need to <span className="text-blue-600">Stand Out</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    From AI-powered suggestions to ATS optimization, CVCraft provides all the tools you need to create a
                    winning CV that gets you hired.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/builder">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                      Try All Features Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white text-gray-700 border-gray-300 text-lg px-8 py-3"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <Image
                    src="/placeholder.svg?height=500&width=400"
                    alt="CVCraft Features Dashboard"
                    width={400}
                    height={500}
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Comprehensive Feature Set</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every feature is designed to help you create the perfect CV and land your dream job
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Professionals Choose CVCraft</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real benefits that make a difference in your career success
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
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  AI-Powered
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Smart Suggestions That Make a Difference
                </h2>
                <p className="text-xl text-gray-600">
                  Our AI analyzes your content and provides intelligent suggestions for improvements, ensuring your CV
                  stands out to both ATS systems and human recruiters.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Content optimization suggestions</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Keyword recommendations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Industry-specific advice</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Real-time feedback</span>
                  </li>
                </ul>
                <Link href="/builder">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Try AI Features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  alt="AI-powered suggestions"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Experience All Features?</h2>
              <p className="text-xl text-blue-100">
                Start with our free plan and explore all the powerful features that will transform your job search
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
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  >
                    View All Plans
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
