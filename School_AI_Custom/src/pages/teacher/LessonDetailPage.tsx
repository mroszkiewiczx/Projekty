import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { lessonService } from '@/services/lessonService'
import { pdfExportService } from '@/services/pdfExportService'
import { useWhatsappNotification } from '@/hooks/useWhatsappNotification'
import { WhatsappRecipientGroup } from '@/types/notification'
import { LessonGeneratorOutput, MaterialQualityScore } from '@/types/lesson'

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workspaceId } = useAppContext()
  const [lesson, setLesson] = useState<LessonGeneratorOutput | null>(null)
  const [quality, setQuality] = useState<MaterialQualityScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWhatsappModal, setShowWhatsappModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<WhatsappRecipientGroup>('STUDENTS')
  const { loading: whatsappLoading, error: whatsappError, success, sendLessonNotification } = useWhatsappNotification()

  useEffect(() => {
    const loadLesson = async () => {
      if (!id) return

      try {
        const lessonData = await lessonService.getLesson(id)
        setLesson(lessonData)

        const qualityData = await lessonService.getQualityScore(id)
        setQuality(qualityData)
      } catch (error) {
        console.error('Failed to load lesson:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [id])

  const handlePublish = async () => {
    if (!lesson?.id) return
    try {
      await lessonService.publishLesson(lesson.id)
      setLesson({ ...lesson, status: 'published' })
    } catch (error) {
      console.error('Failed to publish:', error)
    }
  }

  const handleDelete = async () => {
    if (!lesson?.id || !confirm('Are you sure you want to delete this lesson?')) return
    try {
      await lessonService.deleteLesson(lesson.id)
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleSendWhatsapp = async () => {
    if (!lesson) return
    await sendLessonNotification(lesson, selectedGroup)
    setShowWhatsappModal(false)
  }

  if (loading) {
    return <div className="p-8">Loading lesson...</div>
  }

  if (!lesson) {
    return <div className="p-8">Lesson not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-gray-600 mt-2">{lesson.topic}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full font-bold ${
            lesson.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {lesson.status}
        </span>
      </div>

      {quality && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Quality Assessment</h2>
            <div className="space-y-3">
              <QualityItem label="Overall Score" value={quality.overallScore} />
              <QualityItem label="Content Clarity" value={quality.languageClarity} />
              <QualityItem label="Grade Appropriate" value={quality.gradeAppropriate} />
              <QualityItem label="Structure & Flow" value={quality.structureFlow} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Feedback</h2>
            <p className="text-gray-700">{quality.feedback || 'No feedback provided'}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Lesson Content</h2>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>

      <div className="flex gap-4 justify-end">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleDelete}
          className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
        >
          Delete
        </button>
        <button
          onClick={() => setShowWhatsappModal(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          📱 Send WhatsApp
        </button>
        {lesson.status === 'draft' && (
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Publish
          </button>
        )}
      </div>

      {showWhatsappModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-sm">
            <h2 className="text-2xl font-bold mb-6">Send WhatsApp Alert</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Recipient Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value as WhatsappRecipientGroup)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="STUDENTS">📚 Students</option>
                <option value="PARENTS">👨‍👩‍👧 Parents</option>
                <option value="ALL">👥 Everyone</option>
              </select>
            </div>

            {whatsappError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {whatsappError}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                ✓ WhatsApp notification sent successfully!
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowWhatsappModal(false)}
                disabled={whatsappLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWhatsapp}
                disabled={whatsappLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {whatsappLoading ? 'Sending...' : 'Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QualityItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{value}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            value >= 80 ? 'bg-green-600' : value >= 60 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
