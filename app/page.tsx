"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, FileText, GraduationCap, Lightbulb, MessageSquare, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import ClientHeader from "@/components/client-header"
import ProjectSubmissionForm from "@/components/project-submission-form"
import ContactForm from "@/components/contact-form"
import { forumService } from "@/lib/services/forum.service"
import type { ForumTopic } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    async function loadForumTopics() {
      console.log('🔍 Fetching forum topics...')
      const { data, error } = await forumService.getAllTopics()
      console.log('📊 Forum data:', data)
      console.log('❌ Forum error:', error)
      if (!error && data) {
        // Get the 3 most recent topics
        console.log('✅ Setting forum topics:', data.slice(0, 3))
        setForumTopics(data.slice(0, 3))
      } else {
        console.error('Failed to load forum topics:', error)
      }
    }
    loadForumTopics()
  }, [mounted])
  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <ClientHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    Manav Rachna R&D Center
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Where innovative ideas transform into groundbreaking projects. Discover student research and
                    contribute your own ideas.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#projects">
                    <Button className="px-8 bg-amber-500 hover:bg-amber-600 text-black">
                      Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#submit">
                    <Button
                      variant="outline"
                      className="px-8 border-amber-500 text-amber-400 hover:bg-amber-950/20 bg-transparent"
                    >
                      Submit Your Idea
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-xl opacity-20"></div>
                  <img
                    alt="Research and Development"
                    className="aspect-video overflow-hidden rounded-xl object-cover object-center relative border border-amber-500/30"
                    height="310"
                    src="/images/design-mode/image(1).png"
                    width="550"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-sm text-amber-400">
                  Why Choose Our R&D Center
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent py-1">
                  Empowering Student Innovation
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our center provides the resources, mentorship, and platform for students to turn their research ideas
                  into reality.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 p-6 rounded-lg bg-card border border-amber-500/10 hover:border-amber-500/30 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <BookOpen className="h-6 w-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Academic Excellence</h3>
                  <p className="text-muted-foreground">
                    Access to cutting-edge research facilities and academic resources to support your projects.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 p-6 rounded-lg bg-card border border-amber-500/10 hover:border-amber-500/30 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Users className="h-6 w-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Collaborative Environment</h3>
                  <p className="text-muted-foreground">
                    Connect with like-minded students and faculty mentors to collaborate on innovative projects.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 p-6 rounded-lg bg-card border border-amber-500/10 hover:border-amber-500/30 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <GraduationCap className="h-6 w-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Career Development</h3>
                  <p className="text-muted-foreground">
                    Showcase your work to potential employers and build a portfolio that stands out in your field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="w-full py-12 md:py-24 lg:py-32 bg-black/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Featured Projects
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover innovative research and development projects from our talented students.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI-Powered Crop Analysis",
                  department: "Agricultural Sciences",
                  student: "Maria Rodriguez",
                  description: "Using machine learning to analyze crop health and predict optimal harvest times.",
                },
                {
                  title: "Sustainable Urban Design",
                  department: "Architecture",
                  student: "James Chen",
                  description: "Developing eco-friendly urban planning solutions for growing metropolitan areas.",
                },
                {
                  title: "Quantum Computing Algorithm",
                  department: "Computer Science",
                  student: "Aisha Patel",
                  description: "Novel approach to optimization problems using quantum computing principles.",
                },
                {
                  title: "Biodegradable Plastics",
                  department: "Chemical Engineering",
                  student: "Carlos Mendez",
                  description: "Creating sustainable plastic alternatives from agricultural waste products.",
                },
                {
                  title: "Mental Health App",
                  department: "Psychology",
                  student: "Sarah Johnson",
                  description: "Mobile application for tracking and improving mental wellbeing among students.",
                },
                {
                  title: "Renewable Energy Storage",
                  department: "Electrical Engineering",
                  student: "David Kim",
                  description: "Innovative battery technology for efficient storage of solar and wind energy.",
                },
              ].map((project) => (
                <div
                  key={project.title}
                  className="flex flex-col overflow-hidden rounded-lg border border-amber-500/20 bg-card hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  <img
                    alt={project.title}
                    className="aspect-video w-full object-cover"
                    height="225"
                    src={`/.jpg?height=225&width=400&query=${project.title}`}
                    width="400"
                  />
                  <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-400 font-medium">{project.department}</span>
                      <span className="text-sm text-muted-foreground">by {project.student}</span>
                    </div>
                    <p className="text-muted-foreground">{project.description}</p>
                    <Button
                      variant="outline"
                      className="mt-2 bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
                    >
                      View Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Join the Conversation
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Connect with fellow researchers, share ideas, and collaborate in our student forums.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3">
              {forumTopics.length > 0 ? (
                // Real forum topics from database
                forumTopics.map((topic) => (
                  <Link href={`/forum/topic/${topic.id}`} key={topic.id}>
                    <div className="flex flex-col overflow-hidden rounded-lg border border-amber-500/20 bg-card hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all h-full">
                      <div className="flex flex-col space-y-1.5 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {topic.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold line-clamp-2">{topic.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">{topic.content}</p>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            <span>{topic.views || 0} views</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{topic.author_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // Fallback if no topics
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/forum">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  Visit Forums
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="submit" className="w-full py-12 md:py-24 lg:py-32 bg-black/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    Submit Your Project Idea
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Have an innovative research idea? Share it with us and get the support you need to bring it to life.
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg border border-amber-500/20 bg-card p-6 shadow-xl">
                <ProjectSubmissionForm />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Get in Touch
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Have questions about our R&D Center? We're here to help.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2">
              <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Contact Information</h3>
                  <p className="text-muted-foreground">Email: research@manavrachna.edu</p>
                  <p className="text-muted-foreground">Phone: (555) 123-4567</p>
                  <p className="text-muted-foreground">Address: Manav Rachna Campus, Delhi</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Office Hours</h3>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg border border-amber-500/20 bg-card p-6 shadow-xl">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-amber-500/20 py-6 md:py-0 bg-black/50">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Manav Rachna R&D Center. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
