import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get or create default user
    let user = await db.user.findUnique({
      where: { email: 'default@example.com' }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User'
        }
      })
    }

    // Get vocabularies that are due for review
    const now = new Date()
    const vocabularies = await db.vocabulary.findMany({
      where: {
        userId: user.id,
        OR: [
          { progress: { nextReview: { lte: now } } },
          { progress: { is: null } } // Never studied before
        ]
      },
      include: {
        progress: true
      },
      orderBy: [
        { progress: { level: 'asc' } },
        { difficulty: 'asc' }
      ],
      take: 10 // Limit to 10 questions per quiz
    })

    return NextResponse.json(vocabularies)
  } catch (error) {
    console.error('Error fetching quiz questions:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { results, timeSpent } = body

    // Get or create default user
    let user = await db.user.findUnique({
      where: { email: 'default@example.com' }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User'
        }
      })
    }

    // Create quiz session
    const session = await db.quizSession.create({
      data: {
        userId: user.id,
        score: results.filter((r: any) => r.correct).length,
        totalQuestions: results.length,
        timeSpent
      }
    })

    // Create quiz results and update progress
    for (const result of results) {
      await db.quizResult.create({
        data: {
          sessionId: session.id,
          vocabularyId: result.vocabularyId,
          correct: result.correct,
          timeTaken: result.timeTaken
        }
      })

      // Update user progress with spaced repetition
      const existingProgress = await db.userProgress.findUnique({
        where: {
          userId_vocabularyId: {
            userId: user.id,
            vocabularyId: result.vocabularyId
          }
        }
      })

      if (existingProgress) {
        const newLevel = result.correct 
          ? Math.min(existingProgress.level + 1, 5) // Max level 5
          : Math.max(existingProgress.level - 1, 1) // Min level 1

        const nextReview = new Date()
        const intervals = [1, 3, 7, 14, 30] // Days based on level
        nextReview.setDate(nextReview.getDate() + intervals[newLevel - 1])

        await db.userProgress.update({
          where: { id: existingProgress.id },
          data: {
            level: newLevel,
            nextReview,
            correctCount: result.correct ? existingProgress.correctCount + 1 : existingProgress.correctCount,
            totalCount: existingProgress.totalCount + 1
          }
        })
      } else {
        const nextReview = new Date()
        nextReview.setDate(nextReview.getDate() + 1) // First review in 1 day

        await db.userProgress.create({
          data: {
            userId: user.id,
            vocabularyId: result.vocabularyId,
            level: result.correct ? 2 : 1,
            nextReview,
            correctCount: result.correct ? 1 : 0,
            totalCount: 1
          }
        })
      }
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error saving quiz results:', error)
    return NextResponse.json({ error: 'Failed to save quiz results', details: error.message }, { status: 500 })
  }
}