// Export all types from this module
// Note: selective re-exports to resolve naming conflicts

// lesson - exports Activity (lesson activity)
export type { LessonGeneratorInput, LessonGeneratorOutput } from './lesson'
export type { Activity as LessonActivity } from './lesson'

// syllabus, quiz, test, worksheet, curriculum
export * from './syllabus'
export * from './quiz'
export * from './test'
export * from './worksheet'
export * from './curriculum'

// library - exports MaterialType (as LibraryMaterialType to avoid clash with common.ts)
export type {
  Material,
  LibraryFilters,
  LibraryStats,
  HistoryItem,
} from './library'
export type { MaterialType as LibraryMaterialType } from './library'

// ai
export * from './ai'
export * from './aiConfig'

// admin - exports Activity (admin activity)
export type {
  AdminDashboardStats,
  SchoolListItem,
  UserListItem,
  AnalyticsData,
  BillingItem,
} from './admin'
export type { Activity as AdminActivity } from './admin'

// common - canonical MaterialType
export * from './common'

// auth, billing, school, email, notification
export * from './auth'
export * from './billing'
export * from './school'
export * from './email'
export * from './notification'
