"use client"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bar, Line, Scatter } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
)

// Sample Data for Corpus Stats and Charts
const corpusStats = {
  totalDocs: 11136,
  uniqueTerms: 25818,
  avgDocLen: 256,
  topTerms: [
    { term: "ላይ", freq: 31984 },
    { term: "ነው", freq: 22197 },
    { term: "እና", freq: 20400 },
    { term: "ውስጥ", freq: 14144 },
    { term: "ወደ", freq: 12641 },
    { term: "ቤት", freq: 10909 },
    { term: "መንግስት", freq: 10783 },
    { term: "ጋር", freq: 10236 },
    { term: "አቶ", freq: 9076 },
    { term: "መሆኑን", freq: 7930 },
  ],
}
const zipfData = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  freq: 2000 / (i + 1) ** 1.05 + Math.random() * 20,
}))
const zipfLine = zipfData.map((d) => ({
  x: d.rank,
  y: 2000 / d.rank,
}))
const heapsData = Array.from({ length: 20 }, (_, i) => ({
  tokens: (i + 1) * 10000,
  vocab: 1000 * Math.pow(i + 1, 0.6) + Math.random() * 100,
}))
const luhnBins = [
  { label: "Rare (<3)", count: 12000 },
  { label: "Index Terms", count: 18000 },
  { label: "Common (>1000)", count: 5000 },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex flex-col items-center">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-sm text-zinc-400 mt-2">{label}</span>
    </div>
  )
}

export default function HomePage() {
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
          {/* <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/contact" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              About
            </Link>
          </nav> */}
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-36">
          <div className="container px-4 md:px-6 relative">
            <div className="absolute -top-[350px] -left-[250px] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] opacity-30" />


            <div className="flex flex-col items-center space-y-8 text-center relative z-10">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Felagi
                </h1>
                <h2 className="text-xl font-medium md:text-2xl text-zinc-400">An Amharic Information Retrieval System</h2>
              </div>
              <div className="w-full max-w-md space-y-4">
                <form
                  className="flex w-full max-w-md items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-800"
                  action="/search"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                    <Input
                      type="search"
                      name="q"
                      placeholder="search..."
                      className="w-full pl-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                  >
                    Search
                  </Button>
                </form>
                <div className="flex flex-wrap justify-center gap-2">
                  {["ኢትዮጵያ ታሪክ", "አዲስ አበባ", "አማርኛ ቋንቋ", "ባህላዊ ምግቦች"].map((term, i) => (
                    <Link
                      key={i}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-700"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
                <section className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-sm text-white">
                  Info
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  About this project
                </h2>
                <p className="text-zinc-400 md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed">
                  This project was built for my second year Information Retreival Systems course at Addis Ababa University. The goal is to create a robust information retrieval system that can efficiently process and retrieve information in Amharic. The program contains more than 40,000  articles scraped from various blogs and websites in the web and is capable of handling complex queries in Amharic.

                  
                </p>

                <div className="flex flex-wrap gap-3">

                  <Button
                    asChild
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                  >
                    <a
                      href="https://github.com/your-username/your-repo" // <-- Replace with your actual repo URL
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="inline-block w-5 h-5 mr-2 align-text-bottom"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 4.302 2.792 7.953 6.653 9.24.486.09.664-.211.664-.47 0-.232-.009-.846-.013-1.66-2.705.587-3.276-1.304-3.276-1.304-.442-1.123-1.08-1.422-1.08-1.422-.883-.604.067-.592.067-.592.976.069 1.49 1.003 1.49 1.003.867 1.487 2.275 1.058 2.832.81.088-.628.34-1.058.618-1.301-2.16-.246-4.433-1.08-4.433-4.808 0-1.062.38-1.93 1.003-2.61-.101-.247-.435-1.24.096-2.586 0 0 .816-.262 2.676 1.001A9.34 9.34 0 0112 6.844c.827.004 1.66.112 2.438.328 1.86-1.263 2.675-1.001 2.675-1.001.532 1.346.198 2.339.098 2.586.624.68 1.002 1.548 1.002 2.61 0 3.736-2.276 4.56-4.444 4.803.35.302.66.899.66 1.814 0 1.31-.012 2.367-.012 2.69 0 .26.176.563.67.468C18.96 19.95 21.75 16.302 21.75 12c0-5.385-4.365-9.75-9.75-9.75z"
                        />
                      </svg>
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* <section className="w-full py-16 md:py-24 relative">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-sm text-white">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Understanding Information Retrieval Systems
                </h2>
                <p className="text-zinc-400 md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed">
                  An information retrieval system processes and retrieves relevant information from large datasets. Here's how it works:
                </p>
                <ul className="space-y-4 text-zinc-400 md:text-lg">
                  <li>
                    <span className="font-bold text-white">1. Data Collection:</span> The system gathers data from various sources such as books, articles, and websites.
                  </li>
                  <li>
                    <span className="font-bold text-white">2. Indexing:</span> The collected data is analyzed and indexed to enable fast and efficient searches.
                  </li>
                  <li>
                    <span className="font-bold text-white">3. Query Processing:</span> User queries are interpreted and matched against the indexed data.
                  </li>
                  <li>
                    <span className="font-bold text-white">4. Ranking:</span> Results are ranked based on relevance using algorithms.
                  </li>
                  <li>
                    <span className="font-bold text-white">5. Retrieval:</span> The most relevant results are presented to the user in an easy-to-understand format.
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                    Learn More
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 blur-sm" />
                <div className="relative bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                  <ul className="grid gap-5">
                    <li className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-zinc-800/50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <span className="text-lg font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Data Collection</h3>
                        <p className="text-sm text-zinc-400">Gathering data from diverse sources.</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-zinc-800/50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <span className="text-lg font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Indexing</h3>
                        <p className="text-sm text-zinc-400">Organizing data for quick retrieval.</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-zinc-800/50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <span className="text-lg font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Query Processing</h3>
                        <p className="text-sm text-zinc-400">Interpreting user input for accurate results.</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-zinc-800/50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <span className="text-lg font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Ranking</h3>
                        <p className="text-sm text-zinc-400">Sorting results by relevance.</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-zinc-800/50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        <span className="text-lg font-bold">5</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Retrieval</h3>
                        <p className="text-sm text-zinc-400">Delivering the most relevant results.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        <section className="w-full py-16 md:py-24 bg-zinc-950 rounded-2xl border border-zinc-800 mt-10">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-white mb-8">Corpus Overview & Visualizations</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Documents" value={corpusStats.totalDocs} />
              <StatCard label="Unique Terms" value={corpusStats.uniqueTerms} />
              <StatCard label="Avg. Doc Length" value={corpusStats.avgDocLen + " tokens"} />
              <StatCard label="Top Term" value={corpusStats.topTerms[0].term} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-xl font-semibold text-white mb-2">Most Frequent Words</h3>
                <Bar
                  data={{
                    labels: corpusStats.topTerms.map((t) => t.term),
                    datasets: [
                      {
                        label: "Frequency",
                        data: corpusStats.topTerms.map((t) => t.freq),
                        backgroundColor: "rgba(139, 92, 246, 0.7)",
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                      y: {
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                    },
                  }}
                  height={220}
                />
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-xl font-semibold text-white mb-2">Zipf’s Law (Log-Log Plot)</h3>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "Observed",
                        data: zipfData.map((d) => ({ x: d.rank, y: d.freq })),
                        backgroundColor: "rgba(99, 102, 241, 0.7)",
                      },
                      {
                        label: "Zipf's Law (slope ≈ -1)",
                        data: zipfLine,
                        type: "line",
                        borderColor: "rgba(236, 72, 153, 0.7)",
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { labels: { color: "#a1a1aa" } },
                      title: { display: false },
                      tooltip: { mode: "nearest" },
                    },
                    scales: {
                      x: {
                        type: "logarithmic",
                        title: { display: true, text: "Rank", color: "#a1a1aa" },
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                      y: {
                        type: "logarithmic",
                        title: { display: true, text: "Frequency", color: "#a1a1aa" },
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                    },
                  }}
                  height={220}
                />
                <div className="text-zinc-400 text-sm mt-2">
                  Slope ≈ -1, R² ≈ 0.98 (sample data)
                </div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-xl font-semibold text-white mb-2">Heaps’ Law (Vocabulary Growth)</h3>
                <Line
                  data={{
                    labels: heapsData.map((d) => d.tokens),
                    datasets: [
                      {
                        label: "Unique Words",
                        data: heapsData.map((d) => d.vocab),
                        borderColor: "rgba(139, 92, 246, 1)",
                        backgroundColor: "rgba(139, 92, 246, 0.2)",
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { labels: { color: "#a1a1aa" } },
                      title: { display: false },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: "Total Tokens", color: "#a1a1aa" },
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                      y: {
                        title: { display: true, text: "Unique Words", color: "#a1a1aa" },
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                    },
                  }}
                  height={220}
                />
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-xl font-semibold text-white mb-2">Luhn’s Cutoff Distribution</h3>
                <Bar
                  data={{
                    labels: luhnBins.map((b) => b.label),
                    datasets: [
                      {
                        label: "Word Count",
                        data: luhnBins.map((b) => b.count),
                        backgroundColor: [
                          "rgba(236, 72, 153, 0.7)",
                          "rgba(139, 92, 246, 0.7)",
                          "rgba(99, 102, 241, 0.7)",
                        ],
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                      y: {
                        ticks: { color: "#a1a1aa" },
                        grid: { color: "#27272a" },
                      },
                    },
                  }}
                  height={180}
                />
                <div className="flex gap-4 mt-2 text-zinc-400 text-xs">
                  <span>Rare terms removed: {luhnBins[0].count}</span>
                  <span>Index terms: {luhnBins[1].count}</span>
                  <span>Common terms removed: {luhnBins[2].count}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
