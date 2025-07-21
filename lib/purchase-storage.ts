// Utility functions for managing purchase data
export interface Purchase {
  id: string
  tickets: number[]
  totalCost: number
  purchaseDate: string
  referenceId: string
  paymentStatus?: { [ticketNumber: number]: boolean }
}

export function savePurchase(tickets: number[], totalCost: number): string {
  const referenceId = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  const purchase: Purchase = {
    id: Math.random().toString(36).substr(2, 9),
    tickets,
    totalCost,
    purchaseDate: new Date().toISOString(),
    referenceId,
    paymentStatus: {}, // Initialize empty payment status
  }

  // Get existing purchases
  const existingPurchases = getPurchases()

  // Add new purchase
  const updatedPurchases = [...existingPurchases, purchase]

  // Save to localStorage
  localStorage.setItem("purchasedTickets", JSON.stringify(updatedPurchases))

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
