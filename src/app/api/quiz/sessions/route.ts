import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('GET /api/quiz/sessions - Starting request')
    
    // Get or create default user
    let user = await db.user.findUnique({
      where: { email: 'default@example.com' }
    })

    if (!user) {
      console.log('GET /api/quiz/sessions - Creating default user')
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User'
        }
      })
    }

    console.log('GET /api/quiz/sessions - Fetching sessions for user:', user.id)
    const sessions = await db.quizSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 50 // Limit to last 50 sessions
    })

    console.log('GET /api/quiz/sessions - Found sessions:', sessions.length)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('GET /api/quiz/sessions - Error:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz sessions', details: error.message }, { status: 500 })
  }
}