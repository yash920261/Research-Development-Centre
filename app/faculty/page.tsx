"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Beaker, BarChart3, RefreshCw } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FacultyCard from "@/components/faculty-card"
import AddFacultyDialog from "@/components/add-faculty-dialog"
import { useAuth } from "@/contexts/auth-context"
import { facultyService, type Faculty } from "@/lib/services/faculty.service"
import { toast } from "sonner"

export default function FacultyPage() {
  const { user } = useAuth()
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Load faculty from Supabase on component mount
  useEffect(() => {
    loadFaculty()
  }, [retryCount])

  const loadFaculty = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔍 Fetching faculty data...')
      const { data, error } = await facultyService.getAll()
      
      if (error) {
        console.error('Error loading faculty:', error)
        setError('Failed to load faculty members. Please try again.')
        toast.error('Failed to load faculty members')
      } else {
        console.log('✅ Faculty data loaded:', data?.length || 0, 'records')
        setFacultyList(data || [])
      }
    } catch (error) {
      console.error('Error loading faculty:', error)
      setError('Failed to load faculty members. Please try again.')
      toast.error('Failed to load faculty members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  const handleAddFaculty = (newFaculty: Faculty) => {
    setFacultyList(prev => [newFaculty, ...prev])
  }

  const handleEditFaculty = (editedFaculty: Faculty) => {
    setFacultyList(prev => prev.map(faculty =>
      faculty.id === editedFaculty.id ? editedFaculty : faculty
    ))
  }

  const handleDeleteFaculty = (facultyId: string) => {
    setFacultyList(prev => prev.filter(faculty => faculty.id !== facultyId))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <Beaker className="h-5 w-5" />
            <span>Manav Rachna R&D Center</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/#projects" className="text-sm font-medium hover:underline underline-offset-4">
              Projects
            </Link>
            <Link href="/forum" className="text-sm font-medium hover:underline underline-offset-4">
              Forum
            </Link>
            <Link href="/faculty" className="text-sm font-medium hover:underline underline-offset-4 text-amber-600">
              Faculty
            </Link>
            <Link href="/#submit" className="text-sm font-medium hover:underline underline-offset-4">
              Submit
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-background">
                <Link href="/" className="flex items-center text-sm hover:text-foreground text-background">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </Link>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-background">Our Faculty</h1>
                    <p className="max-w-[700px] md:text-xl text-background">
                      Meet the distinguished faculty members who guide and mentor students in their research endeavors
                      at the Manav Rachna R&D Center.
                    </p>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Link href="/admin/analytics">
                        <Button variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </Link>
                      <AddFacultyDialog onAddFaculty={handleAddFaculty} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                  <Input type="search" placeholder="Search faculty..." className="w-full bg-background" />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            {/* Show loading indicator inline instead of blocking the whole page */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                  <p className="text-lg">Loading faculty members...</p>
                </div>
              </div>
            )}

            {/* Show error message with retry option */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <div className="text-red-500 mb-4">
                    <p className="text-lg font-medium">Unable to load faculty members</p>
                    <p className="text-muted-foreground mt-2">{error}</p>
                  </div>
                  <Button onClick={handleRetry} className="mt-4">
                    <RefreshCw className={`mr-2 h-4 w-4 ${retryCount > 0 ? 'animate-spin' : ''}`} />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Show faculty grid when data is loaded and no error */}
            {!isLoading && !error && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {facultyList.map((faculty) => {
                  // Map database structure to component props
                  const facultyProps = {
                    ...faculty,
                    researchInterests: faculty.research_interests,
                    webProfile: {
                      personalStatement: faculty.web_profile?.personal_statement || undefined,
                      website: faculty.web_profile?.website || undefined,
                      biography: faculty.web_profile?.biography || undefined,
                      teachingPhilosophy: faculty.web_profile?.teaching_philosophy || undefined,
                      achievements: faculty.web_profile?.achievements || [],
                      collaborationInterests: faculty.web_profile?.collaboration_interests || undefined,
                    },
                    analytics: {
                      profileViews: faculty.analytics?.profile_views || 0,
                      contactClicks: faculty.analytics?.contact_clicks || 0,
                      projectViews: faculty.analytics?.project_views || 0,
                      lastUpdated: faculty.analytics?.last_updated || new Date().toISOString(),
                    }
                  }
                  return (
                    <FacultyCard key={faculty.id} {...facultyProps} onEdit={handleEditFaculty} onDelete={handleDeleteFaculty} />
                  )
                })}
              </div>
            )}

            {/* Show empty state when no faculty and no errors */}
            {!isLoading && !error && facultyList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">No faculty members found</p>
                  <p className="text-muted-foreground mt-2">Check back later for updates</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="w-full py-12 bg-amber-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Join Our Faculty</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                Are you a passionate researcher looking to make an impact? We're always looking for talented faculty
                members to join our R&D center.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button>View Open Positions</Button>
                <Button variant="outline">Faculty Application Process</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Manav Rachna R&D Center. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
