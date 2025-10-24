"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Beaker, 
  FileText, 
  Mail, 
  Calendar, 
  User, 
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { projectService, type ProjectSubmission } from "@/lib/services/project.service"
import { toast } from "sonner"
import ReplyDialog from "@/components/reply-dialog"

export default function AdminProjectsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)

  // Load projects only after auth is loaded and user is admin
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      loadProjects()
    }
  }, [authLoading, user])

  // Filter projects
  useEffect(() => {
    let filtered = projects

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.project_title.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.project_description.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((p) => p.department === departmentFilter)
    }

    setFilteredProjects(filtered)
  }, [searchQuery, statusFilter, departmentFilter, projects])

  // Redirect if not admin (only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      window.location.href = "/"
    }
  }, [authLoading, user])

  async function loadProjects() {
    setLoading(true)
    try {
      const { data, error } = await projectService.getAll()

      if (error) {
        console.error("Error loading projects:", error)
        toast.error("Failed to load project submissions")
        setProjects([])
        setFilteredProjects([])
      } else {
        setProjects(data || [])
        setFilteredProjects(data || [])
      }
    } catch (error) {
      console.error("Exception loading projects:", error)
      toast.error("Failed to load project submissions")
      setProjects([])
      setFilteredProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(id: string, status: "pending" | "approved" | "rejected") {
    const { error } = await projectService.updateStatus(id, status)

    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success(`Project ${status}`)
      loadProjects()
    }
  }

  function handleReplyClick(project: ProjectSubmission) {
    setSelectedProject(project)
    setReplyDialogOpen(true)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-gray-900"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  function getStatusBadgeCardView(status: string) {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-white bg-gray-800 border-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  // Get unique departments
  const departments = Array.from(new Set(projects.map((p) => p.department)))

  // Statistics
  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    approved: projects.filter((p) => p.status === "approved").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
  }

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
      {/* Header */}
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
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              href="/admin/projects"
              className="text-sm font-medium text-amber-400"
            >
              Project Submissions
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Link
                  href="/"
                  className="flex items-center text-sm text-gray-600 hover:text-amber-600 mb-4"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </Link>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">
                  Project Submissions
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage and review student project ideas
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className="border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8 border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-amber-500" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, name, email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects View Tabs */}
            <Tabs defaultValue="cards" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger 
                    value="cards"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm"
                  >
                    Card View
                  </TabsTrigger>
                  <TabsTrigger 
                    value="table"
                    className="data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-900"
                  >
                    Table View
                  </TabsTrigger>
                </TabsList>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProjects.length} of {projects.length} submissions
                </p>
              </div>

              {/* Card View */}
              <TabsContent value="cards">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading submissions...</p>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No submissions found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{project.project_title}</CardTitle>
                            {getStatusBadgeCardView(project.status)}
                          </div>
                          <CardDescription className="line-clamp-3 mt-2">
                            {project.project_description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            <span>{project.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{project.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 mr-2" />
                            <span>{project.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                          {project.resources && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Resources Needed:</p>
                              <p className="text-sm line-clamp-2">{project.resources}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleReplyClick(project)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          {project.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(project.id, "approved")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(project.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Table View */}
              <TabsContent value="table">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading submissions...</p>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No submissions found</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-500/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-900">Project Title</TableHead>
                          <TableHead className="text-gray-900">Student</TableHead>
                          <TableHead className="text-gray-900">Department</TableHead>
                          <TableHead className="text-gray-900">Date</TableHead>
                          <TableHead className="text-gray-900">Status</TableHead>
                          <TableHead className="text-right text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium max-w-xs text-gray-900">
                              <div className="line-clamp-2">{project.project_title}</div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{project.name}</div>
                                <div className="text-xs text-gray-600 truncate max-w-[200px]">
                                  {project.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-900">{project.department}</TableCell>
                            <TableCell className="text-gray-900">
                              {new Date(project.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReplyClick(project)}
                                >
                                  <Mail className="h-4 w-4 text-gray-900" />
                                </Button>
                                {project.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => handleStatusUpdate(project.id, "approved")}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleStatusUpdate(project.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      {/* Reply Dialog */}
      {selectedProject && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          project={selectedProject}
        />
      )}
    </div>
  )
}
