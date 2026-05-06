'use client'

import type React from 'react'
import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Textarea} from '@/components/ui/textarea'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Separator} from '@/components/ui/separator'
import {Heart, MapPin, Calendar, User, Send, Video, ArrowLeft} from 'lucide-react'
import Link from 'next/link'

const colorClasses: Record<string, string> = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Orange: 'bg-orange-500',
  Purple: 'bg-purple-500',
  Black: 'bg-gray-900',
  White: 'bg-gray-100',
}

interface Comment {
  id: string
  userId: string
  username: string
  body: string
  createdAt: string
  avatar: string | null
}

interface Boulder {
  id: string
  name: string
  color: string
  grade: string
  sector: string
  wall: string
  imageUrl: string
  videoUrl: string | null
  tags: string[]
  setBy: string
  setDate: string
  isActive: boolean
  likes: number
  isLiked: boolean
  posX: number
  posY: number
}

export function BoulderDetailClient({boulder, mockComments}: {boulder: Boulder | undefined; mockComments: Comment[]}) {
  const [isLiked, setIsLiked] = useState(boulder?.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(boulder?.likes ?? 0)
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState('')

  if (!boulder) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Boulder not found</h1>
        <Button asChild>
          <Link href="/boulders">Back to Boulders</Link>
        </Button>
      </div>
    )
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    // TODO: Implement actual like API call
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: `${Date.now()}`,
      userId: 'current_user',
      username: 'you',
      body: newComment,
      createdAt: new Date().toISOString(),
      avatar: null,
    }

    setComments([...comments, comment])
    setNewComment('')
    // TODO: Implement actual comment API call
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/boulders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Boulders
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Media */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={boulder.imageUrl || '/placeholder.svg'}
                alt={boulder.name}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute top-4 left-4 w-12 h-12 rounded-full ${colorClasses[boulder.color]} border-2 border-white shadow-lg`}
              />
            </div>
          </Card>

          {boulder.videoUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Video available</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{boulder.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{boulder.sector}</span>
                </div>
              </div>
              <Badge className="text-lg px-4 py-2">{boulder.grade}</Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {boulder.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              <Button variant={isLiked ? 'default' : 'outline'} size="sm" onClick={handleLike}>
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount} Likes
              </Button>
              <div className="text-sm text-muted-foreground">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </div>
            </div>

            <Separator />

            {/* Boulder Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Boulder Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wall</span>
                  <span className="font-medium">{boulder.wall}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sector</span>
                  <span className="font-medium">{boulder.sector}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Color</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${colorClasses[boulder.color]}`} />
                    <span className="font-medium">{boulder.color}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Set by</span>
                  <span className="font-medium">{boulder.setBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Set on</span>
                  <span className="font-medium">{formatDate(boulder.setDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
          <CardDescription>Share your thoughts and tips about this boulder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={!newComment.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Post Comment
            </Button>
          </form>

          <Separator />

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.avatar || undefined} />
                    <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
