import { NextRequest, NextResponse } from 'next/server'

interface VideoResult {
  id: string
  title: string
  url: string
  source: 'youtube' | 'khan' | 'vimeo'
  duration: number
  relevanceScore: number
}

// Mock video data for demonstration
const mockVideos: Record<string, VideoResult[]> = {
  'równania kwadratowe': [
    {
      id: 'yt1',
      title: 'Khan Academy: Solving Quadratic Equations',
      url: 'https://www.youtube.com/watch?v=example1',
      source: 'youtube',
      duration: 12,
      relevanceScore: 95
    },
    {
      id: 'khan1',
      title: 'Quadratic Formula Explained',
      url: 'https://www.khanacademy.org/example',
      source: 'khan',
      duration: 8,
      relevanceScore: 92
    },
    {
      id: 'yt2',
      title: 'How to Solve Quadratic Equations - Complete Guide',
      url: 'https://www.youtube.com/watch?v=example2',
      source: 'youtube',
      duration: 15,
      relevanceScore: 88
    }
  ],
  'fotosynteza': [
    {
      id: 'khan2',
      title: 'Photosynthesis Overview',
      url: 'https://www.khanacademy.org/photosynthesis',
      source: 'khan',
      duration: 10,
      relevanceScore: 94
    },
    {
      id: 'yt3',
      title: 'Photosynthesis for Beginners',
      url: 'https://www.youtube.com/watch?v=photosynthesis',
      source: 'youtube',
      duration: 13,
      relevanceScore: 89
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, sources = ['youtube', 'khan'], limit = 5 } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Normalize query for lookup
    const normalizedQuery = query.toLowerCase()

    // Get mock videos for this query
    let results: VideoResult[] = mockVideos[normalizedQuery] || []

    // If no exact match, create generic results
    if (results.length === 0) {
      results = [
        {
          id: 'gen1',
          title: `${query} - Khan Academy`,
          url: `https://www.khanacademy.org/search?q=${encodeURIComponent(query)}`,
          source: 'khan',
          duration: 10,
          relevanceScore: 85
        },
        {
          id: 'gen2',
          title: `${query} - Full Explanation`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          source: 'youtube',
          duration: 12,
          relevanceScore: 82
        },
        {
          id: 'gen3',
          title: `Understanding ${query}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' explained')}`,
          source: 'youtube',
          duration: 15,
          relevanceScore: 80
        }
      ]
    }

    // Filter by requested sources
    const filtered = results
      .filter(v => sources.includes(v.source))
      .slice(0, limit)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: filtered,
        total: filtered.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
    console.error('Error in search-videos:', error)
    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    )
  }
}
