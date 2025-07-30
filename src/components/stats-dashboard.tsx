'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Brain,
  Calendar,
  Award
} from 'lucide-react'

interface Vocabulary {
  id: string
  word: string
  definition: string
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

interface StatsDashboardProps {
  vocabularies: Vocabulary[]
  quizSessions: QuizSession[]
}

export default function StatsDashboard({ vocabularies, quizSessions }: StatsDashboardProps) {
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    averageAccuracy: 0,
    totalStudyTime: 0,
    wordsByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentAccuracy: 0,
    streakDays: 0
  })

  useEffect(() => {
    const calculateStats = () => {
      // Basic stats
      const totalWords = vocabularies.length
      const masteredWords = vocabularies.filter(v => 
        v.progress && v.progress[0] && v.progress[0].level >= 4
      ).length

      // Calculate accuracy from quiz sessions
      const totalQuestions = quizSessions.reduce((sum, session) => sum + session.totalQuestions, 0)
      const totalCorrect = quizSessions.reduce((sum, session) => sum + session.score, 0)
      const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

      // Total study time in minutes
      const totalStudyTime = Math.round(quizSessions.reduce((sum, session) => sum + session.timeSpent, 0) / 60)

      // Words by difficulty level
      const wordsByLevel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      vocabularies.forEach(v => {
        if (v.difficulty >= 1 && v.difficulty <= 5) {
          wordsByLevel[v.difficulty as keyof typeof wordsByLevel]++
        }
      })

      // Recent accuracy (last 5 sessions)
      const recentSessions = quizSessions.slice(-5)
      const recentQuestions = recentSessions.reduce((sum, session) => sum + session.totalQuestions, 0)
      const recentCorrect = recentSessions.reduce((sum, session) => sum + session.score, 0)
      const recentAccuracy = recentQuestions > 0 ? Math.round((recentCorrect / recentQuestions) * 100) : 0

      // Simple streak calculation (sessions in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentSessionsCount = quizSessions.filter(session => 
        new Date(session.completedAt) >= sevenDaysAgo
      ).length
      const streakDays = Math.min(recentSessionsCount, 7)

      setStats({
        totalWords,
        masteredWords,
        averageAccuracy,
        totalStudyTime,
        wordsByLevel,
        recentAccuracy,
        streakDays
      })
    }

    calculateStats()
  }, [vocabularies, quizSessions])

  const getLevelColor = (level: number) => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500']
    return colors[level - 1] || colors[0]
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords}</div>
            <p className="text-xs text-muted-foreground">
              {stats.masteredWords} mastered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(stats.averageAccuracy)}`}>
              {stats.averageAccuracy}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recent: {stats.recentAccuracy}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyTime}m</div>
            <p className="text-xs text-muted-foreground">
              Total time spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              Days active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Words by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.wordsByLevel).map(([level, count]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {level}</span>
                  <span className="text-sm text-muted-foreground">{count} words</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getLevelColor(parseInt(level))}`}
                    style={{ 
                      width: `${stats.totalWords > 0 ? (count / stats.totalWords) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quiz sessions yet</p>
                <p className="text-sm">Start learning to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {quizSessions.slice(-5).reverse().map((session) => {
                  const accuracy = Math.round((session.score / session.totalQuestions) * 100)
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getAccuracyColor(accuracy).replace('text', 'bg')}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {session.score}/{session.totalQuestions} correct
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                          {accuracy}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(session.timeSpent / 60)}m
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalWords > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((stats.masteredWords / stats.totalWords) * 100)}%
                </span>
              </div>
              <Progress 
                value={(stats.masteredWords / stats.totalWords) * 100} 
                className="w-full" 
              />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{stats.masteredWords}</div>
                  <div className="text-xs text-muted-foreground">Mastered</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">
                    {vocabularies.filter(v => v.progress && v.progress[0] && v.progress[0].level >= 2 && v.progress[0].level < 4).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Learning</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {vocabularies.filter(v => !v.progress || !v.progress[0]).length}
                  </div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}