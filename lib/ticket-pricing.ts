interface TicketPricing {
  currentPrice: number
  lastUpdated: string
  updatedBy: string
  priceHistory: Array<{
    price: number
    date: string
    updatedBy: string
  }>
}

const DEFAULT_PRICE = 5.0
const STORAGE_KEY = "ticketPricing"

export function getTicketPrice(): number {
  if (typeof window === "undefined") return DEFAULT_PRICE

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_PRICE

    const pricing: TicketPricing = JSON.parse(stored)
    return pricing.currentPrice || DEFAULT_PRICE
  } catch (error) {
    console.error("Error getting ticket price:", error)
    return DEFAULT_PRICE
  }
}

export function setTicketPrice(price: number, updatedBy = "Sistema"): void {
  if (typeof window === "undefined") return

  try {
    const currentPricing = getTicketPricing()

    const newPricing: TicketPricing = {
      currentPrice: price,
      lastUpdated: new Date().toISOString(),
      updatedBy,
      priceHistory: [
        ...currentPricing.priceHistory,
        {
          price: currentPricing.currentPrice,
          date: currentPricing.lastUpdated,
          updatedBy: currentPricing.updatedBy,
        },
      ],
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPricing))
  } catch (error) {
    console.error("Error setting ticket price:", error)
  }
}

export function getTicketPricing(): TicketPricing {
  if (typeof window === "undefined") {
    return {
      currentPrice: DEFAULT_PRICE,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Sistema",
      priceHistory: [],
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const defaultPricing: TicketPricing = {
        currentPrice: DEFAULT_PRICE,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Sistema",
        priceHistory: [],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPricing))
      return defaultPricing
    }

    return JSON.parse(stored)
  } catch (error) {
    console.error("Error getting ticket pricing:", error)
    return {
      currentPrice: DEFAULT_PRICE,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Sistema",
      priceHistory: [],
    }
  }
}

export function getPriceHistory(): Array<{
  price: number
  date: string
  updatedBy: string
}> {
  const pricing = getTicketPricing()
  return pricing.priceHistory
}

export function resetPricing(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error resetting pricing:", error)
  }
}
