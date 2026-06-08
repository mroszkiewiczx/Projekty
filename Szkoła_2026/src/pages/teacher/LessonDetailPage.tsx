import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
  Loading,
} from '@/components/ui'
import { LessonActions } from '@/components/lesson'
const RichTextEditor = lazy(() =>
  import('@/components/lesson/RichTextEditor').then(m => ({ default: m.RichTextEditor }))
)
import { SharingModal, CommentsSection } from '@/components/library'
import { lessonService } from '@/services/lessonService'
import { n8nIntegrationService } from '@/services/n8nIntegrationService'
import { useAuth } from '@/hooks/useAuth'
import type { LessonGeneratorOutput } from '@/types/lesson'

export default function LessonDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSharingOpen, setIsSharingOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lesson, setLesson] = useState<LessonGeneratorOutput | null>(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }, [])

  useEffect(() => {
    if (!id) {
      setError('Brak identyfikatora lekcji')
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const data = await lessonService.getLesson(id)
        if (!cancelled) {
          if (data) {
            setLesson(data)
            setContent(data.content)
          } else {
            setError('Nie znaleziono lekcji')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Nie udało się załadować lekcji')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  const handleSaveLesson = async () => {
    if (!lesson) return
    setIsSaving(true)
    try {
      if (user) {
        await n8nIntegrationService.onMaterialUpdated(user.workspaceId, {
          id: lesson.id,
          title: lesson.title,
          changes: { content },
        })
      }
      setLesson((prev) => prev ? { ...prev, content } : prev)
      setIsEditing(false)
      showToast('success', 'Lekcja została zapisana.')
    } catch (err) {
      showToast('error', 'Nie udało się zapisać zmian.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!lesson) return
    setIsSaving(true)
    try {
      await lessonService.publishLesson(lesson.id)
      setLesson((prev) => prev ? { ...prev, status: 'published' as const } : prev)
      if (user) {
        await n8nIntegrationService.onLessonCreated(user.workspaceId, lesson)
      }
      showToast('success', 'Lekcja została opublikowana!')
    } catch (err) {
      showToast('error', 'Nie udało się opublikować lekcji.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!lesson || !window.confirm('Czy na pewno chcesz usunąć tę lekcję?')) return
    try {
      await lessonService.deleteLesson(lesson.id)
      navigate('/dashboard')
    } catch (err) {
      showToast('error', 'Nie udało się usunąć lekcji.')
    }
  }

  const handleShareLesson = async (emails: string[]) => {
    if (!lesson || !user) return
    try {
      await n8nIntegrationService.onLessonShared(user.workspaceId, lesson, emails)
      showToast('success', `Lekcja udostępniona dla ${emails.length} osób.`)
    } catch (err) {
      showToast('error', 'Nie udało się udostępnić lekcji.')
    }
  }

  const handleAddComment = async (_comment: string) => {
    // Comments integration reserved for future implementation
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Ładowanie lekcji..." />
        </div>
      </MainLayout>
    )
  }

  if (error || !lesson) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-gray-700">{error ?? 'Nie znaleziono lekcji.'}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Wróć do dashboardu
          </Button>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="mt-1 text-gray-600">{lesson.topic}</p>
            </div>
            <div className="flex gap-2">
              {lesson.status !== 'published' && (
                <Button onClick={handlePublish} disabled={isSaving}>
                  {isSaving ? 'Zapisywanie...' : 'Opublikuj'}
                </Button>
              )}
              <LessonActions
                onShare={() => setIsSharingOpen(true)}
                onPublish={handlePublish}
                isPublished={lesson.status === 'published'}
              />
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                Usuń
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {/* Editor Section */}
            <Card>
              <CardHeader>
                <CardTitle>Treść lekcji</CardTitle>
                <CardDescription>
                  {isEditing
                    ? 'Edytuj treść lekcji'
                    : `Ostatnio zmieniona: ${new Date(lesson.generatedAt).toLocaleDateString('pl-PL')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Suspense fallback={<div className="p-4 text-gray-500">Ladowanie edytora...</div>}>
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Treść lekcji..."
                    />
                  </Suspense>
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveLesson}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setContent(lesson.content)
                      }}
                    >
                      Anuluj
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edytuj treść
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Activities Section */}
            <Card>
              <CardHeader>
                <CardTitle>Zajęcia ({lesson.activities.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lesson.activities.map((activity, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {idx + 1}. {activity.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <div className="mt-2 flex gap-2 text-xs text-gray-500">
                          <span>⏱️ {activity.duration} min</span>
                          {activity.materials.length > 0 && (
                            <span>📚 {activity.materials.length} materiałów</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Komentarze</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsSection
                  comments={[]}
                  onAddComment={handleAddComment}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle>Ocena jakości</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {lesson.qualityScore}
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${(lesson.qualityScore / 10) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">na skali 10</p>
                </div>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Cele lekcji</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.objectives.map((obj, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-1 flex-shrink-0 text-blue-600">✓</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">
                    {lesson.status === 'published' ? '✓ Opublikowana' : 'Szkic'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Data utworzenia</p>
                  <p className="font-medium text-gray-900">
                    {new Date(lesson.generatedAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sharing Modal */}
      <SharingModal
        isOpen={isSharingOpen}
        onClose={() => setIsSharingOpen(false)}
        title={lesson.title}
        onShare={handleShareLesson}
      />
    </MainLayout>
  )
}
