import { useState, useCallback, lazy, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  Loading,
} from '@/components/ui'
import { Form, FormField, FormGroup } from '@/components/ui/Form'
import { ImageUploader } from '@/components/lesson'
const RichTextEditor = lazy(() =>
  import('@/components/lesson/RichTextEditor').then(m => ({ default: m.RichTextEditor }))
)
import { lessonService } from '@/services/lessonService'
import { ChatWindow } from '@/modules/chat/ChatWindow'
import { useAuth } from '@/hooks/useAuth'
import type { LessonGeneratorOutput } from '@/types/lesson'

const SUBJECTS = [
  'Matematyka',
  'Fizyka',
  'Chemia',
  'Biologia',
  'Historia',
  'Geografia',
  'Język polski',
  'Język angielski',
  'Język niemiecki',
  'Informatyka',
  'Muzyka',
  'Plastyka',
  'Wychowanie fizyczne',
  'Religia',
  'Etyka',
] as const

const EDUCATION_LEVELS = [
  { value: 'podstawowa', label: 'Szkoła podstawowa' },
  { value: 'gimnazjum', label: 'Gimnazjum' },
  { value: 'liceum', label: 'Liceum / Technikum' },
] as const

const GRADES: Record<string, Array<{ value: string; label: string }>> = {
  podstawowa: Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: `Klasa ${i + 1}`,
  })),
  gimnazjum: Array.from({ length: 3 }, (_, i) => ({
    value: String(i + 1),
    label: `Klasa ${i + 1}`,
  })),
  liceum: Array.from({ length: 4 }, (_, i) => ({
    value: String(i + 1),
    label: `Klasa ${i + 1}`,
  })),
}

const LEARNING_STYLES = [
  { value: 'visual', label: 'Wzrokowy (Visual)' },
  { value: 'auditory', label: 'Słuchowy (Auditory)' },
  { value: 'kinesthetic', label: 'Kinestetyczny (Kinesthetic)' },
  { value: 'mixed', label: 'Mieszany' },
] as const

const generatorSchema = z.object({
  topic: z.string().min(3, 'Temat musi mieć co najmniej 3 znaki').max(200, 'Temat jest zbyt długi'),
  subject: z.string().min(1, 'Wybierz przedmiot'),
  educationLevel: z.enum(['podstawowa', 'gimnazjum', 'liceum'], {
    required_error: 'Wybierz poziom edukacji',
  }),
  grade: z.string().min(1, 'Wybierz klasę'),
  duration: z
    .number({ invalid_type_error: 'Podaj czas trwania' })
    .min(0.5, 'Minimalna długość to 30 minut')
    .max(4, 'Maksymalna długość to 4 godziny'),
  objectives: z
    .string()
    .min(10, 'Opisz cele lekcji (minimum 10 znaków)')
    .max(1000, 'Opis celów jest zbyt długi'),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'mixed']),
})

type GeneratorFormData = z.infer<typeof generatorSchema>

type PageState = 'form' | 'generating' | 'editing'

interface ToastState {
  type: 'success' | 'error'
  message: string
}

export default function LessonGeneratorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pageState, setPageState] = useState<PageState>('form')
  const [generatedLesson, setGeneratedLesson] = useState<LessonGeneratorOutput | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const form = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      topic: '',
      subject: '',
      educationLevel: 'podstawowa',
      grade: '',
      duration: 1,
      objectives: '',
      learningStyle: 'mixed',
    },
  })

  const educationLevel = form.watch('educationLevel')
  const gradeOptions = GRADES[educationLevel] ?? GRADES.podstawowa

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const onSubmit = async (data: GeneratorFormData) => {
    if (!user) {
      showToast('error', 'Musisz być zalogowany, aby generować lekcje.')
      return
    }

    setPageState('generating')

    try {
      const objectivesArray = data.objectives
        .split(/[\n,]/)
        .map((o) => o.trim())
        .filter((o) => o.length > 0)

      const result = await lessonService.generateLesson(user.workspaceId, user.id, {
        topic: data.topic,
        subject: data.subject,
        educationLevel: data.educationLevel,
        grade: Number(data.grade),
        duration: data.duration,
        objectives: objectivesArray,
      })

      setGeneratedLesson(result)
      setEditedContent(result.content)
      setPageState('editing')
      showToast('success', 'Lekcja została wygenerowana pomyślnie!')
    } catch (err) {
      setPageState('form')
      const message = err instanceof Error ? err.message : 'Nieznany błąd'
      showToast('error', `Nie udało się wygenerować lekcji: ${message}`)
    }
  }

  const handleSave = async () => {
    if (!generatedLesson) return
    setIsSaving(true)
    try {
      navigate(`/lesson/${generatedLesson.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd'
      showToast('error', `Nie udało się zapisać lekcji: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedLesson) return
    setIsSaving(true)
    try {
      await lessonService.publishLesson(generatedLesson.id)
      showToast('success', 'Lekcja została opublikowana!')
      navigate(`/lesson/${generatedLesson.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd'
      showToast('error', `Nie udało się opublikować lekcji: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackToForm = () => {
    setPageState('form')
    setGeneratedLesson(null)
    setEditedContent('')
  }

  if (pageState === 'generating') {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <Loading size="lg" text="Generowanie lekcji przez AI..." />
          <div className="max-w-md text-center">
            <p className="text-sm text-gray-500">
              AI analizuje temat i tworzy spersonalizowaną lekcję. Może to potrwać kilkanaście sekund.
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (pageState === 'editing' && generatedLesson) {
    return (
      <MainLayout>
        {toast && (
          <div className="fixed right-4 top-4 z-50">
            <div
              className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
                toast.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{generatedLesson.title}</h1>
              <p className="mt-1 text-gray-600">{generatedLesson.topic}</p>
            </div>
            <Button variant="outline" onClick={handleBackToForm}>
              Wróć do formularza
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Treść lekcji</CardTitle>
                  <CardDescription>Możesz edytować wygenerowaną treść przed zapisaniem</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="p-4 text-gray-500">Ladowanie edytora...</div>}>
                    <RichTextEditor
                      value={editedContent}
                      onChange={setEditedContent}
                      placeholder="Treść lekcji..."
                    />
                  </Suspense>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button onClick={handlePublish} disabled={isSaving} className="flex-1">
                    {isSaving ? 'Zapisywanie...' : 'Opublikuj lekcję'}
                  </Button>
                  <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                    Zapisz jako szkic
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dodatkowe materiały</CardTitle>
                  <CardDescription>Dodaj zdjęcia lub pliki do lekcji</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader onUpload={async (_file) => ''} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wynik jakości</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {generatedLesson.qualityScore > 0 ? generatedLesson.qualityScore : '—'}
                    </div>
                    {generatedLesson.qualityScore > 0 && (
                      <>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${(generatedLesson.qualityScore / 10) * 100}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">na skali 10</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {generatedLesson.objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cele lekcji</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedLesson.objectives.map((obj, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 flex-shrink-0 text-blue-600">✓</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {generatedLesson.activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Zajęcia ({generatedLesson.activities.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedLesson.activities.map((activity, idx) => (
                      <div key={idx} className="rounded-md border border-gray-200 p-2 text-sm">
                        <p className="font-medium text-gray-900">
                          {idx + 1}. {activity.name}
                        </p>
                        <p className="mt-0.5 text-gray-500">{activity.duration} min</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Card className="h-96">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Chat</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-56px)] p-0">
                  <ChatWindow
                    context={{
                      lesson_id: generatedLesson.id,
                      lesson_title: generatedLesson.title,
                      subject: generatedLesson.topic,
                    }}
                    placeholder="Zapytaj AI o tę lekcję..."
                    className="rounded-none border-0 shadow-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generuj nową lekcję</h1>
          <p className="mt-1 text-gray-600">
            Opisz temat i parametry lekcji. AI wygeneruje gotowy materiał edukacyjny.
          </p>
        </div>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Temat i przedmiot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Temat lekcji"
                required
                error={form.formState.errors.topic?.message}
              >
                <Input
                  {...form.register('topic')}
                  placeholder="np. Fotosynteza, Równania kwadratowe, II Wojna Światowa..."
                  error={form.formState.errors.topic?.message}
                />
              </FormField>

              <FormGroup columns={2}>
                <FormField
                  label="Przedmiot"
                  required
                  error={form.formState.errors.subject?.message}
                >
                  <Select
                    {...form.register('subject')}
                    options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                    placeholder="Wybierz przedmiot"
                    error={form.formState.errors.subject?.message}
                  />
                </FormField>

                <FormField
                  label="Poziom edukacji"
                  required
                  error={form.formState.errors.educationLevel?.message}
                >
                  <Select
                    {...form.register('educationLevel')}
                    options={[...EDUCATION_LEVELS]}
                    error={form.formState.errors.educationLevel?.message}
                  />
                </FormField>
              </FormGroup>

              <FormGroup columns={2}>
                <FormField
                  label="Klasa"
                  required
                  error={form.formState.errors.grade?.message}
                >
                  <Select
                    {...form.register('grade')}
                    options={gradeOptions}
                    placeholder="Wybierz klasę"
                    error={form.formState.errors.grade?.message}
                  />
                </FormField>

                <FormField
                  label="Czas trwania (godziny)"
                  required
                  error={form.formState.errors.duration?.message}
                >
                  <Input
                    {...form.register('duration', { valueAsNumber: true })}
                    type="number"
                    min="0.5"
                    max="4"
                    step="0.5"
                    placeholder="1"
                    error={form.formState.errors.duration?.message}
                  />
                </FormField>
              </FormGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cele i styl nauczania</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Cele lekcji"
                required
                error={form.formState.errors.objectives?.message}
              >
                <textarea
                  {...form.register('objectives')}
                  rows={4}
                  placeholder="Opisz cele lekcji, np.:&#10;- Uczeń rozumie proces fotosyntezy&#10;- Uczeń potrafi wymienić produkty fotosyntezy&#10;- Uczeń zna rolę chlorofilu"
                  className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 resize-y"
                />
                {form.formState.errors.objectives && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.objectives.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Możesz wpisać każdy cel w nowej linii lub oddzielić przecinkami.
                </p>
              </FormField>

              <FormField
                label="Styl uczenia się"
                error={form.formState.errors.learningStyle?.message}
              >
                <Select
                  {...form.register('learningStyle')}
                  options={[...LEARNING_STYLES]}
                  error={form.formState.errors.learningStyle?.message}
                />
              </FormField>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Generowanie...' : 'Generuj lekcję AI'}
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </div>
    </MainLayout>
  )
}
