// src/hooks/useAiModules.ts
// Typy konfiguracji modulow AI

export type AiModel = string;

export interface AiModuleConfig {
  module_id:             string;
  enabled:               boolean;
  provider:              string;
  model:                 AiModel;
  model2?:               AiModel;
  image_model?:          AiModel;
  system_prompt:         string;
  user_prompt_template?: string;
  visual_brief_template?: string;
  html_prompt?:          string;
  json_prompt?:          string;
  temperature:           number;
  max_tokens:            number;
  stable_mode?:          boolean;
  auto_generate_image?:  boolean;
  fallback_threshold?:   number;
  work_mode?:            "standard" | "advanced" | "strict";
  image_type?:           string;
  image_format?:         string;
  image_position?:       string;
  image_style?:          string;
  prompt_version?:       number;
  priority_locked?:      boolean;
}

export function useAiModules(): AiModuleConfig[] {
  return [];
}
