import Link from "next/link"
import { FileText, Lightbulb, MessageSquare, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForumCategoryList() {
  const categories = [
    {
      id: "research-methodologies",
      title: "Research Methodologies",
      description: "Discuss research approaches, methodologies, and best practices.",
      icon: "FileText",
      topics: 18,
      posts: 243,
    },
    {
      id: "technology-innovation",
      title: "Technology & Innovation",
      description: "Share the latest tech trends and innovative solutions.",
      icon: "Lightbulb",
      topics: 24,
      posts: 367,
    },
    {
      id: "collaboration-opportunities",
      title: "Collaboration Opportunities",
      description: "Find team members and collaborators for your research projects.",
      icon: "Users",
      topics: 12,
      posts: 156,
    },
    {
      id: "academic-resources",
      title: "Academic Resources",
      description: "Share and discover helpful academic resources and tools.",
      icon: "FileText",
      topics: 15,
      posts: 189,
    },
    {
      id: "career-development",
      title: "Career Development",
      description: "Discuss career paths, internships, and professional development.",
      icon: "Users",
      topics: 20,
      posts: 278,
    },
    {
      id: "interdisciplinary-research",
      title: "Interdisciplinary Research",
      description: "Explore research that crosses traditional disciplinary boundaries.",
      icon: "Lightbulb",
      topics: 14,
      posts: 203,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        // Determine which icon to use
        const IconComponent =
          category.icon === "FileText" ? FileText : category.icon === "Lightbulb" ? Lightbulb : Users

        return (
          <Link href={`/forum/category/${category.id}`} key={category.id}>
            <Card className="h-full hover:border-amber-300 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <IconComponent className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription className="mt-1.5">{category.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{category.topics} topics</span>
                  </div>
                  <div>
                    <span>{category.posts} posts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
