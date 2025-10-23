"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, Users, GraduationCap, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { facultyService, type Faculty as FacultyDB } from "@/lib/services/faculty.service"
import { toast } from "sonner"

interface Faculty {
  id: string
  name: string
  title: string
  department: string
  image: string
  email: string
  phone: string
  office: string
  specialization: string[]
  experience: string
  education: string
  researchInterests: string[]
  publications: string
  projects: string[]
  webProfile?: {
    personalStatement?: string
    website?: string
    biography?: string
    teachingPhilosophy?: string
    achievements?: string[]
    collaborationInterests?: string
  }
}

export default function FacultyDetailPage() {
  const params = useParams()
  const facultyId = params.id as string
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from Supabase
    const loadFaculty = async () => {
      try {
        const { data, error } = await facultyService.getById(facultyId)
        
        if (error) {
          console.error('Error loading faculty:', error)
          toast.error('Failed to load faculty member')
          setFaculty(null)
        } else if (data) {
          // Map database structure to component format
          setFaculty({
            ...data,
            researchInterests: data.research_interests,
            webProfile: {
              personalStatement: data.web_profile?.personal_statement || undefined,
              website: data.web_profile?.website || undefined,
              biography: data.web_profile?.biography || undefined,
              teachingPhilosophy: data.web_profile?.teaching_philosophy || undefined,
              achievements: data.web_profile?.achievements || [],
              collaborationInterests: data.web_profile?.collaboration_interests || undefined,
            }
          })
          
          // Increment view analytics
          await facultyService.incrementAnalytics(facultyId, 'profile_views')
        } else {
          setFaculty(null)
        }
      } catch (error) {
        console.error('Error loading faculty:', error)
        toast.error('Failed to load faculty member')
      } finally {
        setLoading(false)
      }
    }
    
    loadFaculty()
  }, [facultyId])

  if (loading) {
    return (
      <div className="container py-10">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Link href="/faculty" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Faculty
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Faculty member not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/faculty" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Faculty
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-6">
                <img
                  src={faculty.image || "/placeholder.svg"}
                  alt={faculty.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                />
                <div>
                  <CardTitle className="text-2xl">{faculty.name}</CardTitle>
                  <CardDescription className="text-amber-600 font-medium text-lg">{faculty.title}</CardDescription>
                  <Badge variant="outline" className="mt-2">
                    {faculty.department}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground">
                {faculty.webProfile?.biography ||
                  `${faculty.name} is a distinguished researcher and educator with ${faculty.experience} of experience. They are dedicated to advancing their field and mentoring the next generation of researchers.`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic & Research Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="research">
                <TabsList className="mb-4">
                  <TabsTrigger value="research">Research</TabsTrigger>
                  <TabsTrigger value="teaching">Teaching</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="research" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Research Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {faculty.researchInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Specialization</h3>
                    <div className="flex flex-wrap gap-2">
                      {faculty.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="bg-amber-50 text-background">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center text-lg">
                    <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                    <span className="font-semibold">{faculty.publications}</span>
                  </div>
                </TabsContent>

                <TabsContent value="teaching" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Teaching Philosophy</h3>
                  <p className="text-muted-foreground">
                    {faculty.webProfile?.teachingPhilosophy ||
                      "Dedicated to fostering a collaborative learning environment where students can explore cutting-edge technologies and develop practical skills."}
                  </p>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Current Research Projects</h3>
                  <div className="space-y-4">
                    {faculty.projects.map((project, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <h4 className="font-medium">{project}</h4>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Recent Achievements</h3>
                  <ul className="space-y-2">
                    {faculty.webProfile?.achievements && faculty.webProfile.achievements.length > 0 ? (
                      faculty.webProfile.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <Award className="h-4 w-4 mr-2 text-amber-600 mt-0.5" />
                          <span>{achievement}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No achievements listed.</p>
                    )}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm break-all">{faculty.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{faculty.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{faculty.office}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <span className="text-sm">{faculty.education}</span>
              </div>
              <div className="flex items-start">
                <Award className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <span className="text-sm">{faculty.experience}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faculty.webProfile?.personalStatement && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Personal Statement</h4>
                  <p className="text-sm text-muted-foreground">{faculty.webProfile.personalStatement}</p>
                </div>
              )}

              {faculty.webProfile?.collaborationInterests && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Collaboration Interests</h4>
                  <p className="text-sm text-muted-foreground">{faculty.webProfile.collaborationInterests}</p>
                </div>
              )}

              {faculty.webProfile?.website && (
                <Button className="w-full" asChild>
                  <a href={faculty.webProfile.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Personal Website
                  </a>
                </Button>
              )}

              <Button className="w-full bg-transparent" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact Faculty
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Mentorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Available for research guidance</span>
              </div>
              <p className="text-sm text-foreground">
                Interested in research opportunities? Reach out to discuss potential collaboration and mentorship.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
