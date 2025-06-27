"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface TokenValidationState {
  isValid: boolean | null
  isLoading: boolean
  error: string | null
}

interface PasswordStrength {
  score: number
  feedback: string[]
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [tokenValidation, setTokenValidation] = useState<TokenValidationState>({
    isValid: null,
    isLoading: true,
    error: null,
  })

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
  })

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  })

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValidation({
          isValid: false,
          isLoading: false,
          error: "No reset token provided. Please request a new password reset link.",
        })
        return
      }

      try {
        // Simulate API call to validate token
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate token validation logic
        const isValidToken = token.length > 10 // Simple validation for demo

        if (isValidToken) {
          setTokenValidation({
            isValid: true,
            isLoading: false,
            error: null,
          })
        } else {
          setTokenValidation({
            isValid: false,
            isLoading: false,
            error: "This reset link is invalid or has expired. Please request a new password reset.",
          })
        }
      } catch (error) {
        setTokenValidation({
          isValid: false,
          isLoading: false,
          error: "Unable to validate reset token. Please try again later.",
        })
      }
    }

    validateToken()
  }, [token])

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("At least 8 characters")
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("One uppercase letter")
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("One lowercase letter")
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push("One number")
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push("One special character")
    }

    return { score, feedback }
  }

  const validateForm = (): boolean => {
    const newErrors = {
      password: "",
      confirmPassword: "",
      general: "",
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return !newErrors.password && !newErrors.confirmPassword
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Update password strength for password field
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const response = await fetch('http://localhost/CV_Generator/backend/auth/reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrors({
          ...errors,
          ...data.errors,
          general: data.errors.general || 'Failed to reset password'
        });
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: 'An error occurred. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength.score <= 2) return "bg-red-500"
    if (passwordStrength.score <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (): string => {
    if (passwordStrength.score <= 2) return "Weak"
    if (passwordStrength.score <= 3) return "Medium"
    return "Strong"
  }

  // Loading state while validating token
  if (tokenValidation.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CVCraft</span>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validating Reset Link</h3>
              <p className="text-gray-600 text-center">Please wait while we verify your password reset token...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValidation.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CVCraft</span>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Invalid Reset Link</CardTitle>
              <CardDescription className="text-gray-600">{tokenValidation.error}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Reset links expire after 24 hours for security reasons.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Request New Reset Link</Button>
                </Link>

                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CVCraft</span>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
              <CardDescription>Your password has been successfully updated</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  You can now sign in with your new password. For security, you'll need to sign in on all your devices.
                </AlertDescription>
              </Alert>

              <Link href="/auth/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Continue to Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to sign in</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CVCraft</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            {email ? `Enter a new password for ${email}` : "Enter your new password below"}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Create New Password</CardTitle>
            <CardDescription className="text-center">Choose a strong password to secure your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-500" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-500">Missing: {passwordStrength.feedback.join(", ")}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || passwordStrength.score < 3}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ← Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>For your security, this reset link will expire in 24 hours and can only be used once.</p>
        </div>
      </div>
    </div>
  )
}
