import fetch from "node-fetch"
import { JSDOM } from "jsdom"

async function scrapeGames() {
  try {
    const response = await fetch("https://play.immutable.com/games/")
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const games = []
    const gameCards = document.querySelectorAll('[data-testid="game-card"]')

    gameCards.forEach((card) => {
      const title = card.querySelector('[data-testid="game-card-title"]')?.textContent.trim()
      const description = card.querySelector('[data-testid="game-card-description"]')?.textContent.trim()
      const imageUrl = card.querySelector("img")?.src
      const genreElements = card.querySelectorAll('[data-testid="game-card-genre"]')
      const genres = Array.from(genreElements).map((el) => el.textContent.trim())

      if (title) {
        games.push({ title, description, imageUrl, genres })
      }
    })

    console.log(JSON.stringify(games, null, 2))
  } catch (error) {
    console.error("Error scraping games:", error)
  }
}

scrapeGames()

