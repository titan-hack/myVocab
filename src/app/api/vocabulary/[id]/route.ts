import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { word, definition, example, category, difficulty } = body

    const vocabulary = await db.vocabulary.update({
      where: { id: params.id },
      data: {
        word,
        definition,
        example,
        category,
        difficulty
      }
    })

    return NextResponse.json(vocabulary)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vocabulary' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.vocabulary.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vocabulary' }, { status: 500 })
  }
}