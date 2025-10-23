"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Beaker, BarChart3 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FacultyCard from "@/components/faculty-card"
import AddFacultyDialog from "@/components/add-faculty-dialog"
import { useAuth } from "@/contexts/auth-context"
import { facultyService, type Faculty } from "@/lib/services/faculty.service"
import { toast } from "sonner"

const initialFacultyData = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    title: "Director, R&D Center",
    department: "Computer Science",
    image: "/placeholder.svg?height=300&width=300",
    email: "rajesh.kumar@manavrachna.edu.in",
    phone: "+91-9876543210",
    office: "Block A, Room 301",
    specialization: ["Artificial Intelligence", "Machine Learning", "Data Science"],
    experience: "15+ years",
    education: "Ph.D. in Computer Science, IIT Delhi",
    researchInterests: ["AI in Healthcare", "Natural Language Processing", "Computer Vision"],
    publications: "50+ research papers",
    projects: ["Smart Healthcare System", "AI-powered Education Platform"],
    webProfile: {
      personalStatement:
        "I am passionate about advancing the field of artificial intelligence through innovative research and mentoring the next generation of researchers. My work focuses on creating AI systems that are not only powerful but also ethical and explainable.",
      website: "https://rajeshkumar.manavrachna.edu.in",
      biography:
        "With 15+ years in academia and research, I have dedicated my career to pushing the boundaries of artificial intelligence. My journey began with a fascination for solving complex problems, which led me to pursue advanced degrees and eventually join the R&D center at Manav Rachna University.",
      teachingPhilosophy:
        "I believe in hands-on learning and encourage students to think critically about real-world applications of AI. My approach combines theoretical foundations with practical experience, preparing students for both academic and industry careers.",
      achievements: [
        "Published 5 papers in top-tier AI journals this year",
        "Received research grant of ₹50 lakhs for healthcare AI project",
        "Mentored 8 students who won national AI competitions",
      ],
      collaborationInterests:
        "I'm actively seeking collaborations in interdisciplinary research projects, particularly those that combine AI with healthcare, education, and sustainable technologies. Open to both academic partnerships and industry collaborations.",
    },
    analytics: {
      profileViews: 892,
      contactClicks: 45,
      projectViews: 234,
      lastUpdated: "2025-01-20T10:30:00Z",
    },
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    title: "Associate Professor",
    department: "Electronics & Communication",
    image: "/placeholder.svg?height=300&width=300",
    email: "priya.sharma@manavrachna.edu.in",
    phone: "+91-9876543211",
    office: "Block B, Room 205",
    specialization: ["IoT Systems", "Embedded Systems", "Wireless Communication"],
    experience: "12+ years",
    education: "Ph.D. in Electronics Engineering, IIT Bombay",
    researchInterests: ["Smart Cities", "Industrial IoT", "5G Networks"],
    publications: "35+ research papers",
    projects: ["Smart Campus Initiative", "Industrial Automation System"],
    webProfile: {
      personalStatement:
        "My research interests lie in the development of IoT systems and wireless communication technologies. I am committed to creating solutions that enhance connectivity and efficiency in urban environments.",
      website: "https://priyasharma.manavrachna.edu.in",
      biography:
        "With over a decade of experience in electronics engineering, I have contributed significantly to the advancement of IoT and wireless communication technologies. My work has been recognized through numerous publications and industry awards.",
      teachingPhilosophy:
        "I focus on fostering a collaborative learning environment where students can explore cutting-edge technologies and develop practical skills. My teaching approach emphasizes innovation and problem-solving.",
      achievements: [
        "Led the development of a smart city project that won the Smart India Hackathon",
        "Published 10 papers on IoT and wireless communication",
        "Received a gold medal for excellence in research",
      ],
      collaborationInterests:
        "I am open to collaborations that aim to improve urban infrastructure and enhance communication networks. Academic and industry partnerships are welcome.",
    },
    analytics: {
      profileViews: 567,
      contactClicks: 32,
      projectViews: 189,
      lastUpdated: "2025-01-19T14:20:00Z",
    },
  },
  {
    id: "3",
    name: "Dr. Amit Verma",
    title: "Professor",
    department: "Mechanical Engineering",
    image: "/placeholder.svg?height=300&width=300",
    email: "amit.verma@manavrachna.edu.in",
    phone: "+91-9876543212",
    office: "Block C, Room 102",
    specialization: ["Renewable Energy", "Thermal Engineering", "Sustainable Design"],
    experience: "18+ years",
    education: "Ph.D. in Mechanical Engineering, IIT Kanpur",
    researchInterests: ["Solar Energy Systems", "Green Manufacturing", "Energy Efficiency"],
    publications: "60+ research papers",
    projects: ["Solar Power Optimization", "Green Building Design"],
    webProfile: {
      personalStatement:
        "I am dedicated to sustainable design and renewable energy solutions. My research aims to reduce environmental impact and improve energy efficiency in various applications.",
      website: "https://amitverma.manavrachna.edu.in",
      biography:
        "With 18 years of experience in mechanical engineering, I have been at the forefront of renewable energy and sustainable design research. My work has been instrumental in developing innovative solutions for energy optimization.",
      teachingPhilosophy:
        "My teaching philosophy is centered around sustainability and innovation. I encourage students to think creatively and develop solutions that address real-world challenges.",
      achievements: [
        "Published 20 papers on renewable energy and sustainable design",
        "Received a grant of ₹1 crore for a green manufacturing project",
        "Awarded the Best Researcher in Sustainable Design",
      ],
      collaborationInterests:
        "I am interested in collaborations that focus on renewable energy sources and sustainable manufacturing practices. Both academic and industry partnerships are welcome.",
    },
    analytics: {
      profileViews: 423,
      contactClicks: 28,
      projectViews: 156,
      lastUpdated: "2025-01-18T09:15:00Z",
    },
  },
  {
    id: "4",
    name: "Dr. Neha Gupta",
    title: "Assistant Professor",
    department: "Biotechnology",
    image: "/placeholder.svg?height=300&width=300",
    email: "neha.gupta@manavrachna.edu.in",
    phone: "+91-9876543213",
    office: "Block D, Room 401",
    specialization: ["Genetic Engineering", "Bioinformatics", "Molecular Biology"],
    experience: "8+ years",
    education: "Ph.D. in Biotechnology, JNU Delhi",
    researchInterests: ["Gene Therapy", "Personalized Medicine", "Biomarker Discovery"],
    publications: "25+ research papers",
    projects: ["Cancer Biomarker Research", "Gene Editing Applications"],
    webProfile: {
      personalStatement:
        "My research focuses on genetic engineering and personalized medicine. I am passionate about developing treatments that are tailored to individual patient needs.",
      website: "https://nehagupta.manavrachna.edu.in",
      biography:
        "With 8 years of experience in biotechnology, I have made significant contributions to the fields of genetic engineering and personalized medicine. My work has been recognized through several research grants and publications.",
      teachingPhilosophy:
        "I believe in a student-centered approach to teaching biotechnology. My goal is to inspire students to pursue careers in research and innovation.",
      achievements: [
        "Published 15 papers on genetic engineering and personalized medicine",
        "Received a grant of ₹20 lakhs for a gene therapy project",
        "Mentored 5 students who won national biotechnology competitions",
      ],
      collaborationInterests:
        "I am interested in collaborations that aim to advance genetic engineering and personalized medicine. Academic and industry partnerships are welcome.",
    },
    analytics: {
      profileViews: 389,
      contactClicks: 24,
      projectViews: 134,
      lastUpdated: "2025-01-17T16:45:00Z",
    },
  },
  {
    id: "5",
    name: "Dr. Suresh Patel",
    title: "Associate Professor",
    department: "Civil Engineering",
    image: "/placeholder.svg?height=300&width=300",
    email: "suresh.patel@manavrachna.edu.in",
    phone: "+91-9876543214",
    office: "Block E, Room 303",
    specialization: ["Structural Engineering", "Smart Materials", "Earthquake Engineering"],
    experience: "14+ years",
    education: "Ph.D. in Civil Engineering, IIT Roorkee",
    researchInterests: ["Seismic Design", "Infrastructure Resilience", "Sustainable Construction"],
    publications: "40+ research papers",
    projects: ["Earthquake-Resistant Buildings", "Smart Infrastructure Monitoring"],
    webProfile: {
      personalStatement:
        "My research is dedicated to improving the resilience of infrastructure and developing smart materials for sustainable construction. I am committed to creating safer and more efficient buildings.",
      website: "https://sureshpatel.manavrachna.edu.in",
      biography:
        "With 14 years of experience in civil engineering, I have focused on structural engineering and sustainable construction. My work has been recognized through numerous publications and awards.",
      teachingPhilosophy:
        "I believe in a hands-on approach to teaching civil engineering, emphasizing practical applications and problem-solving skills.",
      achievements: [
        "Published 12 papers on structural engineering and smart materials",
        "Received a grant of ₹30 lakhs for a sustainable construction project",
        "Awarded the Best Civil Engineer in India",
      ],
      collaborationInterests:
        "I am open to collaborations that aim to enhance infrastructure resilience and promote sustainable construction practices. Academic and industry partnerships are welcome.",
    },
    analytics: {
      profileViews: 312,
      contactClicks: 18,
      projectViews: 98,
      lastUpdated: "2025-01-16T11:30:00Z",
    },
  },
  {
    id: "6",
    name: "Dr. Kavita Singh",
    title: "Professor",
    department: "Chemistry",
    image: "/placeholder.svg?height=300&width=300",
    email: "kavita.singh@manavrachna.edu.in",
    phone: "+91-9876543215",
    office: "Block F, Room 201",
    specialization: ["Organic Chemistry", "Drug Discovery", "Green Chemistry"],
    experience: "16+ years",
    education: "Ph.D. in Chemistry, University of Delhi",
    researchInterests: ["Pharmaceutical Chemistry", "Environmental Chemistry", "Catalysis"],
    publications: "55+ research papers",
    projects: ["Novel Drug Synthesis", "Green Catalytic Processes"],
    webProfile: {
      personalStatement:
        "I am dedicated to drug discovery and green chemistry. My research aims to develop new drugs and sustainable chemical processes that benefit society.",
      website: "https://kavitasingh.manavrachna.edu.in",
      biography:
        "With 16 years of experience in chemistry, I have made significant contributions to drug discovery and green chemistry. My work has been recognized through numerous research grants and publications.",
      teachingPhilosophy:
        "My teaching philosophy is centered around innovation and sustainability. I encourage students to think creatively and develop solutions that address real-world challenges.",
      achievements: [
        "Published 18 papers on drug discovery and green chemistry",
        "Received a grant of ₹40 lakhs for a drug discovery project",
        "Awarded the Best Chemist in India",
      ],
      collaborationInterests:
        "I am interested in collaborations that focus on drug discovery and sustainable chemical processes. Both academic and industry partnerships are welcome.",
    },
    analytics: {
      profileViews: 264,
      contactClicks: 9,
      projectViews: 87,
      lastUpdated: "2025-01-15T13:20:00Z",
    },
  },
]

export default function FacultyPage() {
  const { user } = useAuth()
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load faculty from Supabase on component mount
  useEffect(() => {
    loadFaculty()
  }, [])

  const loadFaculty = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await facultyService.getAll()
      
      if (error) {
        console.error('Error loading faculty:', error)
        toast.error('Failed to load faculty members')
        setFacultyList([])
      } else {
        setFacultyList(data || [])
      }
    } catch (error) {
      console.error('Error loading faculty:', error)
      toast.error('Failed to load faculty members')
    } finally {
      setIsLoaded(true)
      setIsLoading(false)
    }
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

  if (!isLoaded || isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading faculty members...</div>
          </div>
        </div>
      </div>
    )
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
