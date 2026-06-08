// AI types

export interface AiPrompt {
  id: string
  name: string
  type: string // generate_lesson, shorten_lesson, simplify, etc
  version: number
  content: string
  variables: string[]
  status: 'draft' | 'active' | 'archived'
  workspace_id?: string // null = global
  created_by: string
  created_at: string
  updated_at: string
}

export interface AiUsageLog {
  id: string
  workspace_id: string
  user_id: string
  action: string // lesson_generation, quiz_generation, evaluation
  module: string // lessongen, quizgen, evaluator
  model: string // claude-sonnet-4-6, gpt-4o, gemini-2.5
  provider: string // anthropic, openai, google
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  approximate_cost: number
  status: 'success' | 'error'
  error_message?: string
  response_time_ms?: number
  created_at: string
}

export interface AiModel {
  id: string
  provider: string // anthropic, openai, google
  model_name: string
  display_name: string
  is_available: boolean
  workspace_id?: string // null = global
  created_at: string
}

export interface AiCallRequest {
  workspace_id: string
  provider: 'anthropic' | 'openai' | 'gemini'
  module_key: string // lessongen, syllabusgen, etc
  prompt: string
  system?: string
  model: string
  max_tokens?: number
}

export interface AiCallResponse {
  text: string
  model: string
  usage: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
  stop_reason?: string
}

export interface QualityScore {
  overall_score: number // 0-100
  dimensions: Record<string, number> // dimension_name: score
  feedback: string
  warnings?: string[]
}
