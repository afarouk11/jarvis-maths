// localStorage keys for journey UI state that must survive a page refresh.
// Keyed by journey id so stale entries from old journeys can never collide.

export interface JourneyStorageKeys {
  studyDeadline: string
  practiceAnswered: string
  practiceTarget: string
}

export function journeyStorageKeys(journeyId: string): JourneyStorageKeys {
  return {
    studyDeadline: `studiq-journey-${journeyId}-study-deadline`,
    practiceAnswered: `studiq-journey-${journeyId}-practice-answered`,
    practiceTarget: `studiq-journey-${journeyId}-practice-target`,
  }
}

export function clearJourneyStorage(journeyId: string): void {
  const keys = journeyStorageKeys(journeyId)
  localStorage.removeItem(keys.studyDeadline)
  localStorage.removeItem(keys.practiceAnswered)
  localStorage.removeItem(keys.practiceTarget)
}
