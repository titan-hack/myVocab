'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import VocabularyForm from '@/components/vocabulary-form'
import QuizComponent from '@/components/quiz-component'
import StatsDashboard from '@/components/stats-dashboard'
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  Plus,
  Sparkles,
  Target
} from 'lucide-react'

interface Vocabulary {
  id: string
  word: string
  definition: string
  example?: string
  category?: string
  difficulty: number
  createdAt: string
  progress?: any[]
}

interface QuizSession {
  id: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
}

export default function Home() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vocabResponse, sessionsResponse] = await Promise.all([
        fetch('/api/vocabulary'),
        fetch('/api/quiz/sessions')
      ])

      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json()
        setVocabularies(vocabData)
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setQuizSessions(sessionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVocabulary = async (vocabData: any) => {
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vocabData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add vocabulary')
      }

      await fetchData()
    } catch (error) {
      console.error('Error adding vocabulary:', error)
      alert(`Failed to add vocabulary: ${error.message}`)
    }
  }

  const handleEditVocabulary = async (id: string, vocabData: any) => {
    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vocabData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update vocabulary')
      }

      await fetchData()
    } catch (error) {
      console.error('Error updating vocabulary:', error)
      alert(`Failed to update vocabulary: ${error.message}`)
    }
  }

  const handleDeleteVocabulary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary?')) return

    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete vocabulary')
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting vocabulary:', error)
      alert(`Failed to delete vocabulary: ${error.message}`)
    }
  }

  const handleStartQuiz = async () => {
    try {
      const response = await fetch('/api/quiz')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch quiz questions')
      }
      return await response.json()
    } catch (error) {
      console.error('Error starting quiz:', error)
      throw error
    }
  }

  const handleSubmitQuiz = async (results: any[], timeSpent: number) => {
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, timeSpent })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save quiz results')
      }

      await fetchData()
    } catch (error) {
      console.error('Error submitting quiz:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Brain className="w-10 h-10 text-primary" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VocabMaster
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master vocabulary through intelligent spaced repetition and engaging quizzes. 
            Add words, practice daily, and watch your vocabulary grow!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{vocabularies.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Review</p>
                  <p className="text-2xl font-bold">
                    {vocabularies.filter(v => !v.progress || !v.progress[0]).length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quiz Sessions</p>
                  <p className="text-2xl font-bold">{quizSessions.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="learn" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-6">
            <VocabularyForm
              onAdd={handleAddVocabulary}
              onEdit={handleEditVocabulary}
              onDelete={handleDeleteVocabulary}
              vocabularies={vocabularies}
            />
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <QuizComponent
              onStartQuiz={handleStartQuiz}
              onSubmitQuiz={handleSubmitQuiz}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <StatsDashboard
              vocabularies={vocabularies}
              quizSessions={quizSessions}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        {vocabularies.length === 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Start Your Vocabulary Journey!</h3>
              <p className="mb-4 opacity-90">
                Add your first vocabulary word to begin learning with our intelligent spaced repetition system.
              </p>
              <Button 
                onClick={() => document.querySelector('[value="learn"]')?.click()}
                variant="secondary"
                size="lg"
              >
                Add Your First Word
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}