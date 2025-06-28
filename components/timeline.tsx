"use client"

import { Button } from "@/components/ui/button"

interface TimelineStep {
  id: string
  title: string
  description: string
}

interface TimelineProps {
  steps: TimelineStep[]
  currentStep: string
  onStepClick: (stepId: string) => void
  completedSteps: string[]
  skippedSteps: string[]
}

export default function Timeline({ steps, currentStep, onStepClick, completedSteps, skippedSteps }: TimelineProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  const getStepStatus = (stepId: string, index: number) => {
    if (skippedSteps.includes(stepId)) {
      return "skipped"
    }
    if (completedSteps.includes(stepId)) {
      return "completed"
    }
    if (stepId === currentStep) {
      return "current"
    }
    if (index < currentStepIndex) {
      return "completed"
    }
    return "upcoming"
  }

  const getNodeStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#28a745] border-[#28a745] text-white shadow-sm"
      case "current":
        return "bg-[rgb(37,99,235)] border-[rgb(37,99,235)] text-white shadow-lg ring-2 ring-[rgb(37,99,235)] ring-opacity-30"
      case "skipped":
        return "bg-[#ffa500] border-[#ffa500] text-white shadow-sm"
      case "upcoming":
        return "bg-white border-gray-300 text-gray-600 shadow-sm"
      default:
        return "bg-white border-gray-300 text-gray-600 shadow-sm"
    }
  }

  const getLineStyles = (index: number) => {
    if (index >= steps.length - 1) return ""

    const currentStatus = getStepStatus(steps[index].id, index)

    if (currentStatus === "completed" || currentStatus === "skipped") {
      return "bg-[#28a745]"
    }
    return "bg-gray-300"
  }

  const canNavigateToStep = (stepId: string, index: number) => {
    return (
      completedSteps.includes(stepId) ||
      skippedSteps.includes(stepId) ||
      stepId === currentStep ||
      index <= currentStepIndex
    )
  }

  return (
    <div className="w-full py-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Container principal avec ligne de base pour l'alignement */}
        <div className="relative">
          {/* Ligne de base horizontale continue */}
          <div
            className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0"
            style={{ transform: "translateY(-50%)" }}
          />

          {/* Segments colorés de la ligne */}
          {steps.map((step, index) => {
            if (index >= steps.length - 1) return null
            const status = getStepStatus(step.id, index)
            const segmentWidth = `${100 / (steps.length - 1)}%`
            const segmentLeft = `${(100 / (steps.length - 1)) * index}%`

            return (
              <div
                key={`line-${index}`}
                className={`absolute top-4 h-0.5 transition-colors duration-300 z-0 ${getLineStyles(index)}`}
                style={{
                  left: segmentLeft,
                  width: segmentWidth,
                  transform: "translateY(-50%)",
                }}
              />
            )
          })}

          {/* Conteneur des nœuds avec flexbox pour alignement parfait */}
          <div className="flex justify-between items-center relative z-10">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id, index)
              const canNavigate = canNavigateToStep(step.id, index)

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Nœud */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => canNavigate && onStepClick(step.id)}
                    disabled={!canNavigate}
                    className={`
                      w-8 h-8 rounded-full border-2 p-0 transition-all duration-300 hover:scale-105
                      ${getNodeStyles(status)}
                      ${canNavigate ? "cursor-pointer" : "cursor-not-allowed"}
                    `}
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    {status === "completed" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {status === "current" && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    {status === "skipped" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </Button>

                  {/* Titre de l'étape */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-xs font-medium transition-colors duration-300 ${
                        status === "completed"
                          ? "text-[#28a745]"
                          : status === "current"
                            ? "text-[rgb(37,99,235)]"
                            : status === "skipped"
                              ? "text-[#ffa500]"
                              : "text-gray-600"
                      }`}
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        maxWidth: "80px",
                        lineHeight: "1.2",
                      }}
                    >
                      {step.title}
                    </p>
                    {status === "skipped" && <p className="text-xs text-[#ffa500] opacity-75 mt-1">Ignoré</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
