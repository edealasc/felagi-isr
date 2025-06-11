"use client"
import Link from "next/link"
import { Search, Filter, ArrowLeft, ArrowRight, FileText, BookOpen, Newspaper, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(
          `http://localhost:8000/search/${encodeURIComponent(query)}/`
        )
        setResults(response.data.results || [])
      } catch (err: any) {
        setError("Failed to fetch results")
        setResults([])
      }
      setLoading(false)
    }
    setExpanded({}) // Reset expanded state on new search
    if (query) fetchResults()
    else setResults([])
  }, [query])

  // Get the icon for the result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "research":
        return <BookOpen className="h-4 w-4" />
      case "news":
        return <Newspaper className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const TERMS_PREVIEW_COUNT = 5

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-10 w-full border-b border-zinc-800 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <span className="text-lg font-bold">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">Felagi</span>
              <span className="text-xs text-zinc-500 -mt-1">ፈላጊ</span>
            </div>
          </Link>
          <form
            className="flex w-full max-w-sm items-center space-x-2 mx-4 bg-zinc-900/80 backdrop-blur-sm p-1.5 rounded-xl border border-zinc-800"
            action="/search"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                name="q"
                placeholder="search..."
                className="w-full pl-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 text-white"
                defaultValue={query}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              Search
            </Button>
          </form>

        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="">

          <div className="space-y-6">
            <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800">
              <h1 className="text-xl font-semibold">{query ? `የፍለጋ ውጤቶች: "${query}"` : "ሁሉም ውጤቶች"}</h1>
              <p className="text-sm bg-violet-600/20 text-violet-300 px-3 py-1 rounded-full border border-violet-600/30">
                {loading ? "Loading..." : `${results.length} ውጤቶች ተገኝተዋል`}
              </p>
            </div>
            {error && (
              <div className="text-red-400 bg-red-900/40 border border-red-700 rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {results.map((result, index) => {
                const terms = result.index_terms || []
                const isExpanded = expanded[index]
                const showToggle = terms.length > TERMS_PREVIEW_COUNT
                const termsToShow = isExpanded ? terms : terms.slice(0, TERMS_PREVIEW_COUNT)
                return (
                  <Card
                    key={index}
                    className="bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                  >
                    <div className="border-l-4 border-violet-600 h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            <Link
                              href={result.url}
                              className="hover:underline text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              {result.title}
                            </Link>
                          </CardTitle>

                        </div>
                        <CardDescription className="text-xs flex items-center gap-2 text-zinc-500">
                          <span className="text-violet-500">{result.url}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.date}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-zinc-400">
                          {result.description.length > 250
                            ? result.description.slice(0, 250) + "..."
                            : result.description}
                        </p>
                        {/* Display index terms with collapse/expand */}
                        {terms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3 items-center">
                            {termsToShow.map((term: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="bg-zinc-800 hover:bg-zinc-700 text-xs border-zinc-700 text-zinc-300"
                              >
                                {term}
                              </Badge>
                            ))}
                            {showToggle && (
                              <button
                                className="ml-2 text-xs text-violet-400 underline"
                                onClick={() =>
                                  setExpanded((prev) => ({
                                    ...prev,
                                    [index]: !isExpanded,
                                  }))
                                }
                              >
                                {isExpanded ? "ያጠቃልሉ" : `ተጨማሪ (${terms.length - TERMS_PREVIEW_COUNT})`}
                              </button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                )
              })}
            </div>

          </div>
        </div>
      </main>
<footer className="border-t border-zinc-800 py-8 mt-10">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <span className="text-sm font-bold">ፈ</span>
        </div>
        <span className="text-lg font-bold tracking-tight">ፈላጊ</span>
      </div>

      <div className="flex items-center gap-4">

        <a
          href="https://github.com/edealasc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg width="16" height="16" fill="currentColor" className="inline" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </a>
        <a
          href="https://et.linkedin.com/in/edeal-aschalew-b5090230b"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg width="16" height="16" fill="currentColor" className="inline" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.27h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
          </svg>
          LinkedIn
        </a>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}
