"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, PlusCircle, Search, Beaker, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ForumTopicList from "@/components/forum-topic-list"
import ForumCategoryList from "@/components/forum-category-list"
import NewDiscussionForm from "@/components/new-discussion-form"
import { initializeForumData } from "@/lib/forum-data"
import { useAuth } from "@/contexts/auth-context"

export default function ForumPage() {
  const { user } = useAuth()
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    initializeForumData()
  }, [])

  const handleNewDiscussionSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleTopicDeleted = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <Beaker className="h-5 w-5" />
            <span>MANAV RACHNA R&D Center</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/#projects" className="text-sm font-medium hover:underline underline-offset-4">
              Projects
            </Link>
            <Link href="/forum" className="text-sm font-medium hover:underline underline-offset-4 text-amber-600">
              Forum
            </Link>
            <Link href="/faculty" className="text-sm font-medium hover:underline underline-offset-4">
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
            {user?.role === 'admin' && (
              <Link href="/admin/analytics" className="text-sm font-medium hover:underline underline-offset-4 flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4 text-background">
              <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center text-sm hover:text-foreground text-primary-foreground">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </Link>
              </div>
              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-background">Student Research Forums</h1>
                <p className="max-w-[700px] md:text-xl text-background">
                  Connect with fellow researchers, share ideas, and collaborate on innovative projects.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search discussions..."
                    className="w-full bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setNewDiscussionOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Discussion
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="p-6 my-0">
            <Tabs defaultValue="recent" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="recent" className="pt-6" key={`recent-${refreshKey}`}>
                <ForumTopicList sortBy="recent" searchQuery={searchQuery} onTopicDeleted={handleTopicDeleted} />
              </TabsContent>
              <TabsContent value="popular" className="pt-6" key={`popular-${refreshKey}`}>
                <ForumTopicList sortBy="popular" searchQuery={searchQuery} onTopicDeleted={handleTopicDeleted} />
              </TabsContent>
              <TabsContent value="categories" className="pt-6" key={`categories-${refreshKey}`}>
                <ForumCategoryList />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 University R&D Center. All rights reserved.
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

      <NewDiscussionForm
        open={newDiscussionOpen}
        onOpenChange={setNewDiscussionOpen}
        onSuccess={handleNewDiscussionSuccess}
      />
    </div>
  )
}
