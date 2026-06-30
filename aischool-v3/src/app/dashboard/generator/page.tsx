'use client'
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, BookOpen, Clock, Target, ChevronDown, CheckCircle2, AlertCircle, Download, Star, RotateCcw } from 'lucide-react'

interface EducationLevel { id: string; name: string; slug: string }
interface Subject { id: string; name: string; type: string }
interface Grade { id: string; name: string; numericValue: number }

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-1.5 rounded-full border border-indigo-300 text-xs flex items-center gap-2">
      <span className="font-medium text-indigo-600">{label}:</span>
      <span className="text-indigo-900">{value}</span>
    </div>
  )
}

function LessonResult({ lesson, topic, onBack, onDownload }: any) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{topic}</h1>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2">
        {['overview', 'plan', 'materials', 'adaptations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {tab === 'overview' && 'Przegląd'}
            {tab === 'plan' && 'Plan lekcji'}
            {tab === 'materials' && 'Materiały'}
            {tab === 'adaptations' && 'Adaptacje'}
          </button>
        ))}
        <button onClick={onDownload} className="ml-auto px-4 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center gap-2">
          <Download className="w-4 h-4" />
          Pobierz
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {lesson.goals?.main && <div><h3 className="font-semibold text-gray-900">Cel główny</h3><p className="text-gray-700">{lesson.goals.main}</p></div>}
            {lesson.methods?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Metody</h3>
                <ul className="list-disc list-inside space-y-1">{lesson.methods.map((m: string, i: number) => <li key={i} className="text-gray-700">{m}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-3">
            {lesson.lessonPlan?.map((phase: any) => (
              <div key={phase.number} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{phase.number}. {phase.name}</h4>
                  <span className="text-sm text-gray-500">{phase.duration} min</span>
                </div>
                {phase.description && <p className="text-sm text-gray-700">{phase.description}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            {lesson.materials?.teacher?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Materiały dla nauczyciela</h3>
                <ul className="list-disc list-inside space-y-1">{lesson.materials.teacher.map((m: string, i: number) => <li key={i} className="text-gray-700">{m}</li>)}</ul>
              </div>
            )}
            {lesson.materials?.student?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Materiały dla uczniów</h3>
                <ul className="list-disc list-inside space-y-1">{lesson.materials.student.map((m: string, i: number) => <li key={i} className="text-gray-700">{m}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'adaptations' && (
          <div className="space-y-4">
            {lesson.adaptations?.forStruggling?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dla uczniów ze słabszymi wynikami</h3>
                <ul className="list-disc list-inside space-y-1">{lesson.adaptations.forStruggling.map((a: string, i: number) => <li key={i} className="text-gray-700">{a}</li>)}</ul>
              </div>
            )}
            {lesson.adaptations?.forGifted?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dla uczniów zdolnych</h3>
                <ul className="list-disc list-inside space-y-1">{lesson.adaptations.forGifted.map((a: string, i: number) => <li key={i} className="text-gray-700">{a}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GeneratorPage() {
  const [levels, setLevels] = useState<EducationLevel[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [form, setForm] = useState({
    topic: '', educationLevelId: '', subjectId: '', gradeId: '',
    durationMinutes: 45, lessonType: 'lekcja wprowadzająca',
    aiModel: 'claude-sonnet-4-6', additionalGoals: '',
    specialNeeds: [] as string[], selectedRequirements: [] as string[],
    includeVideoSearch: false, videoSources: ['youtube', 'khan'] as string[],
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [notInCurriculum, setNotInCurriculum] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [lesson, setLesson] = useState<any>(null)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const analyzeTimer = useRef<any>(null)

  useEffect(() => {
    fetch('/api/education-levels').then(r => r.json()).then(d => setLevels(d.data || []))
  }, [])

  useEffect(() => {
    if (!form.educationLevelId) return
    fetch(`/api/subjects?educationLevelId=${form.educationLevelId}`).then(r => r.json()).then(d => setSubjects(d.data || []))
    fetch(`/api/grades?educationLevelId=${form.educationLevelId}`).then(r => r.json()).then(d => setGrades(d.data || []))
    setForm(f => ({ ...f, subjectId: '', gradeId: '' }))
  }, [form.educationLevelId])

  useEffect(() => {
    if (form.topic.length < 5) { setAnalysis(null); setNotInCurriculum(false); return }
    clearTimeout(analyzeTimer.current)
    analyzeTimer.current = setTimeout(async () => {
      setAnalyzing(true)
      try {
        const r = await fetch('/api/lesson/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: form.topic, educationLevelId: form.educationLevelId || undefined }),
        })
        const d = await r.json()
        setAnalysis(d.data)
        setNotInCurriculum(!d.data?.foundInCurriculum)
      } finally { setAnalyzing(false) }
    }, 900)
    return () => clearTimeout(analyzeTimer.current)
  }, [form.topic, form.educationLevelId])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.topic || !form.educationLevelId) { alert('Wypełnij temat i poziom edukacji'); return }
    setGenerating(true)
    setLesson(null)
    try {
      const r = await fetch('/api/lesson/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setLesson(d.data.lesson)
      setLessonId(d.data.id)
    } catch (e: any) {
      alert('Błąd: ' + e.message)
    } finally { setGenerating(false) }
  }

  const downloadMarkdown = () => {
    if (!lesson) return
    const md = `# ${form.topic}\n\n${JSON.stringify(lesson, null, 2)}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `lekcja-${form.topic.replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
  }

  const lessonTypes = ['lekcja wprowadzająca', 'lekcja utrwalająca', 'lekcja powtórzeniowa', 'lekcja ćwiczeniowa']
  const aiModels = [{ id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (zalecany)' }, { id: 'gpt-4o', label: 'GPT-4o' }]
  const durations = [15, 30, 45, 60, 90, 120, 150, 180, 200]
  const specialNeedsOptions = ['dysleksja', 'ADHD', 'spektrum autyzmu']

  if (lesson) {
    return <LessonResult lesson={lesson} topic={form.topic} onBack={() => setLesson(null)} onDownload={downloadMarkdown} />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generator lekcji</h1>
          <p className="text-sm text-gray-500">Scenariusz zgodny z polską podstawą programową</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Co chcesz przygotować?
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temat lekcji <span className="text-red-500">*</span></label>
            <div className="relative">
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                placeholder="Np. Fotosynteza, Ułamki zwykłe, Renesans w Polsce..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {analyzing && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                {notInCurriculum && !analyzing && <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" title="Nie znaleziono w PP" />}
                {analysis?.foundInCurriculum && !analyzing && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          </div>

          {analysis?.suggestions && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Sugestia AI
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestions.subject && <Chip label="Przedmiot" value={analysis.suggestions.subject} />}
                {analysis.suggestions.grade && <Chip label="Klasa" value={analysis.suggestions.grade} />}
                {analysis.suggestions.section && <Chip label="Dział" value={analysis.suggestions.section} />}
              </div>
            </div>
          )}

          {notInCurriculum && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-orange-700">
                <p className="font-medium">Nie znaleziono wymagania w podstawie programowej</p>
                <p className="text-xs mt-0.5">Możesz wygenerować lekcję ogólną — nie będzie powiązana z PP</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Poziom edukacji *</label>
              <select value={form.educationLevelId} onChange={e => setForm(f => ({ ...f, educationLevelId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Wybierz...</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Przedmiot</label>
              <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Wybierz...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Klasa</label>
              <select value={form.gradeId} onChange={e => setForm(f => ({ ...f, gradeId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Wybierz...</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Czas trwania (min)</label>
              <select value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {durations.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Typ lekcji</label>
              <select value={form.lessonType} onChange={e => setForm(f => ({ ...f, lessonType: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {lessonTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model AI</label>
              <select value={form.aiModel} onChange={e => setForm(f => ({ ...f, aiModel: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {aiModels.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.includeVideoSearch}
                onChange={e => setForm(f => ({ ...f, includeVideoSearch: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">📺 Wyszukaj materiały video automatycznie?</span>
                <p className="text-xs text-gray-500 mt-0.5">Automatycznie znajdzie i dopasuje filmy z YouTube, Khan Academy i innych portali do Twojej lekcji</p>
              </div>
            </label>

            {form.includeVideoSearch && (
              <div className="mt-3 ml-7 p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs font-medium text-indigo-900 mb-2">Źródła video:</p>
                <div className="space-y-2">
                  {[
                    { id: 'youtube', label: 'YouTube (kanały edukacyjne)' },
                    { id: 'khan', label: 'Khan Academy' },
                    { id: 'vimeo', label: 'Vimeo (edukacja)' }
                  ].map(source => (
                    <label key={source.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.videoSources.includes(source.id)}
                        onChange={e => setForm(f => ({
                          ...f,
                          videoSources: e.target.checked
                            ? [...f.videoSources, source.id]
                            : f.videoSources.filter(s => s !== source.id)
                        }))}
                        className="w-3 h-3 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-700">{source.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={generating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generuję...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Wygeneruj lekcję
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
