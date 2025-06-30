"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, Building } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<"user" | "enterprise" | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    marketingEmails: true,
  })

  // Fix the type of passwordStrength
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({
    score: 0,
    feedback: [],
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get("plan")

  const checkPasswordStrength = (password: string) => {
    let score = 0
    const feedback = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("Au moins 8 caractères")
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Une lettre majuscule")
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("Une lettre minuscule")
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push("Un chiffre")
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("Un caractère spécial")
    }

    setPasswordStrength({ score, feedback })
  }

  const getPlanDisplayName = (plan: string | null) => {
    if (!plan) return null

    const planMap: { [key: string]: string } = {
      free: "Gratuit",
      "cvcraft-plus": "CVCraft Plus",
      pro: "Pro",
      team: "Équipe",
      enterprise: "Entreprise",
    }

    return planMap[plan] || plan
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Les mots de passe ne correspondent pas" });
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: "Veuillez accepter les conditions d’utilisation" });
      return;
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost/CV_Generator/backend/auth/signup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedPlan,
          accountType
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirect;
      } else {
        setErrors(data.errors);
      }
    } catch (error) {
      setErrors({
        general: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (name === "password") {
      checkPasswordStrength(value)
    }
  }

  const handleSocialSignUp = (provider: string) => {
    console.log(`Inscription avec ${provider}`)
    // Gérer l'inscription sociale - redirection vers la page d'accueil après inscription réussie
    setTimeout(() => {
      const redirectUrl = selectedPlan
        ? `/?signup=success&plan=${selectedPlan}&user=new&type=${accountType}&provider=${provider}`
        : `/?signup=success&user=new&type=${accountType}&provider=${provider}`

      window.location.href = redirectUrl
    }, 1000)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500"
    if (passwordStrength.score <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Faible"
    if (passwordStrength.score <= 3) return "Moyenne"
    return "Forte"
  }

  // Étape de sélection du type de compte
  if (!accountType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* En-tête */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Retour à l'accueil</span>
            </Link>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CVCraft</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre type de compte</h1>
            <p className="text-gray-600">Sélectionnez l'option qui correspond le mieux à vos besoins</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Compte Individuel */}
            <Card
              className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              onClick={() => setAccountType("user")}
            >
              <CardHeader className="text-center pb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Utilisateur individuel</CardTitle>
                <CardDescription>Parfait pour les chercheurs d’emploi et les professionnels</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Création de CV personnelle</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Modèles professionnels</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Suggestions alimentées par l’IA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Stockage cloud</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Exportation multi-formats</span>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">Continuer en tant qu’individu</Button>
              </CardContent>
            </Card>

            {/* Compte Entreprise */}
            <Card
              className="cursor-pointer border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-300"
              onClick={() => setAccountType("enterprise")}
            >
              <CardHeader className="text-center pb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Entreprise</CardTitle>
                <CardDescription>Pour les équipes, agences et organisations</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Collaboration en équipe</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Création de CV en masse</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Comptes RH, Manager...</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Tableau de bord administrateur</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Support prioritaire</span>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">Continuer en tant qu’entreprise</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <button
            onClick={() => setAccountType(null)}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Retour au type de compte</span>
          </button>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CVCraft</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créez votre compte</h1>
          <p className="text-gray-600">
            {accountType === "enterprise"
              ? "Configurez votre compte entreprise"
              : "Commencez à créer des CV professionnels en quelques minutes"}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              {accountType === "enterprise" ? "Inscription entreprise" : "Inscription"}
            </CardTitle>
            <CardDescription className="text-center">
              {accountType === "enterprise"
                ? "Créez votre compte entreprise pour gérer votre équipe"
                : "Rejoignez des milliers de professionnels qui font confiance à CVCraft"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {selectedPlan && selectedPlan !== "free" ? (
              <div className="text-center">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  <Check className="h-4 w-4 mr-2" />
                  Plan sélectionné : {getPlanDisplayName(selectedPlan)}
                </Badge>
              </div>
            ) : (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Check className="h-4 w-4 mr-2" />
                  {accountType === "enterprise" ? "Plan entreprise" : "Commencez avec le plan gratuit - Carte bancaire non requise"}
                </Badge>
              </div>
            )}

            {/* Boutons d'inscription sociale */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-11" onClick={() => handleSocialSignUp("google")}>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <Button variant="outline" className="w-full h-11" onClick={() => handleSocialSignUp("github")}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.64.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.02a9.6 9.6 0 012.5-.34 9.58 9.58 0 012.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.41.2 2.45.1 2.71.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85 0 1.33-.01 2.41-.01 2.74 0 .27.16.58.67.48A10.003 10.003 0 0022 12c0-5.52-4.48-10-10-10z"
                  />
                </svg>
                Continuer avec GitHub
              </Button>
            </div>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Votre nom"
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="exemple@mail.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Entrez un mot de passe sécurisé"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`h-2 flex-1 rounded ${getPasswordStrengthColor()}`}></div>
                    <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                      {passwordStrength.feedback.map((fb, i) => (
                        <li key={i}>{fb}</li>
                      ))}
                    </ul>
                  )}
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirmez votre mot de passe"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    J’accepte les{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Conditions d’utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Politique de confidentialité
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-red-600 text-sm mt-1">{errors.agreeToTerms}</p>}

                <div className="flex items-center space-x-2">
                  <input
                    id="marketingEmails"
                    name="marketingEmails"
                    type="checkbox"
                    checked={formData.marketingEmails}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="marketingEmails" className="text-sm">
                    Je souhaite recevoir des e-mails marketing (optionnel)
                  </Label>
                </div>

                {errors.general && <p className="text-red-600 text-center text-sm">{errors.general}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Inscription en cours..." : "Créer mon compte"}
                </Button>
              </div>
            </form>

            <p className="text-sm text-center text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
