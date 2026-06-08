import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { Input, Button, Select, Card, CardContent } from '@/components/ui'
import { MaterialCard } from '@/components/library'
import type { MaterialType } from '@/types/common'
import type { LessonGeneratorOutput } from '@/types/lesson'

// Mock data
const MOCK_MATERIALS: Array<LessonGeneratorOutput & { type: MaterialType; author: string; downloads: number }> = [
  {
    id: '1',
    topic: 'Biologia',
    title: 'Fotosynteza - Jak rośliny produkują energię',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 8.5,
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'lesson',
    author: 'Jan Kowalski',
    downloads: 245,
  },
  {
    id: '2',
    topic: 'Matematyka',
    title: 'Równania liniowe - praktyczne zastosowania',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 7.8,
    generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'test',
    author: 'Maria Nowak',
    downloads: 128,
  },
  {
    id: '3',
    topic: 'Historia',
    title: 'Polska w średniowieczu',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 8.2,
    generatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'presentation',
    author: 'Piotr Włodarczyk',
    downloads: 312,
  },
  {
    id: '4',
    topic: 'Chemia',
    title: 'Okresowy układ pierwiastków',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 7.5,
    generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'worksheet',
    author: 'Anna Lewandowska',
    downloads: 89,
  },
  {
    id: '5',
    topic: 'Język angielski',
    title: 'Present Perfect - Gramatyka i ćwiczenia',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 8.0,
    generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'quiz',
    author: 'Susan Johnson',
    downloads: 201,
  },
  {
    id: '6',
    topic: 'Fizyka',
    title: 'Siła dośrodkowa i ruch jednostajny po okręgu',
    content: '',
    objectives: [],
    activities: [],
    assessment: '',
    materials: [],
    qualityScore: 8.7,
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'published',
    type: 'lesson',
    author: 'Dr. Adam Lewand',
    downloads: 156,
  },
]

const MATERIAL_TYPES = ['lesson', 'syllabus', 'quiz', 'test', 'worksheet', 'presentation'] as const

export default function LibraryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [sortBy, setSortBy] = useState('recent')

  const filteredMaterials = useMemo(() => {
    let result = MOCK_MATERIALS

    if (searchQuery) {
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedType) {
      result = result.filter((m) => m.type === selectedType)
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
        break
      case 'popular':
        result.sort((a, b) => b.downloads - a.downloads)
        break
      case 'quality':
        result.sort((a, b) => b.qualityScore - a.qualityScore)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
        break
      default:
        break
    }

    return result
  }, [searchQuery, selectedType, sortBy])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Biblioteka materiałów</h1>
            <p className="mt-1 text-gray-600">
              Przeglądaj, wyszukuj i dziel się materiałami edukacyjnymi
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  placeholder="Szukaj po tytule, temacie lub autorze..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Select
                  options={[
                    { value: '', label: 'Wszystkie typy' },
                    ...MATERIAL_TYPES.map((type) => ({
                      value: type,
                      label: type.charAt(0).toUpperCase() + type.slice(1),
                    })),
                  ]}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                />

                <Select
                  options={[
                    { value: 'recent', label: 'Najnowsze' },
                    { value: 'popular', label: 'Najpopularniejsze' },
                    { value: 'quality', label: 'Najwyższa jakość' },
                    { value: 'title', label: 'Alfabetycznie' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-600">
                Znaleziono {filteredMaterials.length} materiał{filteredMaterials.length !== 1 ? 'ów' : ''}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                id={material.id}
                title={material.title}
                description={material.topic}
                type={material.type}
                author={material.author}
                createdAt={material.generatedAt.toISOString()}
                rating={material.qualityScore}
                downloads={material.downloads}
                onSelect={(id) => navigate(`/lesson/${id}`)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Nie znaleziono materiałów spełniających kryteria wyszukiwania.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('')
                  setSortBy('recent')
                }}
                className="mt-4"
              >
                Wyczyść filtry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
