import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('GET /api/vocabulary - Starting request')
    const vocabularies = await db.vocabulary.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        progress: true
      }
    })
    console.log('GET /api/vocabulary - Found vocabularies:', vocabularies.length)
    return NextResponse.json(vocabularies)
  } catch (error) {
    console.error('GET /api/vocabulary - Error:', error)
    return NextResponse.json({ error: 'Failed to fetch vocabularies', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/vocabulary - Starting request')
    const body = await request.json()
    console.log('POST /api/vocabulary - Request body:', body)
    
    const { word, definition, example, category, difficulty } = body

    if (!word || !definition) {
      return NextResponse.json({ error: 'Word and definition are required' }, { status: 400 })
    }

    // Ensure a default user exists
    console.log('POST /api/vocabulary - Looking for default user')
    let user = await db.user.findUnique({
      where: { email: 'default@example.com' }
    })

    if (!user) {
      console.log('POST /api/vocabulary - Creating default user')
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User'
        }
      })
      console.log('POST /api/vocabulary - Created user:', user.id)
    }

    console.log('POST /api/vocabulary - Creating vocabulary')
    const vocabulary = await db.vocabulary.create({
      data: {
        word,
        definition,
        example,
        category,
        difficulty: difficulty || 1,
        userId: user.id
      },
      include: {
        progress: true
      }
    })

    console.log('POST /api/vocabulary - Created vocabulary:', vocabulary.id)
    return NextResponse.json(vocabulary)
  } catch (error) {
    console.error('POST /api/vocabulary - Error:', error)
    return NextResponse.json({ error: 'Failed to create vocabulary', details: error.message }, { status: 500 })
  }
}