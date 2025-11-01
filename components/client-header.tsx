"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Beaker, BarChart3, FileText } from "lucide-react"
import AuthDialog from "@/components/auth-dialog"
import UserMenu from "@/components/user-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"

export default function ClientHeader() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render auth-dependent content until mounted
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Beaker className="h-5 w-5 text-amber-400" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              {"MANAV RACHNA  R&D CENTRE"}
            </span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
            <Link href="/" className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground">
              Home
            </Link>
            <Link
              href="/#projects"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Projects
            </Link>
            <Link
              href="/forum"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Forum
            </Link>
            <Link
              href="/faculty"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Faculty
            </Link>
            <Link
              href="/#submit"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Submit
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
            >
              Contact
            </Link>
            <Skeleton className="h-9 w-28 bg-amber-500/10" />
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 font-bold">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <Beaker className="h-5 w-5 text-amber-400" />
          </div>
          <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            {"MANAV RACHNA  R&D CENTRE"}
          </span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/" className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground">
            Home
          </Link>
          <Link
            href="/#projects"
            className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
          >
            Projects
          </Link>
          <Link
            href="/forum"
            className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
          >
            Forum
          </Link>
          <Link
            href="/faculty"
            className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
          >
            Faculty
          </Link>
          <Link
            href="/#submit"
            className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
          >
            Submit
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground"
          >
            Contact
          </Link>
          {isLoading ? (
            // Show skeleton during initial load
            <>
              <Skeleton className="h-4 w-16 bg-amber-500/10" />
              <Skeleton className="h-9 w-28 bg-amber-500/10" />
            </>
          ) : (
            <>
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/analytics"
                    className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground flex items-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                  <Link
                    href="/admin/projects"
                    className="text-sm font-medium hover:text-amber-400 transition-colors text-muted-foreground flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Submissions
                  </Link>
                </>
              )}
              {user ? <UserMenu /> : <AuthDialog />}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
