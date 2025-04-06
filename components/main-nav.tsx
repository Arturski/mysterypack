import Link from "next/link"
import { SpaceIcon as Alien, Boxes } from "lucide-react"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 bg-background/50 backdrop-blur-sm p-4 rounded-lg">
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
        <Alien className="h-4 w-4" />
        Overview
      </Link>
      <Link
        href="/mystery"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
      >
        <Boxes className="h-4 w-4" />
        Mystery Packs
      </Link>
    </nav>
  )
}

