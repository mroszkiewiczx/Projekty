import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAvailableProviders } from '@/hooks/useAvailableProviders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ModelSelector, type SelectedModel } from '@/components/ModelSelector';
import { resolveModel } from '@/modules/settings/resolveModel';
import { downloadPdf } from '@/lib/exporters/pdfExporter';
import type { PdfDocSpec } from '@/lib/exporters/pdfExporter';
import { downloadLessonDocx } from '@/lib/exporters/lessonDocxExporter';
import type { AiProvider } from '@/services/aiService';
import {
  listEducationLevels,
  listGrades,
  listSubjects,
  matchRequirements,
  analyzeTopic,
  type EducationLevel,
  type Grade,
  type Subject,
  type CurriculumRequirement,
  type TopicAnalysis,
} from '../curriculumService';
import { generateCurriculumLesson, saveCurriculumLesson } from '../lessonService';
import type { CurriculumLessonContent } from '../schemas';
import {
  LESSON_TYPES,
  DURATION_OPTIONS,
  DIFFICULTY_OPTIONS,
  DEBOUNCE_TOPIC_MS,
  MATCH_REQUIREMENTS_LIMIT,
} from '../constants';
import { CurriculumLessonView } from '../CurriculumLessonView';

// ---------------------------------------------------------------------------
// Typy lokalne
// ---------------------------------------------------------------------------

interface FormState {
  topic: string;
  educationLevelId: string;
  gradeId: string;
  subjectId: string;
  lessonType: string;
  durationMinutes: number;
  difficulty: string;
  objectives: string;
  provider: AiProvider | '';
  customDuration: number;
  useCustomDuration: boolean;
  /** Nadpisanie modelu na czas tego generowania (null = defaultowy z resolveModel) */
  overrideModel: SelectedModel | null;
}

const DEFAULT_FORM: FormState = {
  topic: '',
  educationLevelId: '',
  gradeId: '',
  subjectId: '',
  lessonType: 'wprowadzajaca',
  durationMinutes: 45,
  difficulty: 'sredni',
  objectives: '',
  provider: '',
  customDuration: 45,
  useCustomDuration: false,
  overrideModel: null,
};

// ---------------------------------------------------------------------------
// Pomocnicze komponenty
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold text-white">
      {children}
    </h2>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-300">
      {children}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  disabled,
  children,
}: {
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="field w-full appearance-none pr-8 disabled:opacity-50"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Główna strona LessonGen 2.0
// ---------------------------------------------------------------------------

export function LessonGenPage() {
  const { t, i18n } = useTranslation();
  const { activeWorkspace } = useWorkspace();
  const { providers, loading: loadingProviders } = useAvailableProviders();

  // Stan formularza
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // Listy referencyjne
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Analiza tematu
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wymagania podstawy programowej
  const [requirements, setRequirements] = useState<CurriculumRequirement[]>([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());
  const [reqError, setReqError] = useState<string | null>(null);

  // Generowanie lekcji
  const [generating, setGenerating] = useState(false);
  const [lesson, setLesson] = useState<CurriculumLessonContent | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Domyślny model z resolveModel (loaded asynchronicznie)
  const [defaultModel, setDefaultModel] = useState<SelectedModel | undefined>(undefined);

  useEffect(() => {
    if (!activeWorkspace) return;
    resolveModel(activeWorkspace.id, 'lessongen')
      .then(setDefaultModel)
      .catch(() => {
        /* fallback — brak konfiguracji */
      });
  }, [activeWorkspace]);

  // Obliczone wartości
  const effectiveModel: SelectedModel | undefined = form.overrideModel ?? defaultModel;
  const effectiveProvider = (
    effectiveModel?.provider || form.provider || providers[0]
  ) as AiProvider | undefined;
  const effectiveDuration = form.useCustomDuration ? form.customDuration : form.durationMinutes;

  // ---------------------------------------------------------------------------
  // Inicjalizacja list referencyjnych
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setLoadingLevels(true);
    listEducationLevels()
      .then(setLevels)
      .catch(() => setLevels([]))
      .finally(() => setLoadingLevels(false));
  }, []);

  useEffect(() => {
    if (!form.educationLevelId) {
      setGrades([]);
      setSubjects([]);
      setForm((prev) => ({ ...prev, gradeId: '', subjectId: '' }));
      return;
    }
    setLoadingGrades(true);
    setLoadingSubjects(true);
    setForm((prev) => ({ ...prev, gradeId: '', subjectId: '' }));
    setGrades([]);
    setSubjects([]);

    listGrades(form.educationLevelId)
      .then(setGrades)
      .catch(() => setGrades([]))
      .finally(() => setLoadingGrades(false));

    listSubjects(form.educationLevelId)
      .then(setSubjects)
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.educationLevelId]);

  // ---------------------------------------------------------------------------
  // Debounce analizy tematu
  // ---------------------------------------------------------------------------

  const runAnalysis = useCallback(
    (topic: string) => {
      if (topic.length < 3 || !effectiveProvider || !activeWorkspace) return;
      setAnalyzing(true);
      setAnalysisError(null);
      analyzeTopic(topic, activeWorkspace.id, effectiveProvider)
        .then((result) => {
          setAnalysis(result);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : t('common.error');
          setAnalysisError(msg.startsWith('lessongen.') ? t(msg) : msg);
        })
        .finally(() => setAnalyzing(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProvider, activeWorkspace],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (form.topic.length >= 3) {
      debounceRef.current = setTimeout(() => {
        runAnalysis(form.topic);
      }, DEBOUNCE_TOPIC_MS);
    } else {
      setAnalysis(null);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.topic]);

  // ---------------------------------------------------------------------------
  // Wyszukiwanie wymagań podstawy programowej
  // ---------------------------------------------------------------------------

  const handleMatchRequirements = useCallback(async () => {
    if (!form.topic) return;

    const levelSlug = levels.find((l) => l.id === form.educationLevelId)?.slug ?? '';
    const gradeValue = grades.find((g) => g.id === form.gradeId)?.numeric_value ?? 0;
    const subjectSlug = subjects.find((s) => s.id === form.subjectId)?.slug ?? '';

    setLoadingReq(true);
    setReqError(null);
    setRequirements([]);
    setSelectedReqIds(new Set());

    try {
      const results = await matchRequirements(
        form.topic,
        subjectSlug,
        levelSlug,
        gradeValue,
        MATCH_REQUIREMENTS_LIMIT,
      );
      setRequirements(results);
      // Domyślnie zaznacz wszystkie
      setSelectedReqIds(new Set(results.map((r) => r.id)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error');
      setReqError(msg);
    } finally {
      setLoadingReq(false);
    }
  }, [form.topic, form.educationLevelId, form.gradeId, form.subjectId, levels, grades, subjects, t]);

  // ---------------------------------------------------------------------------
  // Zmiana pola formularza
  // ---------------------------------------------------------------------------

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleReqSelection(id: string) {
    setSelectedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Generowanie lekcji
  // ---------------------------------------------------------------------------

  async function handleGenerate() {
    if (!activeWorkspace || !effectiveProvider) {
      setGenError(t('lessongen.errors.noProvider'));
      return;
    }
    if (!form.topic || form.topic.length < 3) {
      setGenError(t('lessongen.errors.topicRequired'));
      return;
    }

    const levelObj = levels.find((l) => l.id === form.educationLevelId);
    const gradeObj = grades.find((g) => g.id === form.gradeId);
    const subjectObj = subjects.find((s) => s.id === form.subjectId);

    const selectedRequirements = requirements.filter((r) => selectedReqIds.has(r.id));
    const lang = i18n.language.startsWith('en') ? 'en' : 'pl';

    setGenerating(true);
    setGenError(null);
    setSavedMsg(null);
    setLesson(null);

    try {
      const { content, model, tokens } = await generateCurriculumLesson({
        workspaceId: activeWorkspace.id,
        provider: effectiveProvider,
        model: effectiveModel?.model,
        topic: form.topic,
        subject: subjectObj?.name ?? form.topic,
        educationLevel: levelObj?.name ?? '',
        grade: gradeObj?.name ?? '',
        lessonType: LESSON_TYPES.find((lt) => lt.value === form.lessonType)?.value ?? form.lessonType,
        durationMinutes: effectiveDuration,
        difficulty: form.difficulty,
        selectedRequirements,
        objectives: form.objectives || undefined,
        language: lang,
      });

      setLesson(content);

      await saveCurriculumLesson({
        workspaceId: activeWorkspace.id,
        topic: form.topic,
        content,
        model,
        tokens,
        selectedRequirementIds: selectedRequirements.map((r) => r.id),
        lessonType: form.lessonType,
      });

      setSavedMsg(t('lessongen.result.saved'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error');
      setGenError(msg.startsWith('lessongen.') ? t(msg) : msg);
    } finally {
      setGenerating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Eksport PDF
  // ---------------------------------------------------------------------------

  function handleExportPdf() {
    if (!lesson) return;
    const spec: PdfDocSpec = {
      title: lesson.title,
      subtitle: `${lesson.subject} · ${lesson.educationLevel} · ${lesson.grade}`,
      meta: [
        { label: t('lessongen.result.lessonType'), value: lesson.lessonType },
        { label: t('lessongen.form.duration'), value: `${lesson.durationMinutes} min` },
      ],
      sections: [
        {
          heading: t('lessongen.result.mainObjectives'),
          bullets: lesson.mainObjectives,
        },
        {
          heading: t('lessongen.result.operationalObjectives'),
          bullets: lesson.operationalObjectives,
        },
        {
          heading: t('lessongen.result.successCriteria'),
          bullets: lesson.successCriteria,
        },
        {
          heading: t('lessongen.result.lessonFlow'),
        },
        ...lesson.phases.map((phase) => ({
          heading: `${phase.name} (${phase.durationMinutes} min)`,
          level: 3 as const,
          paragraphs: [
            phase.description,
            `${t('lessongen.result.teacherActivity')}: ${phase.teacherActivity}`,
            `${t('lessongen.result.studentActivity')}: ${phase.studentActivity}`,
          ],
          bullets: phase.materials,
        })),
        ...(lesson.homework
          ? [{ heading: t('lessongen.result.homework'), paragraphs: [lesson.homework] }]
          : []),
        {
          heading: t('lessongen.result.adaptations'),
          paragraphs: [
            `SPE: ${lesson.adaptations.spe}`,
            `${t('lessongen.result.gifted')}: ${lesson.adaptations.gifted}`,
            `${t('lessongen.result.support')}: ${lesson.adaptations.support}`,
          ],
        },
        {
          heading: t('lessongen.result.curriculumSources'),
          paragraphs: [lesson.curriculumNote],
          bullets: lesson.curriculumSources.map(
            (s) => `${s.sectionName}: ${s.requirementText} (${s.legalBasis})`,
          ),
        },
      ],
    };
    downloadPdf(spec, `lekcja-${lesson.title.slice(0, 30)}.pdf`);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loadingLevels && levels.length === 0) {
    return <FullPageSpinner />;
  }

  const selectedRequirements = requirements.filter((r) => selectedReqIds.has(r.id));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Nagłówek */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <BookOpen className="h-6 w-6 text-grape-400" />
            {t('lessongen.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{t('lessongen.subtitle')}</p>
        </div>
        <Link to="/lessongen/history" className="text-sm text-grape-400 hover:underline">
          {t('lessongen.history.title')}
        </Link>
      </div>

      {/* Formularz */}
      <div className="card p-6 space-y-5">
        {/* Temat lekcji */}
        <div>
          <SectionHeading>
            <Sparkles className="h-4 w-4 text-grape-400" />
            {t('lessongen.form.topicSection')}
          </SectionHeading>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="topic"
                label={t('lessongen.form.topic')}
                value={form.topic}
                onChange={(e) => setField('topic', e.target.value)}
                placeholder={t('lessongen.form.topicPlaceholder')}
              />
            </div>
          </div>

          {/* Status analizy */}
          {analyzing && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('lessongen.analysis.analyzing')}
            </div>
          )}
          {analysisError && (
            <p className="mt-2 text-sm text-amber-400">{analysisError}</p>
          )}
          {analysis && !analyzing && (
            <div className="mt-3 rounded-xl bg-ink-800 border border-ink-700 p-3 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-grape-400">
                {t('lessongen.analysis.title')}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                <span className="text-gray-400">{t('lessongen.form.subject')}:</span>
                <span className="text-gray-100 sm:col-span-2">{analysis.subject}</span>
                <span className="text-gray-400">{t('lessongen.analysis.level')}:</span>
                <span className="text-gray-100 sm:col-span-2">{analysis.educationLevel}</span>
                <span className="text-gray-400">{t('lessongen.analysis.grade')}:</span>
                <span className="text-gray-100 sm:col-span-2">{analysis.grade}</span>
                <span className="text-gray-400">{t('lessongen.difficulty.label')}:</span>
                <span className="text-gray-100 sm:col-span-2">
                  {t(`lessongen.difficulty.${analysis.difficulty}`)}
                </span>
              </div>
              {analysis.warnings && analysis.warnings.length > 0 && (
                <div className="mt-1.5 flex items-start gap-2 text-xs text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{analysis.warnings.join(' ')}</span>
                </div>
              )}
              {analysis.suggestedSections.length > 0 && (
                <p className="text-xs text-gray-400">
                  {t('lessongen.analysis.sections')}:{' '}
                  {analysis.suggestedSections.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Poziom i czas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="educationLevel">{t('lessongen.form.educationLevel')}</FieldLabel>
            <SelectField
              id="educationLevel"
              value={form.educationLevelId}
              onChange={(v) => setField('educationLevelId', v)}
              disabled={loadingLevels}
            >
              <option value="">{t('lessongen.form.selectLevel')}</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="duration">{t('lessongen.form.duration')}</FieldLabel>
            <SelectField
              id="duration"
              value={form.useCustomDuration ? 'custom' : String(form.durationMinutes)}
              onChange={(v) => {
                if (v === 'custom') {
                  setField('useCustomDuration', true);
                } else {
                  setField('useCustomDuration', false);
                  setField('durationMinutes', Number(v));
                }
              }}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.value} value={String(d.value)}>
                  {d.label}
                </option>
              ))}
              <option value="custom">{t('lessongen.form.customDuration')}</option>
            </SelectField>
            {form.useCustomDuration && (
              <input
                type="number"
                min={5}
                max={480}
                value={form.customDuration}
                onChange={(e) => setField('customDuration', Number(e.target.value))}
                className="field mt-1 w-full"
                placeholder={t('lessongen.form.customDurationPlaceholder')}
              />
            )}
          </div>
        </div>

        {/* Pola konfiguracji lekcji */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Klasa */}
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="grade">{t('lessongen.form.grade')}</FieldLabel>
            <SelectField
              id="grade"
              value={form.gradeId}
              onChange={(v) => setField('gradeId', v)}
              disabled={loadingGrades || grades.length === 0}
            >
              <option value="">{t('lessongen.form.selectGrade')}</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Przedmiot */}
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="subject">{t('lessongen.form.subject')}</FieldLabel>
            <SelectField
              id="subject"
              value={form.subjectId}
              onChange={(v) => setField('subjectId', v)}
              disabled={loadingSubjects || subjects.length === 0}
            >
              <option value="">{t('lessongen.form.selectSubject')}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Typ lekcji */}
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="lessonType">{t('lessongen.form.lessonType')}</FieldLabel>
            <SelectField
              id="lessonType"
              value={form.lessonType}
              onChange={(v) => setField('lessonType', v)}
            >
              {LESSON_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {t(lt.labelKey)}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Poziom trudnosci */}
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="difficulty">{t('lessongen.difficulty.label')}</FieldLabel>
            <SelectField
              id="difficulty"
              value={form.difficulty}
              onChange={(v) => setField('difficulty', v)}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {t(d.labelKey)}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Model AI — selektor z nadpisaniem per generowanie */}
          {activeWorkspace && (
            <ModelSelector
              workspaceId={activeWorkspace.id}
              defaultValue={defaultModel}
              onChange={(sel) => setField('overrideModel', sel)}
              disabled={loadingProviders || providers.length === 0}
            />
          )}
        </div>

        {/* Cele dodatkowe */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="objectives">{t('lessongen.form.objectives')}</FieldLabel>
          <textarea
            id="objectives"
            rows={3}
            value={form.objectives}
            onChange={(e) => setField('objectives', e.target.value)}
            className="field w-full"
            placeholder={t('lessongen.form.objectivesPlaceholder')}
          />
        </div>

        {/* Przycisk dopasowania wymagań */}
        {form.topic.length >= 3 && (
          <div className="border-t border-ink-700 pt-4">
            <div className="flex items-center justify-between">
              <SectionHeading>
                <BookOpen className="h-4 w-4 text-grape-400" />
                {t('lessongen.curriculum.title')}
              </SectionHeading>
              <Button
                variant="secondary"
                size="sm"
                loading={loadingReq}
                onClick={() => void handleMatchRequirements()}
              >
                {t('lessongen.curriculum.match')}
              </Button>
            </div>

            {/* Lista wymagań */}
            {reqError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {reqError}
              </div>
            )}

            {requirements.length > 0 && (
              <div className="mt-3 space-y-2">
                {requirements.map((req) => (
                  <label
                    key={req.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedReqIds.has(req.id)
                        ? 'border-grape-400/50 bg-grape-400/5'
                        : 'border-ink-700 bg-ink-800 hover:border-ink-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedReqIds.has(req.id)}
                      onChange={() => toggleReqSelection(req.id)}
                      className="mt-0.5 h-4 w-4 rounded border-ink-600 bg-ink-700 text-grape-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs font-semibold text-grape-400">
                          {req.section_name}
                        </span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-500">{req.requirement_type}</span>
                        {req.relevance > 0 && (
                          <>
                            <span className="text-xs text-gray-500">·</span>
                            <span className="text-xs text-gray-500">
                              {t('lessongen.curriculum.relevance')}:{' '}
                              {Math.round(req.relevance * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-200">{req.requirement_text}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{req.legal_basis}</p>
                    </div>
                    {selectedReqIds.has(req.id) && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-grape-400" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {requirements.length === 0 && !loadingReq && reqError === null && (
              <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-sm text-amber-300">{t('lessongen.curriculum.noMatch')}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {t('lessongen.curriculum.noMatchHint')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Błąd braku providera */}
        {providers.length === 0 && !loadingProviders && (
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t('lessongen.errors.noProvider')}{' '}
            <Link to="/settings" className="underline">
              {t('nav.settings')}
            </Link>
          </div>
        )}

        {/* Przycisk generowania */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            loading={generating}
            disabled={!form.topic || form.topic.length < 3 || providers.length === 0}
            onClick={() => void handleGenerate()}
          >
            <Sparkles className="h-4 w-4" />
            {t('lessongen.form.generate')}
          </Button>
          {selectedRequirements.length > 0 && (
            <span className="text-xs text-gray-400">
              {t('lessongen.curriculum.selectedCount', {
                count: selectedRequirements.length,
              })}
            </span>
          )}
        </div>

        {genError && (
          <p className="text-sm text-red-400">{genError}</p>
        )}
      </div>

      {/* Wynik lekcji */}
      {lesson && (
        <div className="card p-6 space-y-4">
          {savedMsg && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {savedMsg}
            </div>
          )}

          {/* Przyciski eksportu */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPdf}
            >
              <FileDown className="h-4 w-4" />
              {t('lessongen.result.exportPdf')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Przekształcamy CurriculumLessonContent do LessonContent dla istniejącego eksportera DOCX
                const legacyContent = {
                  title: lesson.title,
                  summary: lesson.curriculumNote,
                  objectives: lesson.mainObjectives,
                  blocks: lesson.phases.map((p) => ({
                    type: 'main' as const,
                    heading: `${p.name} (${p.durationMinutes} min)`,
                    content: `${p.description}\n\nNauczyciel: ${p.teacherActivity}\nUczeń: ${p.studentActivity}`,
                    durationMinutes: p.durationMinutes,
                  })),
                  teacherNotes: lesson.teacherNotes,
                  studentQuestions: lesson.successCriteria,
                  suggestedResourceTypes: lesson.didacticMaterials,
                };
                void downloadLessonDocx(
                  legacyContent,
                  { generatedAt: new Date().toISOString() },
                  `lekcja-${lesson.title.slice(0, 30)}.docx`,
                );
              }}
            >
              <FileDown className="h-4 w-4" />
              {t('lessongen.result.exportDocx')}
            </Button>
          </div>

          <CurriculumLessonView lesson={lesson} />
        </div>
      )}
    </div>
  );
}
