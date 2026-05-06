'use client'

import {useState} from 'react'
import {Navigation} from '@/components/navigation'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Search, MapPin, Heart} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock data - replace with actual database queries
const mockBoulders = [
  {
    id: '1',
    name: 'Crimpy Corner',
    color: 'Blue',
    grade: '6b',
    sector: 'Main Wall - Sector A',
    imageUrl: '/images/achterkantMuur.jpg',
    tags: ['Technical', 'Crimps'],
    likes: 12,
    isActive: true,
  },
  {
    id: '2',
    name: 'Overhang Beast',
    color: 'Red',
    grade: '7b',
    sector: 'Overhang Zone - Sector B',
    imageUrl: '/images/muurNaastOverhang.jpg',
    tags: ['Power', 'Dynamic'],
    likes: 24,
    isActive: true,
  },
  {
    id: '3',
    name: 'Slab Master',
    color: 'Green',
    grade: '6a',
    sector: 'Slab Section - Sector A',
    imageUrl: '/images/muurTegenInkom.jpg',
    tags: ['Balance', 'Footwork'],
    likes: 8,
    isActive: true,
  },
  {
    id: '4',
    name: 'Jug Haul',
    color: 'Yellow',
    grade: '4',
    sector: 'Main Wall - Sector B',
    imageUrl: '/images/trainingMuur.jpg',
    tags: ['Beginner', 'Endurance'],
    likes: 15,
    isActive: true,
  },
  {
    id: '5',
    name: 'Pinch Paradise',
    color: 'Purple',
    grade: '7a',
    sector: 'Cave Area - Sector A',
    imageUrl: '/images/naastAchterkantMuur.jpg',
    tags: ['Pinches', 'Technical'],
    likes: 19,
    isActive: true,
  },
  {
    id: '6',
    name: 'Dynamic Flow',
    color: 'Orange',
    grade: '6c',
    sector: 'Overhang Zone - Sector A',
    imageUrl: '/images/achterkantMuur.jpg',
    tags: ['Dynamic', 'Coordination'],
    likes: 21,
    isActive: true,
  },
]

const colors = ['All', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Black', 'White']
const grades = ['All', '3', '4', '5', '6a', '6b', '6c', '7a', '7b']
const sectors = [
  'All',
  'Main Wall - Sector A',
  'Main Wall - Sector B',
  'Overhang Zone - Sector A',
  'Overhang Zone - Sector B',
  'Slab Section - Sector A',
  'Cave Area - Sector A',
]
const allTags = [
  'Technical',
  'Power',
  'Dynamic',
  'Balance',
  'Footwork',
  'Crimps',
  'Pinches',
  'Beginner',
  'Endurance',
  'Coordination',
]

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

export default function BouldersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState('All')
  const [selectedGrade, setSelectedGrade] = useState('All')
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')

  const filteredBoulders = mockBoulders.filter(boulder => {
    const matchesSearch = boulder.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesColor = selectedColor === 'All' || boulder.color === selectedColor
    const matchesGrade = selectedGrade === 'All' || boulder.grade === selectedGrade
    const matchesSector = selectedSector === 'All' || boulder.sector === selectedSector
    const matchesTag = selectedTag === 'All' || boulder.tags.includes(selectedTag)

    return matchesSearch && matchesColor && matchesGrade && matchesSector && matchesTag
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Boulder Problems</h1>
          <p className="text-muted-foreground">
            Browse and filter through our collection of {mockBoulders.length} active boulders
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search boulder names..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger id="tag">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedColor !== 'All' ||
              selectedGrade !== 'All' ||
              selectedSector !== 'All' ||
              selectedTag !== 'All' ||
              searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedColor('All')
                  setSelectedGrade('All')
                  setSelectedSector('All')
                  setSelectedTag('All')
                }}>
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredBoulders.length}</span> boulder
            {filteredBoulders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Boulder Grid */}
        {filteredBoulders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No boulders found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoulders.map(boulder => (
              <Card key={boulder.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden relative rounded-xl">
                  <Image
                    src={boulder.imageUrl || '/placeholder.svg'}
                    alt={boulder.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full ${colorClasses[boulder.color]} border-2 border-white shadow-md`}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{boulder.name}</CardTitle>
                    <Badge variant="secondary" className="font-semibold">
                      {boulder.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{boulder.sector}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {boulder.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{boulder.likes}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/boulders/${boulder.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
