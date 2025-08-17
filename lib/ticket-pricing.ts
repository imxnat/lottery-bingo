// Ticket pricing management utilities

interface TicketPricing {
  price: number
  lastUpdated: string
  updatedBy: string
}

const DEFAULT_PRICE = 5.0
const PRICING_STORAGE_KEY = "ticketPricing"

export function getTicketPrice(): number {
  if (typeof window === "undefined") {
    return DEFAULT_PRICE
  }

  try {
    const pricingData = localStorage.getItem(PRICING_STORAGE_KEY)
    if (!pricingData) return DEFAULT_PRICE

    const pricing: TicketPricing = JSON.parse(pricingData)
    return typeof pricing.price === "number" ? pricing.price : DEFAULT_PRICE
  } catch (error) {
    console.error("Error getting ticket price:", error)
    return DEFAULT_PRICE
  }
}

export function setTicketPrice(price: number, updatedBy = "Sistema"): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const pricing: TicketPricing = {
      price: Number(price),
      lastUpdated: new Date().toISOString(),
      updatedBy: String(updatedBy),
    }

    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing))
  } catch (error) {
    console.error("Error setting ticket price:", error)
    throw new Error("No se pudo actualizar el precio")
  }
}

export function getTicketPricing(): TicketPricing {
  if (typeof window === "undefined") {
    return {
      price: DEFAULT_PRICE,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Sistema",
    }
  }

  try {
    const pricingData = localStorage.getItem(PRICING_STORAGE_KEY)
    if (!pricingData) {
      // Create and save default pricing
      const defaultPricing: TicketPricing = {
        price: DEFAULT_PRICE,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Sistema",
      }
      localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(defaultPricing))
      return defaultPricing
    }

    const pricing: TicketPricing = JSON.parse(pricingData)

    // Validate the pricing object
    return {
      price: typeof pricing.price === "number" ? pricing.price : DEFAULT_PRICE,
      lastUpdated: typeof pricing.lastUpdated === "string" ? pricing.lastUpdated : new Date().toISOString(),
      updatedBy: typeof pricing.updatedBy === "string" ? pricing.updatedBy : "Sistema",
    }
  } catch (error) {
    console.error("Error getting ticket pricing info:", error)
    return {
      price: DEFAULT_PRICE,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Sistema",
    }
  }
}

export function resetTicketPricing(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(PRICING_STORAGE_KEY)
  } catch (error) {
    console.error("Error resetting ticket pricing:", error)
  }
}
