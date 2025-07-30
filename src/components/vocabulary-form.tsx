'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'

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

interface VocabularyFormProps {
  onAdd: (vocab: any) => void
  onEdit: (id: string, vocab: any) => void
  onDelete: (id: string) => void
  vocabularies: Vocabulary[]
}

export default function VocabularyForm({ onAdd, onEdit, onDelete, vocabularies }: VocabularyFormProps) {
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    example: '',
    category: '',
    difficulty: 1
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.word.trim() || !formData.definition.trim()) return

    try {
      if (editingId) {
        await onEdit(editingId, formData)
        setEditingId(null)
      } else {
        await onAdd(formData)
      }
      
      setFormData({
        word: '',
        definition: '',
        example: '',
        category: '',
        difficulty: 1
      })
      setIsExpanded(false)
    } catch (error) {
      console.error('Error saving vocabulary:', error)
    }
  }

  const handleEdit = (vocab: Vocabulary) => {
    setFormData({
      word: vocab.word,
      definition: vocab.definition,
      example: vocab.example || '',
      category: vocab.category || '',
      difficulty: vocab.difficulty
    })
    setEditingId(vocab.id)
    setIsExpanded(true)
  }

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800']
    return colors[difficulty - 1] || colors[0]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Vocabulary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
            variant={isExpanded ? "outline" : "default"}
            className="w-full"
          >
            {isExpanded ? 'Cancel' : 'Add Vocabulary'}
          </Button>
          
          {isExpanded && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Word *</label>
                  <Input
                    value={formData.word}
                    onChange={(e) => setFormData({...formData, word: e.target.value})}
                    placeholder="Enter word"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Business, Science, Daily"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Definition *</label>
                <Textarea
                  value={formData.definition}
                  onChange={(e) => setFormData({...formData, definition: e.target.value})}
                  placeholder="Enter definition"
                  required
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Example</label>
                <Textarea
                  value={formData.example}
                  onChange={(e) => setFormData({...formData, example: e.target.value})}
                  placeholder="Enter example sentence"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <Select value={formData.difficulty.toString()} onValueChange={(value) => setFormData({...formData, difficulty: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Easy</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - Hard</SelectItem>
                    <SelectItem value="5">5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                {editingId ? 'Update Vocabulary' : 'Add Vocabulary'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Vocabulary ({vocabularies.length})</h3>
        
        {vocabularies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No vocabulary added yet. Start by adding your first word!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {vocabularies.map((vocab) => (
              <Card key={vocab.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{vocab.word}</h4>
                      <Badge className={getDifficultyColor(vocab.difficulty)}>
                        Level {vocab.difficulty}
                      </Badge>
                      {vocab.category && (
                        <Badge variant="outline">{vocab.category}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{vocab.definition}</p>
                    {vocab.example && (
                      <p className="text-sm italic text-muted-foreground">
                        Example: "{vocab.example}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Added: {new Date(vocab.createdAt).toLocaleDateString()}</span>
                      {vocab.progress && vocab.progress[0] && (
                        <span>Progress: Level {vocab.progress[0].level}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(vocab)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(vocab.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}