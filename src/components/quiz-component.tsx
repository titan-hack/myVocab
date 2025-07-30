'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react'

interface QuizQuestion {
  id: string
  word: string
  definition: string
  example?: string
  difficulty: number
}

interface QuizResult {
  vocabularyId: string
  correct: boolean
  timeTaken: number
}

interface QuizComponentProps {
  onStartQuiz: () => Promise<QuizQuestion[]>
  onSubmitQuiz: (results: QuizResult[], timeSpent: number) => Promise<void>
}

export default function QuizComponent({ onStartQuiz, onSubmitQuiz }: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)
  const [questionTimes, setQuestionTimes] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const startQuiz = async () => {
    setLoading(true)
    try {
      const quizQuestions = await onStartQuiz()
      if (quizQuestions.length === 0) {
        alert('No vocabulary available for quiz. Add some words first!')
        return
      }
      
      setQuestions(quizQuestions)
      setCurrentQuestion(0)
      setUserAnswers(new Array(quizQuestions.length).fill(''))
      setShowResults(false)
      setIsQuizActive(true)
      setStartTime(Date.now())
      setQuestionStartTime(Date.now())
      setQuestionTimes(new Array(quizQuestions.length).fill(0))
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to start quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = (answer: string) => {
    if (!isQuizActive || !questionStartTime) return

    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answer
    setUserAnswers(newAnswers)

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
    const newTimes = [...questionTimes]
    newTimes[currentQuestion] = timeTaken
    setQuestionTimes(newTimes)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setQuestionStartTime(Date.now())
    } else {
      finishQuiz(newAnswers, newTimes)
    }
  }

  const finishQuiz = async (answers: string[], times: number[]) => {
    const results = questions.map((question, index) => ({
      vocabularyId: question.id,
      correct: answers[index].toLowerCase().trim() === question.word.toLowerCase().trim(),
      timeTaken: times[index]
    }))

    const totalTime = Math.round((Date.now() - (startTime || Date.now())) / 1000)

    try {
      await onSubmitQuiz(results, totalTime)
      setShowResults(true)
      setIsQuizActive(false)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to save quiz results. Please try again.')
    }
  }

  const calculateScore = () => {
    if (!questions.length || !userAnswers.length) return 0
    const correct = questions.reduce((count, question, index) => {
      return count + (userAnswers[index].toLowerCase().trim() === question.word.toLowerCase().trim() ? 1 : 0)
    }, 0)
    return Math.round((correct / questions.length) * 100)
  }

  const resetQuiz = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setUserAnswers([])
    setShowResults(false)
    setIsQuizActive(false)
    setStartTime(null)
    setQuestionStartTime(null)
    setQuestionTimes([])
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading quiz...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isQuizActive && !showResults) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Vocabulary Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Test your vocabulary knowledge with our optimized quiz algorithm. 
              Words are selected based on your progress and difficulty level.
            </p>
            <Button onClick={startQuiz} size="lg" className="w-full">
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const correctCount = questions.filter((q, i) => 
      userAnswers[i].toLowerCase().trim() === q.word.toLowerCase().trim()
    ).length

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl font-bold text-primary">{score}%</div>
              <div className="text-muted-foreground">
                {correctCount} / {questions.length} correct
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => {
                const isCorrect = userAnswers[index].toLowerCase().trim() === question.word.toLowerCase().trim()
                return (
                  <Card key={question.id} className={`p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            Level {question.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {questionTimes[index]}s
                          </span>
                        </div>
                        <p className="font-medium mb-1">{question.definition}</p>
                        {question.example && (
                          <p className="text-sm italic text-muted-foreground mb-2">
                            "{question.example}"
                          </p>
                        )}
                        <div className="text-sm">
                          <span className="text-muted-foreground">Your answer:</span> 
                          <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {userAnswers[index] || '(no answer)'}
                          </span>
                          {!isCorrect && (
                            <span className="text-muted-foreground ml-2">
                              → Correct: <span className="font-medium">{question.word}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            
            <div className="flex gap-4">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <Button onClick={startQuiz} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isQuizActive && questions.length > 0) {
    const currentQ = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <Badge variant="outline">Level {currentQ.difficulty}</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">{currentQ.definition}</p>
              {currentQ.example && (
                <p className="text-muted-foreground italic">
                  Example: "{currentQ.example}"
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                What is the word?
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type the word here..."
                value={userAnswers[currentQuestion]}
                onChange={(e) => {
                  const newAnswers = [...userAnswers]
                  newAnswers[currentQuestion] = e.target.value
                  setUserAnswers(newAnswers)
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswers[currentQuestion].trim()) {
                    handleAnswerSubmit(userAnswers[currentQuestion])
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleAnswerSubmit(userAnswers[currentQuestion])}
                disabled={!userAnswers[currentQuestion].trim()}
                className="flex-1"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
              {currentQuestion < questions.length - 1 && (
                <Button
                  variant="outline"
                  onClick={() => handleAnswerSubmit('')}
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}