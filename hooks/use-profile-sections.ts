"use client"

import { useMemo } from "react"
import type { Profile, SectionType } from "../types/profile"

export function useProfileSections(profile: Profile | null) {
  const sectionConfig = useMemo(() => {
    if (!profile) {
      return {
        requiredSections: [] as SectionType[],
        optionalSections: [] as SectionType[],
        allSections: [] as SectionType[],
        isRequired: (section: SectionType) => false,
        isOptional: (section: SectionType) => false,
        shouldShowSection: (section: SectionType) => true,
      }
    }

    const allSections = [...profile.requiredSections, ...profile.optionalSections]

    return {
      requiredSections: profile.requiredSections,
      optionalSections: profile.optionalSections,
      allSections,
      isRequired: (section: SectionType) => profile.requiredSections.includes(section),
      isOptional: (section: SectionType) => profile.optionalSections.includes(section),
      shouldShowSection: (section: SectionType) => allSections.includes(section),
    }
  }, [profile])

  return sectionConfig
}
