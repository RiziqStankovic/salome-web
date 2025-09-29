'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  Users, 
  Settings, 
  Search, 
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { groupAPI, adminAPI } from '@/lib/api'

interface Group {
  id: string
  name: string
  description?: string
  group_status: string
  current_members: number
  max_members: number
  created_at: string
  all_paid_at?: string
  owner: {
    id: string
    full_name: string
  }
  app: {
    name: string
    category: string
  }
}

interface GroupMember {
  id: string
  user_id: string
  group_id: string
  user_status: string
  joined_at: string
  paid_at?: string
  activated_at?: string
  expired_at?: string
  removed_at?: string
  removed_reason?: string
  user: {
    id: string
    full_name: string
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // User status constants
  const userStatuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'paid', label: 'Paid', color: 'blue' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'expired', label: 'Expired', color: 'red' },
    { value: 'removed', label: 'Removed', color: 'gray' }
  ]

  // Group status constants
  const groupStatuses = [
    { value: 'open', label: 'Open', color: 'green' },
    { value: 'private', label: 'Private', color: 'gray' },
    { value: 'full', label: 'Full', color: 'yellow' },
    { value: 'paid_group', label: 'Paid Group', color: 'blue' },
    { value: 'closed', label: 'Closed', color: 'red' }
  ]

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await groupAPI.getPublicGroups()
      setGroups(response.data.groups || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await groupAPI.getGroupMembers(groupId)
      setMembers(response.data.members || [])
    } catch (error) {
      console.error('Error fetching group members:', error)
    }
  }

  const updateUserStatus = async (userId: string, groupId: string, newStatus: string, reason?: string) => {
    try {
      await adminAPI.updateUserStatus({
        user_id: userId,
        group_id: groupId,
        new_status: newStatus,
        removed_reason: reason
      })
      
      // Refresh data
      if (selectedGroup) {
        fetchGroupMembers(selectedGroup)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const updateGroupStatus = async (groupId: string, newStatus: string) => {
    try {
      await adminAPI.updateGroupStatus({
        group_id: groupId,
        new_status: newStatus
      })
      
      // Refresh data
      fetchGroups()
    } catch (error) {
      console.error('Error updating group status:', error)
    }
  }

  const getStatusColor = (status: string, type: 'user' | 'group') => {
    const statuses = type === 'user' ? userStatuses : groupStatuses
    const statusInfo = statuses.find(s => s.value === status)
    return statusInfo?.color || 'gray'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'expired':
        return <XCircle className="h-4 w-4" />
      case 'removed':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = members.filter(member =>
    member.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600 dark:text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Admin Panel
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage user and group statuses
              </p>
            </div>
            <Button onClick={fetchGroups} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search groups or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="grid gap-4">
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription>
                            {group.app.name} • {group.current_members}/{group.max_members} members
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(group.group_status, 'group') as any}>
                            {group.group_status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedGroup(group.id)
                              fetchGroupMembers(group.id)
                            }}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            View Members
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Select
                            value={group.group_status}
                            onValueChange={(value: string) => updateGroupStatus(group.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {groupStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Created</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(group.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {group.all_paid_at && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Subscription Active:</strong> Started on {new Date(group.all_paid_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {selectedGroup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Group Members</h3>
                  <Button
                    variant="outline"
                    onClick={() => fetchGroupMembers(selectedGroup)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {filteredMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                              </div>
                              <div>
                                <h4 className="font-medium">{member.user.full_name}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {member.user.email}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  Joined: {new Date(member.joined_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <Badge variant={getStatusColor(member.user_status, 'user') as any}>
                                  {getStatusIcon(member.user_status)}
                                  <span className="ml-1">{member.user_status}</span>
                                </Badge>
                                {member.removed_reason && (
                                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                    Reason: {member.removed_reason}
                                  </p>
                                )}
                              </div>
                              <Select
                                value={member.user_status}
                                onValueChange={(value: string) => updateUserStatus(member.user_id, member.group_id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {userStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a Group
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a group from the Groups tab to view and manage its members
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
