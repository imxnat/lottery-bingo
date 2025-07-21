// Utility functions for managing ticket holding system
export interface HeldTicket {
  ticketNumber: number
  holdStartTime: number
  referenceId: string
  isConfirmed: boolean
  holdExpiry: number // Unix timestamp in milliseconds
}

export interface Purchase {
  id: string
  tickets: number[]
  totalCost: number
  purchaseDate: string // ISO string
  referenceId: string
  paymentStatus?: { [ticketNumber: number]: boolean }
  holdExpiry?: number // Unix timestamp in milliseconds
}

// HOLD_DURATION is now managed server-side, but kept here for client-side display logic if needed
export const HOLD_DURATION_MINUTES = 30 // 30 minutes

const HOLD_DURATION = HOLD_DURATION_MINUTES * 60 * 1000 // 30 minutes in milliseconds

export function holdTickets(tickets: number[], referenceId: string): void {
  const holdExpiry = Date.now() + HOLD_DURATION
  const heldTickets = getHeldTickets()

  // Add new held tickets
  tickets.forEach((ticketNumber) => {
    heldTickets[ticketNumber] = {
      ticketNumber,
      holdStartTime: Date.now(),
      referenceId,
      isConfirmed: false,
      holdExpiry,
    }
  })

  localStorage.setItem("heldTickets", JSON.stringify(heldTickets))
}

export function getHeldTickets(): { [ticketNumber: number]: HeldTicket } {
  const stored = localStorage.getItem("heldTickets")
  return stored ? JSON.parse(stored) : {}
}

export function isTicketHeld(ticketNumber: number): boolean {
  const heldTickets = getHeldTickets()
  const heldTicket = heldTickets[ticketNumber]

  if (!heldTicket) return false

  // If ticket is confirmed, it's no longer held - it's sold
  if (heldTicket.isConfirmed) return false

  // Check if hold has expired
  if (Date.now() > heldTicket.holdExpiry && !heldTicket.isConfirmed) {
    releaseTicket(ticketNumber)
    return false
  }

  return true
}

export function isTicketSold(ticketNumber: number): boolean {
  const purchases = getPurchases()

  for (const purchase of purchases) {
    if (purchase.tickets.includes(ticketNumber)) {
      // Check if payment is confirmed for this ticket
      const isPaymentConfirmed = purchase.paymentStatus?.[ticketNumber] || false
      if (isPaymentConfirmed) {
        return true
      }
    }
  }

  return false
}

export function getAllSoldTickets(): number[] {
  const purchases = getPurchases()
  const soldTickets: number[] = []

  purchases.forEach((purchase) => {
    purchase.tickets.forEach((ticketNumber) => {
      const isPaymentConfirmed = purchase.paymentStatus?.[ticketNumber] || false
      if (isPaymentConfirmed) {
        soldTickets.push(ticketNumber)
      }
    })
  })

  return [...new Set(soldTickets)].sort((a, b) => a - b)
}

export function getAllHeldTickets(): number[] {
  const heldTickets = getHeldTickets()
  const currentTime = Date.now()
  const activeHeldTickets: number[] = []

  Object.values(heldTickets).forEach((heldTicket) => {
    // Only include tickets that are still held (not confirmed and not expired)
    if (!heldTicket.isConfirmed && currentTime <= heldTicket.holdExpiry) {
      activeHeldTickets.push(heldTicket.ticketNumber)
    }
  })

  return activeHeldTickets.sort((a, b) => a - b)
}

export function releaseTicket(ticketNumber: number): void {
  const heldTickets = getHeldTickets()
  delete heldTickets[ticketNumber]
  localStorage.setItem("heldTickets", JSON.stringify(heldTickets))
}

export function confirmTicketPayment(ticketNumber: number): void {
  // Remove ticket from held zone completely when confirmed
  const heldTickets = getHeldTickets()
  delete heldTickets[ticketNumber]
  localStorage.setItem("heldTickets", JSON.stringify(heldTickets))

  // The ticket is now marked as sold in the purchase record
  // This is handled by the admin dashboard when updating paymentStatus
}

export function getTicketHoldInfo(ticketNumber: number): (HeldTicket & { timeRemaining: number }) | null {
  const heldTickets = getHeldTickets()
  const heldTicket = heldTickets[ticketNumber]

  if (!heldTicket) return null

  const timeRemaining = Math.max(0, heldTicket.holdExpiry - Date.now())

  return {
    ...heldTicket,
    timeRemaining,
  }
}

export function cleanupExpiredHolds(): void {
  const heldTickets = getHeldTickets()
  const currentTime = Date.now()
  let hasChanges = false

  Object.keys(heldTickets).forEach((ticketNumberStr) => {
    const ticketNumber = Number.parseInt(ticketNumberStr)
    const heldTicket = heldTickets[ticketNumber]

    if (currentTime > heldTicket.holdExpiry && !heldTicket.isConfirmed) {
      delete heldTickets[ticketNumber]
      hasChanges = true
    }
  })

  if (hasChanges) {
    localStorage.setItem("heldTickets", JSON.stringify(heldTickets))
  }
}

export function savePurchase(tickets: number[], totalCost: number): string {
  const referenceId = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const holdExpiry = Date.now() + HOLD_DURATION

  const purchase: Purchase = {
    id: Math.random().toString(36).substr(2, 9),
    tickets,
    totalCost,
    purchaseDate: new Date().toISOString(),
    referenceId,
    paymentStatus: {}, // Initialize empty payment status
    holdExpiry,
  }

  // Get existing purchases
  const existingPurchases = getPurchases()

  // Add new purchase
  const updatedPurchases = [...existingPurchases, purchase]

  // Save to localStorage
  localStorage.setItem("purchasedTickets", JSON.stringify(updatedPurchases))

  // Hold the tickets
  holdTickets(tickets, referenceId)

  return referenceId
}

export function getPurchases(): Purchase[] {
  const stored = localStorage.getItem("purchasedTickets")
  return stored ? JSON.parse(stored) : []
}

export function getAllPurchasedTicketNumbers(): number[] {
  const purchases = getPurchases()
  const allTickets: number[] = []

  purchases.forEach((purchase) => {
    allTickets.push(...purchase.tickets)
  })

  return [...new Set(allTickets)].sort((a, b) => a - b)
}
