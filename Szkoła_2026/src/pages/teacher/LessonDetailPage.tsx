import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { RichTextEditor, LessonActions } from '@/components/lesson'
import { SharingModal, CommentsSection } from '@/components/library'
import type { LessonGeneratorOutput, Activity } from '@/types/lesson'

export default function LessonDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSharingOpen, setIsSharingOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [lesson, setLesson] = useState<LessonGeneratorOutput | null>(null)
  const [content, setContent] = useState('')

  // Placeholder: w rzeczywistości będzie fetch z serwera
  const mockLesson: LessonGeneratorOutput = {
    id: id || '',
    topic: 'Fotosynteza',
    title: 'Fotosynteza - Jak rośliny produkują energię',
    content: '<h2>Wstęp</h2><p>Fotosynteza to proces...</p>',
    objectives: [
      'Zrozumieć proces fotosyntezy',
      'Poznać rolę chlorofilu',
      'Nauczyć się praktycznych zastosowań',
    ],
    activities: [
      {
        name: 'Eksperyment z liśćmi',
        duration: 30,
        description: 'Obserwacja zmian barwy liści pod wpływem światła',
        materials: ['liście', 'papier kwasowo-zasadowy'],
      },
      {
        name: 'Dyskusja klasowa',
        duration: 20,
        description: 'Omówienie wyników doświadczenia',
        materials: [],
      },
    ],
    assessment: 'Quiz wielokrotnego wyboru i obserwacja praktycznego eksperymentu',
    materials: ['prezentacja.pdf', 'instrukcja-eksperymentu.docx'],
    qualityScore: 8.5,
    generatedAt: new Date(),
    status: 'published',
  }

  // Simulate loading
  setTimeout(() => {
    setLesson(mockLesson)
    setContent(mockLesson.content)
    setIsLoading(false)
  }, 500)

  const handleSaveLesson = async () => {
    // TODO: Implement save to backend
    setIsEditing(false)
  }

  const handleShareLesson = async (emails: string[]) => {
    // TODO: Implement share functionality
    console.log('Sharing with:', emails)
  }

  const handleAddComment = async (comment: string) => {
    // TODO: Implement comment functionality
    console.log('Adding comment:', comment)
  }

  if (isLoading || !lesson) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Ładowanie lekcji..." />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="mt-1 text-gray-600">{lesson.topic}</p>
            </div>
            <div className="flex gap-2">
              <LessonActions
                onShare={() => setIsSharingOpen(true)}
                onPublish={handleSaveLesson}
                isPublished={lesson.status === 'published'}
              />
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
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Treść lekcji..."
                  />
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
                      className="flex-1"
                    >
                      Zapisz zmiany
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
