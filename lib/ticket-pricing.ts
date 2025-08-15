interface TicketPricing {
  price: number
  lastUpdated: string
  updatedBy: string
}

const TICKET_PRICING_KEY = "ticketPricing"
const DEFAULT_PRICE = 5.0

export function getTicketPrice(): number {
  if (typeof window === "undefined") return DEFAULT_PRICE

  try {
    const stored = localStorage.getItem(TICKET_PRICING_KEY)
    if (stored) {
      const pricing: TicketPricing = JSON.parse(stored)
      return pricing.price || DEFAULT_PRICE
    }
  } catch (error) {
    console.error("Error getting ticket price:", error)
  }

  return DEFAULT_PRICE
}

export function setTicketPrice(price: number, updatedBy = "System"): void {
  if (typeof window === "undefined") return

  try {
    const pricing: TicketPricing = {
      price,
      lastUpdated: new Date().toISOString(),
      updatedBy,
    }
    localStorage.setItem(TICKET_PRICING_KEY, JSON.stringify(pricing))
  } catch (error) {
    console.error("Error setting ticket price:", error)
  }
}

export function getTicketPricing(): TicketPricing {
  if (typeof window === "undefined") {
    return {
      price: DEFAULT_PRICE,
      lastUpdated: new Date().toISOString(),
      updatedBy: "System",
    }
  }

  try {
    const stored = localStorage.getItem(TICKET_PRICING_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error getting ticket pricing:", error)
  }

  // Return default pricing if nothing stored
  const defaultPricing: TicketPricing = {
    price: DEFAULT_PRICE,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System",
  }

  // Store default pricing
  setTicketPrice(DEFAULT_PRICE, "System")

  return defaultPricing
}
