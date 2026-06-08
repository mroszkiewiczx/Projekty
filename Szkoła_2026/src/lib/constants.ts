// ============================================================
// src/lib/constants.ts
// Application-wide constants for auth, validation, etc.
// ============================================================

// Auth Constraints
export const AUTH_CONSTRAINTS = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_SCHOOL_NAME_LENGTH: 3,
  MIN_NAME_LENGTH: 2,
  MIN_INVITE_CODE_LENGTH: 10,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// User Roles
export const USER_ROLES = {
  TEACHER: 'teacher',
  SCHOOL_ADMIN: 'school_admin',
  SUPER_ADMIN: 'super_admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Material Types
export const MATERIAL_TYPES = {
  LESSON: 'lesson',
  SYLLABUS: 'syllabus',
  QUIZ: 'quiz',
  TEST: 'test',
  WORKSHEET: 'worksheet',
  PRESENTATION: 'presentation'
} as const

export type MaterialType = typeof MATERIAL_TYPES[keyof typeof MATERIAL_TYPES]

// Material Status
export const MATERIAL_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export type MaterialStatus = typeof MATERIAL_STATUS[keyof typeof MATERIAL_STATUS]

// Education Levels
export const EDUCATION_LEVELS = {
  PODSTAWOWA: 'podstawowa',
  GIMNAZJUM: 'gimnazjum',
  LICEUM: 'liceum'
} as const

export type EducationLevel = typeof EDUCATION_LEVELS[keyof typeof EDUCATION_LEVELS]

// Sorting Options
export const SORT_OPTIONS = {
  DATE_NEWEST: 'date_newest',
  DATE_OLDEST: 'date_oldest',
  QUALITY_HIGH: 'quality_high',
  QUALITY_LOW: 'quality_low',
  TITLE_A_Z: 'title_a_z'
} as const

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS]

// Quality Score Thresholds
export const QUALITY_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  ACCEPTABLE: 40,
  POOR: 0
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10
} as const

// API Routes
export const API_ROUTES = {
  AI_PROXY: '/api/ai-proxy',
  EDGE_FUNCTIONS: '/functions/v1'
} as const

// Languages
export const LANGUAGES = {
  PL: 'pl',
  EN: 'en'
} as const

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES]

// Local Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences'
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SCHOOL_CREATED: 'School created successfully.',
  LESSON_GENERATED: 'Lesson generated successfully.',
  LESSON_PUBLISHED: 'Lesson published successfully.',
  LESSON_DELETED: 'Lesson deleted successfully.'
} as const

// Validation Rules
export const VALIDATION_RULES = {
  SCHOOL_NAME: {
    minLength: AUTH_CONSTRAINTS.MIN_SCHOOL_NAME_LENGTH,
    maxLength: 255
  },
  USER_NAME: {
    minLength: AUTH_CONSTRAINTS.MIN_NAME_LENGTH,
    maxLength: 255
  },
  PASSWORD: {
    minLength: AUTH_CONSTRAINTS.MIN_PASSWORD_LENGTH,
    maxLength: 255,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  },
  EMAIL: {
    maxLength: 255
  },
  INVITE_CODE: {
    minLength: AUTH_CONSTRAINTS.MIN_INVITE_CODE_LENGTH,
    maxLength: 255
  }
} as const
