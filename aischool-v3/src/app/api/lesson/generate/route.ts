import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateText } from 'ai'
import { createSupabaseServer } from '@/lib/supabase'
import { getAiModel } from '@/lib/aiProvider'
import { z } from 'zod'

// Wymusza dynamiczne renderowanie — route używa sekretów/auth w runtime,
// Next nie może go analizować przy buildzie ('collecting page data').
export const dynamic = 'force-dynamic'

const schema = z.object({
  topic: z.string().min(3),
  educationLevelId: z.string().optional(),
  gradeId: z.string().optional(),
  subjectId: z.string().optional(),
  durationMinutes: z.number().min(15).max(200).default(45),
  lessonType: z.string().optional(),
  aiModel: z.string().default('claude-sonnet-4-6'),
  selectedRequirements: z.array(z.string()).default([]),
  specialNeeds: z.array(z.string()).default([]),
  additionalGoals: z.string().optional(),
  mediaLinks: z.array(z.object({ url: z.string(), title: z.string().optional() })).default([]),
  includeVideoSearch: z.boolean().default(false),
  videoSources: z.array(z.string()).default(['youtube', 'khan']),
})

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const body = await req.json()
    const data = schema.parse(body)

    let workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: user.id, isActive: true },
      include: { workspace: true },
    })

    if (!workspaceUser) {
      const workspace = await prisma.workspace.create({
        data: { name: user.email || 'Mój workspace', slug: user.id, type: 'school', isActive: true }
      })
      workspaceUser = await prisma.workspaceUser.create({
        data: { workspaceId: workspace.id, userId: user.id, role: 'TEACHER', isActive: true },
        include: { workspace: true },
      })
    }

    const [educationLevel, grade, subject, requirements] = await Promise.all([
      data.educationLevelId ? prisma.educationLevel.findUnique({ where: { id: data.educationLevelId } }) : null,
      data.gradeId ? prisma.grade.findUnique({ where: { id: data.gradeId } }) : null,
      data.subjectId ? prisma.subject.findUnique({ where: { id: data.subjectId } }) : null,
      data.selectedRequirements.length > 0
        ? prisma.curriculumRequirement.findMany({ where: { id: { in: data.selectedRequirements } } })
        : [],
    ])

    const reqText = requirements.length > 0
      ? requirements.map((r, i) => `${i + 1}. ${r.requirementCode ? `[${r.requirementCode}] ` : ''}${r.requirementText}`).join('\n')
      : 'BRAK wymagań — lekcja będzie ogólna'

    const systemPrompt = `Jesteś asystentem nauczyciela. Tworzysz profesjonalne scenariusze lekcji zgodne z polską podstawą programową.
ZASADY:
1. NIE wymyślaj wymagań podstawy programowej. Używaj TYLKO przekazanych wymagań.
2. Jeśli nie ma wymagań — oznacz lekcję jako ogólną w polu isGeneral.
3. Pisz konkretnie, praktycznie, w języku nauczyciela.
4. Czas faz musi sumować się do ${data.durationMinutes} minut.
5. Odpowiadaj WYŁĄCZNIE w JSON. Zero tekstu przed i po JSON.`

    const mediaText = data.mediaLinks.length > 0
      ? '\n\nMATERIAŁY AUDIO/WIDEO DO WYKORZYSTANIA:\n' + data.mediaLinks.map((m, i) =>
          `${i + 1}. ${m.title ? `${m.title} — ` : ''}${m.url}`
        ).join('\n') + '\nUwzględnij te materiały w planie lekcji (w odpowiedniej fazie) i dodaj je do pola additionalMaterials.'
      : ''

    const userPrompt = `Temat: ${data.topic}
Przedmiot: ${subject?.name || 'Nieznany'}
Poziom: ${educationLevel?.name || 'Nieznany'}
Klasa: ${grade?.name || 'Nieznana'}
Czas: ${data.durationMinutes} minut
Typ lekcji: ${data.lessonType || 'lekcja wprowadzająca'}
Dostosowania SPE: ${data.specialNeeds.join(', ') || 'brak'}
Cele dodatkowe: ${data.additionalGoals || 'brak'}

WYMAGANIA Z PODSTAWY PROGRAMOWEJ:
${reqText}${mediaText}

Wygeneruj JSON:
{
  "isGeneral": false,
  "basicInfo": { "topic": "", "subject": "", "schoolType": "", "grade": "", "duration": 0, "lessonType": "", "difficultyLevel": "medium" },
  "curriculumAlignment": { "generalRequirements": [], "specificRequirements": [], "keyCompetencies": [], "teachingContent": [], "studentSkills": [] },
  "goals": {
    "main": "",
    "operational": { "knows": [], "understands": [], "canDo": [], "applies": [] },
    "inStudentLanguage": { "willLearn": [], "willUnderstand": [], "willPractice": [] },
    "successCriteria": []
  },
  "methods": [],
  "materials": { "teacher": [], "student": [] },
  "lessonPlan": [
    { "number": 1, "name": "Część organizacyjna", "duration": 3, "description": "", "activities": [], "teacherActions": [], "studentActions": [] },
    { "number": 2, "name": "Wprowadzenie", "duration": 7, "description": "", "activities": [], "teacherActions": [], "studentActions": [] },
    { "number": 3, "name": "Część główna", "duration": 25, "description": "", "activities": [], "teacherActions": [], "studentActions": [] },
    { "number": 4, "name": "Ćwiczenia", "duration": 7, "description": "", "activities": [], "teacherActions": [], "studentActions": [] },
    { "number": 5, "name": "Podsumowanie", "duration": 3, "description": "", "activities": [], "teacherActions": [], "studentActions": [] }
  ],
  "homework": { "basic": "", "extended": "", "optional": "" },
  "adaptations": { "forStruggling": [], "forGifted": [], "forDyslexia": "", "forADHD": "", "forDiverseClass": [] },
  "additionalMaterials": [],
  "sourcesAndCompliance": { "curriculumType": "Podstawa programowa MEN", "schoolYear": "2024/2025", "requirementsUsed": [] }
}`

    let generatedContent: any = null
    let aiModel = data.aiModel
    let aiProvider = 'ANTHROPIC'
    let promptTokens = 0
    let completionTokens = 0
    let videoResults: any[] = []

    try {
      const model = await getAiModel(aiModel, user.id)

      const result = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        maxOutputTokens: 8192,
        temperature: 0.7,
      })

      promptTokens = result.usage?.inputTokens || 0
      completionTokens = result.usage?.outputTokens || 0
      aiProvider = aiModel.startsWith('claude') ? 'ANTHROPIC' : 'OPENAI'

      const cleaned = result.text.replace(/```json|```/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0])
      } else {
        generatedContent = JSON.parse(cleaned)
      }
    } catch (aiError: any) {
      console.error('AI generation error:', aiError)
      generatedContent = {
        isGeneral: true,
        error: 'Błąd generowania AI. Sprawdź klucz API.',
        basicInfo: { topic: data.topic, duration: data.durationMinutes },
        goals: { main: 'Nie wygenerowano', operational: { knows: [], understands: [], canDo: [], applies: [] }, inStudentLanguage: { willLearn: [], willUnderstand: [], willPractice: [] }, successCriteria: [] },
        lessonPlan: [],
        methods: [],
        materials: { teacher: [], student: [] },
        homework: { basic: '', extended: '', optional: '' },
        adaptations: { forStruggling: [], forGifted: [], forDiverseClass: [] },
        additionalMaterials: [],
      }
    }

    // Search for educational videos if requested
    if (data.includeVideoSearch && generatedContent) {
      try {
        const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/search-videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: data.topic,
            sources: data.videoSources,
            limit: 5
          })
        })

        if (videoResponse.ok) {
          const videoData = await videoResponse.json()
          videoResults = videoData.data?.results || []

          // Add videos to generatedContent
          if (videoResults.length > 0) {
            generatedContent.videos = videoResults.map((v: any) => ({
              id: v.id,
              title: v.title,
              url: v.url,
              source: v.source,
              duration: v.duration,
              relevanceScore: v.relevanceScore
            }))
          }
        }
      } catch (videoError: any) {
        console.warn('Video search error (non-fatal):', videoError)
        // Tidak fatal - lanjutkan tanpa video
      }
    }

    const saved = await prisma.generatedLesson.create({
      data: {
        workspaceId: workspaceUser.workspaceId,
        userId: user.id,
        topic: data.topic,
        educationLevelId: data.educationLevelId,
        gradeId: data.gradeId,
        subjectId: data.subjectId,
        durationMinutes: data.durationMinutes,
        lessonType: data.lessonType,
        aiModel,
        aiProvider,
        promptTokens,
        completionTokens,
        generatedContent,
        status: 'GENERATED',
        ...(requirements.length > 0 && {
          requirements: { create: requirements.map(r => ({ requirementId: r.id })) }
        }),
      },
    })

    await prisma.auditLog.create({
      data: { workspaceId: workspaceUser.workspaceId, userId: user.id, action: 'LESSON_GENERATED', entityType: 'generated_lesson', entityId: saved.id }
    })

    return NextResponse.json({ data: { id: saved.id, lesson: generatedContent } })
  } catch (e: any) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: e.message || 'Błąd serwera' }, { status: 500 })
  }
}
