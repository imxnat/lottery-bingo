"use server"

import { neon } from "@neondatabase/serverless"
import {
  getAllHeldTickets,
  getAllSoldTickets,
  savePurchase,
  getTicketHoldInfo,
  getHeldTickets as getHeldTicketsFromStorage,
  getPurchases,
} from "@/lib/ticket-holding"

const sql = neon(process.env.DATABASE_URL!)

export async function getInitialTicketData() {
  try {
    // Get sold tickets from localStorage (since we're using client-side storage)
    const soldTickets = getAllSoldTickets()

    // Get held tickets from localStorage
    const heldTickets = getAllHeldTickets()

    return {
      soldTickets,
      heldTickets,
    }
  } catch (error) {
    console.error("Error fetching ticket data:", error)
    return {
      soldTickets: [],
      heldTickets: [],
    }
  }
}

export async function savePurchaseAndHoldTickets(ticketNumbers: number[], totalCost: number) {
  try {
    // Check if any tickets are already sold or held
    const soldTickets = getAllSoldTickets()
    const heldTickets = getAllHeldTickets()

    const conflictingSoldTickets = ticketNumbers.filter((ticket) => soldTickets.includes(ticket))
    const conflictingHeldTickets = ticketNumbers.filter((ticket) => heldTickets.includes(ticket))

    if (conflictingSoldTickets.length > 0 || conflictingHeldTickets.length > 0) {
      const conflictingTickets = [...conflictingSoldTickets, ...conflictingHeldTickets]
      return {
        success: false,
        error: `Los siguientes boletos ya no están disponibles: ${conflictingTickets.join(", ")}`,
      }
    }

    // Save purchase and hold tickets
    const referenceId = savePurchase(ticketNumbers, totalCost)

    return {
      success: true,
      referenceId,
    }
  } catch (error) {
    console.error("Error saving purchase and holding tickets:", error)
    return {
      success: false,
      error: "Error interno del servidor",
    }
  }
}

export async function confirmTicketPaymentAction(ticketNumber: number) {
  try {
    // Get current purchases
    const purchases = getPurchases()

    // Find the purchase containing this ticket and mark payment as confirmed
    const updatedPurchases = purchases.map((purchase) => {
      if (purchase.tickets.includes(ticketNumber)) {
        return {
          ...purchase,
          paymentStatus: {
            ...purchase.paymentStatus,
            [ticketNumber]: true,
          },
        }
      }
      return purchase
    })

    // Save updated purchases
    localStorage.setItem("purchasedTickets", JSON.stringify(updatedPurchases))

    // Remove ticket from held status
    const heldTickets = getHeldTicketsFromStorage()
    delete heldTickets[ticketNumber]
    localStorage.setItem("heldTickets", JSON.stringify(heldTickets))

    return { success: true }
  } catch (error) {
    console.error("Error confirming ticket payment:", error)
    return {
      success: false,
      error: "Error al confirmar el pago del boleto",
    }
  }
}

export async function getTicketHoldInfoAction(ticketNumber: number) {
  return getTicketHoldInfo(ticketNumber)
}

export async function getAllPurchasesAction() {
  try {
    // This would typically come from a database, but for now we'll return empty
    // since we're using in-memory storage for purchases
    return []
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return []
  }
}

export async function releaseExpiredHoldsAction() {
  try {
    // This is handled automatically by the ticket-holding system
    return { success: true }
  } catch (error) {
    console.error("Error releasing expired holds:", error)
    return { success: false }
  }
}
