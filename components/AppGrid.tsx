'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Zap,
  TrendingUp,
  Crown,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

interface App {
  name: string
  category: string
  icon: string
  description: string
  price: string
  popular: boolean
  trending: boolean
  premium: boolean
}

const apps: App[] = [
  // Productivity & Design
  { name: 'Figma', category: 'Design', icon: '🎨', description: 'Collaborative design tool', price: '$12/mo', popular: true, trending: false, premium: false },
  { name: 'Notion', category: 'Productivity', icon: '📝', description: 'All-in-one workspace', price: '$8/mo', popular: true, trending: true, premium: false },
  { name: 'Canva', category: 'Design', icon: '🖼️', description: 'Graphic design platform', price: '$15/mo', popular: true, trending: false, premium: false },
  { name: 'Cursor', category: 'Development', icon: '💻', description: 'AI-powered code editor', price: '$20/mo', popular: false, trending: true, premium: true },
  { name: 'Grammarly', category: 'Writing', icon: '✍️', description: 'AI writing assistant', price: '$12/mo', popular: true, trending: false, premium: false },
  
  // Entertainment & Media
  { name: 'Netflix', category: 'Entertainment', icon: '🎬', description: 'Streaming movies & shows', price: '$15/mo', popular: true, trending: false, premium: false },
  { name: 'Spotify', category: 'Music', icon: '🎵', description: 'Music streaming service', price: '$10/mo', popular: true, trending: false, premium: false },
  { name: 'Apple Music', category: 'Music', icon: '🍎', description: 'Apple music streaming', price: '$10/mo', popular: true, trending: false, premium: false },
  { name: 'Apple TV+', category: 'Entertainment', icon: '📺', description: 'Apple original content', price: '$7/mo', popular: false, trending: false, premium: false },
  { name: 'HBO Max', category: 'Entertainment', icon: '🎭', description: 'HBO original series', price: '$15/mo', popular: true, trending: false, premium: false },
  { name: 'Prime Video', category: 'Entertainment', icon: '📦', description: 'Amazon video streaming', price: '$9/mo', popular: true, trending: false, premium: false },
  { name: 'Crunchyroll', category: 'Anime', icon: '🍥', description: 'Anime streaming platform', price: '$8/mo', popular: false, trending: true, premium: false },
  { name: 'Disney+', category: 'Entertainment', icon: '🏰', description: 'Disney family content', price: '$8/mo', popular: true, trending: false, premium: false },
  
  // Education & Learning
  { name: 'ChatGPT', category: 'AI', icon: '🤖', description: 'AI conversation assistant', price: '$20/mo', popular: true, trending: true, premium: true },
  { name: 'Coursera', category: 'Education', icon: '🎓', description: 'Online courses & degrees', price: '$39/mo', popular: true, trending: false, premium: false },
  { name: 'Udemy', category: 'Education', icon: '📚', description: 'Online learning platform', price: '$30/mo', popular: true, trending: false, premium: false },
  { name: 'MasterClass', category: 'Education', icon: '🎯', description: 'Learn from experts', price: '$15/mo', popular: false, trending: false, premium: true },
  { name: 'Skillshare', category: 'Education', icon: '🎨', description: 'Creative skills learning', price: '$19/mo', popular: true, trending: false, premium: false },
  { name: 'Duolingo', category: 'Language', icon: '🦉', description: 'Language learning app', price: '$7/mo', popular: true, trending: false, premium: false },
  { name: 'Codecademy', category: 'Programming', icon: '💻', description: 'Learn to code', price: '$20/mo', popular: true, trending: false, premium: false },
  { name: 'DataCamp', category: 'Data Science', icon: '📊', description: 'Data science courses', price: '$25/mo', popular: false, trending: true, premium: false },
  
  // AI & Tools
  { name: 'Perplexity', category: 'AI', icon: '🔍', description: 'AI search engine', price: '$20/mo', popular: false, trending: true, premium: true },
  { name: 'Claude', category: 'AI', icon: '🧠', description: 'Anthropic AI assistant', price: '$20/mo', popular: false, trending: true, premium: true },
  { name: 'Midjourney', category: 'AI', icon: '🎨', description: 'AI image generation', price: '$10/mo', popular: true, trending: false, premium: true },
  { name: 'Runway', category: 'AI', icon: '🎬', description: 'AI video editing', price: '$15/mo', popular: false, trending: true, premium: true },
  { name: 'Gamma', category: 'AI', icon: '📊', description: 'AI presentation maker', price: '$10/mo', popular: false, trending: true, premium: false },
  { name: 'Jasper', category: 'AI', icon: '✍️', description: 'AI content writing', price: '$39/mo', popular: true, trending: false, premium: true },
  
  // Development & Design
  { name: 'Adobe Creative Cloud', category: 'Design', icon: '🎨', description: 'Creative software suite', price: '$53/mo', popular: true, trending: false, premium: true },
  { name: 'Figma', category: 'Design', icon: '🎨', description: 'Collaborative design tool', price: '$12/mo', popular: true, trending: false, premium: false },
  { name: 'Sketch', category: 'Design', icon: '✏️', description: 'Digital design toolkit', price: '$9/mo', popular: false, trending: false, premium: false },
  { name: 'Framer', category: 'Design', icon: '🚀', description: 'Interactive design tool', price: '$20/mo', popular: false, trending: true, premium: false },
  { name: 'Webflow', category: 'Development', icon: '🌐', description: 'Visual web development', price: '$23/mo', popular: true, trending: false, premium: false },
  
  // Business & Productivity
  { name: 'Slack', category: 'Communication', icon: '💬', description: 'Team communication', price: '$8/mo', popular: true, trending: false, premium: false },
  { name: 'Zoom', category: 'Communication', icon: '📹', description: 'Video conferencing', price: '$15/mo', popular: true, trending: false, premium: false },
  { name: 'Microsoft 365', category: 'Productivity', icon: '📊', description: 'Office productivity suite', price: '$6/mo', popular: true, trending: false, premium: false },
  { name: 'Google Workspace', category: 'Productivity', icon: '📧', description: 'Google productivity tools', price: '$6/mo', popular: true, trending: false, premium: false },
  { name: 'Asana', category: 'Project Management', icon: '📋', description: 'Project management tool', price: '$11/mo', popular: true, trending: false, premium: false },
  { name: 'Trello', category: 'Project Management', icon: '📌', description: 'Visual project boards', price: '$5/mo', popular: true, trending: false, premium: false },
  
  // News & Research
  { name: 'The New York Times', category: 'News', icon: '📰', description: 'Digital news subscription', price: '$17/mo', popular: true, trending: false, premium: false },
  { name: 'The Wall Street Journal', category: 'News', icon: '📈', description: 'Business news & analysis', price: '$39/mo', popular: true, trending: false, premium: true },
  { name: 'Medium', category: 'Reading', icon: '📖', description: 'Quality articles & stories', price: '$5/mo', popular: true, trending: false, premium: false },
  { name: 'Blinkist', category: 'Reading', icon: '⚡', description: 'Book summaries & insights', price: '$8/mo', popular: false, trending: true, premium: false },
  
  // Health & Fitness
  { name: 'Headspace', category: 'Health', icon: '🧘', description: 'Meditation & mindfulness', price: '$13/mo', popular: true, trending: false, premium: false },
  { name: 'Calm', category: 'Health', icon: '🌊', description: 'Sleep & meditation app', price: '$15/mo', popular: true, trending: false, premium: false },
  { name: 'MyFitnessPal', category: 'Fitness', icon: '💪', description: 'Nutrition & fitness tracking', price: '$20/mo', popular: true, trending: false, premium: false },
  { name: 'Peloton', category: 'Fitness', icon: '🚴', description: 'Interactive fitness classes', price: '$44/mo', popular: true, trending: false, premium: true },
]

const categories = ['All', 'AI', 'Design', 'Entertainment', 'Education', 'Productivity', 'Development', 'Health', 'News']

export default function AppGrid() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular')

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.popular ? 1 : -1
      case 'trending':
        return b.trending ? 1 : -1
      case 'price-low':
        return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
      case 'price-high':
        return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''))
      default:
        return 0
    }
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pilih Aplikasi{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Favorit
            </span>{' '}
            Anda
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Lebih dari 50+ aplikasi SaaS populer siap untuk dipatungan. 
            Hemat hingga 90% dengan bergabung bersama teman-teman.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari aplikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={sortBy === 'popular' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
              className="transition-all duration-200 hover:scale-105"
            >
              <Star className="h-4 w-4 mr-2" />
              Populer
            </Button>
            <Button
              variant={sortBy === 'trending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('trending')}
              className="transition-all duration-200 hover:scale-105"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
            <Button
              variant={sortBy === 'price-low' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price-low')}
              className="transition-all duration-200 hover:scale-105"
            >
              Harga Terendah
            </Button>
            <Button
              variant={sortBy === 'price-high' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price-high')}
              className="transition-all duration-200 hover:scale-105"
            >
              Harga Tertinggi
            </Button>
          </div>
        </motion.div>

        {/* Apps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.name}
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary-200 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                        {app.name}
                      </h3>
                      <p className="text-sm text-gray-500">{app.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {app.popular && (
                      <Badge variant="primary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Populer
                      </Badge>
                    )}
                    {app.trending && (
                      <Badge variant="success" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {app.premium && (
                      <Badge variant="warning" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {app.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary-600">
                    {app.price}
                  </div>
                  <Button
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Patungan
                  </Button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Lihat Semua Aplikasi
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
