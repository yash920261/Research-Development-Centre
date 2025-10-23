"use client"

import {
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Globe,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import EditFacultyDialog from "@/components/edit-faculty-dialog"
import { useAuth } from "@/contexts/auth-context"

interface FacultyCardProps {
  id?: string
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
  analytics?: {
    profileViews: number
    contactClicks: number
    projectViews: number
    lastUpdated: string
  }
  onEdit?: (facultyData: any) => void
  onDelete?: (facultyId: string) => void
}

export default function FacultyCard({
  id,
  name,
  title,
  department,
  image,
  email,
  phone,
  office,
  specialization,
  experience,
  education,
  researchInterests,
  publications,
  projects,
  webProfile,
  analytics,
  onEdit,
  onDelete,
}: FacultyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuth()

  const facultyData = {
    id,
    name,
    title,
    department,
    image,
    email,
    phone,
    office,
    specialization,
    experience,
    education,
    researchInterests,
    publications,
    projects,
    webProfile,
    analytics,
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      onDelete?.(id || "")
    }
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-amber-100"
            />
          </div>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="text-amber-600 font-medium">{title}</CardDescription>
          <Badge variant="outline" className="w-fit mx-auto mt-2">
            {department}
          </Badge>
          {user?.role === "admin" && analytics && (
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {analytics.profileViews} views
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {analytics.contactClicks} contacts
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-3 mt-4">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{office}</span>
              </div>
              <div className="flex items-center text-sm">
                <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs">{education}</span>
              </div>
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{experience}</span>
              </div>
            </TabsContent>

            <TabsContent value="research" className="space-y-3 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Specialization</h4>
                <div className="flex flex-wrap gap-1">
                  {specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Research Interests</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {researchInterests.map((interest, index) => (
                    <li key={index}>• {interest}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs">{publications}</span>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-3 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Current Projects</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {projects.map((project, index) => (
                    <li key={index}>• {project}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center text-sm pt-2">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs">Available for student mentorship</span>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-3 mt-4">
              <div className="flex items-center mb-2">
                <Globe className="h-4 w-4 mr-2 text-amber-600" />
                <h4 className="text-sm font-semibold">Web Profile</h4>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  {webProfile?.personalStatement ||
                    `"I am passionate about advancing the field of ${specialization[0]?.toLowerCase()} through innovative research and mentoring the next generation of researchers."`}
                </p>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                  <Globe className="h-3 w-3 mr-1" />
                  {webProfile?.website ? "Visit Personal Website" : "View Research Profile"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4 border-t pt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Extended Biography</h4>
                <p className="text-xs text-muted-foreground">
                  {webProfile?.biography ||
                    `With ${experience} in academia and research, I have dedicated my career to pushing the boundaries of ${specialization[0]?.toLowerCase()}. My journey began with a fascination for solving complex problems, which led me to pursue advanced degrees and eventually join the R&D center at Manav Rachna University.`}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Teaching Philosophy</h4>
                <p className="text-xs text-muted-foreground">
                  {webProfile?.teachingPhilosophy ||
                    "I believe in hands-on learning and encourage students to think critically about real-world applications of their studies. My approach combines theoretical foundations with practical experience, preparing students for both academic and industry careers."}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Recent Achievements</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {webProfile?.achievements?.map((achievement, index) => <li key={index}>• {achievement}</li>) || (
                    <>
                      <li>• Published 5 papers in top-tier journals this year</li>
                      <li>• Received research grant of ₹25 lakhs for innovative project</li>
                      <li>• Mentored 3 students who won national research competitions</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Collaboration Interests</h4>
                <p className="text-xs text-muted-foreground">
                  {webProfile?.collaborationInterests ||
                    `I'm actively seeking collaborations in interdisciplinary research projects, particularly those that combine ${specialization.slice(0, 2).join(" and ").toLowerCase()} with other emerging technologies. Open to both academic partnerships and industry collaborations.`}
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>

        <CardFooter className="pt-4">
          <div className="flex gap-2 w-full">
            <Button size="sm" className="flex-1">
              <Mail className="h-3 w-3 mr-1" />
              Contact
            </Button>
            <Link href={`/faculty/${id}`}>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                View Profile
              </Button>
            </Link>
            {user?.role === "admin" && onEdit && <EditFacultyDialog faculty={facultyData} onEditFaculty={onEdit} />}
            {user?.role === "admin" && onDelete && (
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardFooter>
      </Card>
    </Collapsible>
  )
}
