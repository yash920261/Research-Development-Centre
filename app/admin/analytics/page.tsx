"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Beaker, Users, Eye, Mail, TrendingUp, Download, MessageSquare, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { analyticsService, type AnalyticsOverview, type FacultyAnalytics, type DepartmentStats } from "@/lib/services/analytics.service"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalFaculty: 6,
    totalViews: 2847,
    totalContacts: 156,
    avgViewsPerFaculty: 474,
  },
  facultyStats: [
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      department: "Computer Science",
      profileViews: 892,
      contactClicks: 45,
      projectViews: 234,
      lastActive: "2025-01-20",
      trend: "+12%",
    },
    {
      id: "2",
      name: "Dr. Priya Sharma",
      department: "Electronics & Communication",
      profileViews: 567,
      contactClicks: 32,
      projectViews: 189,
      lastActive: "2025-01-19",
      trend: "+8%",
    },
    {
      id: "3",
      name: "Dr. Amit Verma",
      department: "Mechanical Engineering",
      profileViews: 423,
      contactClicks: 28,
      projectViews: 156,
      lastActive: "2025-01-18",
      trend: "+5%",
    },
    {
      id: "4",
      name: "Dr. Neha Gupta",
      department: "Biotechnology",
      profileViews: 389,
      contactClicks: 24,
      projectViews: 134,
      lastActive: "2025-01-17",
      trend: "+15%",
    },
    {
      id: "5",
      name: "Dr. Suresh Patel",
      department: "Civil Engineering",
      profileViews: 312,
      contactClicks: 18,
      projectViews: 98,
      lastActive: "2025-01-16",
      trend: "+3%",
    },
    {
      id: "6",
      name: "Dr. Kavita Singh",
      department: "Chemistry",
      profileViews: 264,
      contactClicks: 9,
      projectViews: 87,
      lastActive: "2025-01-15",
      trend: "-2%",
    },
  ],
  monthlyViews: [
    { month: "Jul", views: 1200, contacts: 45 },
    { month: "Aug", views: 1450, contacts: 52 },
    { month: "Sep", views: 1680, contacts: 61 },
    { month: "Oct", views: 1890, contacts: 68 },
    { month: "Nov", views: 2150, contacts: 74 },
    { month: "Dec", views: 2380, contacts: 82 },
    { month: "Jan", views: 2847, contacts: 156 },
  ],
  departmentStats: [
    { name: "Computer Science", value: 892, color: "#8884d8" },
    { name: "Electronics & Communication", value: 567, color: "#82ca9d" },
    { name: "Mechanical Engineering", value: 423, color: "#ffc658" },
    { name: "Biotechnology", value: 389, color: "#ff7300" },
    { name: "Civil Engineering", value: 312, color: "#00ff00" },
    { name: "Chemistry", value: 264, color: "#ff0000" },
  ],
}

// Color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000', '#0088FE', '#00C49F']

export default function FacultyAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  
  // State for analytics data
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [facultyAnalytics, setFacultyAnalytics] = useState<FacultyAnalytics[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0 })
  
  // Load analytics data only after auth is loaded and user is admin
  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true)
      
      const [overviewRes, facultyRes, deptRes, contactRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getFacultyAnalytics(),
        analyticsService.getDepartmentStats(),
        analyticsService.getContactMessagesCount(),
      ])
      
      if (overviewRes.data) setOverview(overviewRes.data)
      if (facultyRes.data) setFacultyAnalytics(facultyRes.data)
      if (deptRes.data) setDepartmentStats(deptRes.data)
      if (!contactRes.error) setContactStats({ total: contactRes.total, unread: contactRes.unread })
      
      setLoading(false)
    }
    
    if (!authLoading && user?.role === 'admin') {
      loadAnalytics()
    }
  }, [authLoading, user])

  // Redirect if not admin (only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      window.location.href = "/"
    }
  }, [authLoading, user])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied only after auth is loaded
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Beaker className="h-5 w-5 text-amber-400" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground">
              Home
            </Link>
            <Link
              href="/admin/analytics"
              className="text-sm font-medium text-amber-400"
            >
              Analytics
            </Link>
            <Link
              href="/admin/projects"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Submissions
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Link href="/faculty" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Faculty
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Faculty Analytics</h1>
                  <p className="max-w-[700px] text-gray-600 md:text-xl">
                    Monitor faculty profile performance and engagement metrics.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : overview?.totalFaculty || 0}</div>
                  <p className="text-xs text-muted-foreground">Active faculty members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : (overview?.totalViews || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All faculty profiles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : contactStats.total}</div>
                  <p className="text-xs text-muted-foreground">{contactStats.unread} unread messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : overview?.totalProjectSubmissions || 0}</div>
                  <p className="text-xs text-muted-foreground">Total submissions</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="faculty">Faculty Performance</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Profile Views</CardTitle>
                      <CardDescription>Faculty profile views over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockAnalyticsData.monthlyViews}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Department Distribution</CardTitle>
                      <CardDescription>Profile views by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={departmentStats.map((dept, index) => ({
                              ...dept,
                              color: COLORS[index % COLORS.length]
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                          >
                            {departmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="faculty" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Faculty Performance</CardTitle>
                    <CardDescription>Individual faculty member analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : facultyAnalytics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No faculty data available</div>
                    ) : (
                      <div className="space-y-4">
                        {facultyAnalytics.map((faculty) => (
                          <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-semibold">{faculty.name}</h3>
                                  <p className="text-sm text-muted-foreground">{faculty.department}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-semibold">{faculty.profileViews}</div>
                                <div className="text-muted-foreground">Views</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{faculty.contactClicks}</div>
                                <div className="text-muted-foreground">Contacts</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{faculty.projectViews}</div>
                                <div className="text-muted-foreground">Projects</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{new Date(faculty.lastUpdated).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">Updated</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>Profile views by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={departmentStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Forum & Engagement Stats</CardTitle>
                    <CardDescription>Community engagement overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Forum Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overview?.totalForumTopics || 0}</div>
                          <p className="text-xs text-muted-foreground">Total discussions</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Forum Replies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overview?.totalForumReplies || 0}</div>
                          <p className="text-xs text-muted-foreground">Total responses</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overview?.totalForumTopics ? 
                              ((overview.totalForumReplies / overview.totalForumTopics) * 100).toFixed(1) : 
                              0}%
                          </div>
                          <p className="text-xs text-muted-foreground">Replies per topic</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Manav Rachna R&D Center. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
