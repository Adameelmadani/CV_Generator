"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Book, BookOpen, FileText, Lightbulb, Newspaper, PlayCircle, Search, UserCheck, Video } from "lucide-react"
import Image from "next/image"

function ResourcesPage() {
  const resources = [
    {
      id: 1,
      title: "The Ultimate CV Writing Guide",
      type: "guide",
      category: "Writing",
      description: "Comprehensive guide to writing an effective CV that stands out",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "15 min read",
      icon: Book,
      color: "blue",
    },
    {
      id: 2,
      title: "ATS-Friendly CV Templates",
      type: "article",
      category: "Templates",
      description: "How to ensure your CV passes applicant tracking systems",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "8 min read",
      icon: FileText,
      color: "green",
    },
    {
      id: 3,
      title: "Cover Letter Masterclass",
      type: "video",
      category: "Writing",
      description: "Learn how to write compelling cover letters that get responses",
      image: "/placeholder.svg?height=400&width=300",
      duration: "22 minutes",
      icon: Video,
      color: "purple",
    },
    {
      id: 4,
      title: "Interview Preparation Toolkit",
      type: "guide",
      category: "Interviews",
      description: "Prepare for common interview questions with this comprehensive guide",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "25 min read",
      icon: UserCheck,
      color: "orange",
    },
    {
      id: 5,
      title: "2023 Job Market Trends",
      type: "report",
      category: "Job Market",
      description: "Latest insights on hiring trends across different industries",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "12 min read",
      icon: Newspaper,
      color: "indigo",
    },
    {
      id: 6,
      title: "Career Change: Step-by-Step",
      type: "guide",
      category: "Career",
      description: "How to successfully transition to a new career path",
      image: "/placeholder.svg?height=400&width=300",
      readTime: "18 min read",
      icon: BookOpen,
      color: "pink",
    },
  ]

  const quickTips = [
    {
      title: "Tailor Your CV",
      description: "Always customize your CV for each job application",
      icon: Lightbulb,
    },
    {
      title: "Quantify Achievements",
      description: "Include specific numbers and metrics to showcase impact",
      icon: Search,
    },
    {
      title: "Keep It Concise",
      description: "Limit your CV to 1-2 pages with focused content",
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
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">CVCraft</span>
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
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/resources" className="text-sm font-medium text-blue-600 font-semibold">
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
                  📚 Free CV Resources
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Boost Your Career with Our <span className="text-blue-600">Expert Resources</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Comprehensive guides, templates, and career advice to help you land your dream job and advance your professional journey.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  Browse Resources
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/builder">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white text-gray-700 border-gray-300 text-lg px-8 py-3"
                  >
                    Build Your CV Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">CV & Career Resources</h2>
              <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
                Explore our collection of expert-crafted resources to help you at every stage of your career journey
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
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                View All Resources
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Quick CV Tips</h2>
                <p className="text-xl text-gray-600 mt-4">
                  Actionable advice to improve your CV immediately
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

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Ready to Create Your Professional CV?</h2>
              <p className="text-lg text-blue-100">
                Put these resources into action and build a stunning CV that gets you noticed
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Start Building Your CV
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-blue-700">
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Based on your other pages */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookies Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 CVCraft. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ResourcesPage