"use server"

import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { type Purchase, type HeldTicket, HOLD_DURATION_MINUTES } from "@/lib/ticket-holding"

const HOLD_DURATION_MS = HOLD_DURATION_MINUTES * 60 * 1000 // 30 minutes in milliseconds

// Helper to convert database rows to Purchase interface
function mapPurchaseRowToInterface(row: any): Purchase {
  return {
    id: row.id,
    tickets: row.tickets,
    totalCost: Number.parseFloat(row.total_cost),
    purchaseDate: new Date(row.purchase_date).toISOString(),
    referenceId: row.reference_id,
    paymentStatus: row.payment_status || {},
    holdExpiry: row.hold_expiry ? new Date(row.hold_expiry).getTime() : undefined,
  }
}

// Helper to convert database rows to HeldTicket interface
function mapHeldTicketRowToInterface(row: any): HeldTicket {
  return {
    ticketNumber: row.ticket_number,
    holdStartTime: new Date(row.hold_start_time).getTime(),
    referenceId: row.reference_id,
    isConfirmed: row.is_confirmed,
    holdExpiry: new Date(row.hold_expiry).getTime(),
  }
}

export async function getInitialTicketData() {
  try {
    // Cleanup expired holds first
    await cleanupExpiredHoldsAction()

    // Fetch all purchases
    const purchasesResult = await sql`SELECT * FROM purchases ORDER BY purchase_date DESC;`
    const purchases: Purchase[] = purchasesResult.map(mapPurchaseRowToInterface)

    // Fetch all held tickets
    const heldTicketsResult = await sql`SELECT * FROM held_tickets WHERE is_confirmed = FALSE AND hold_expiry > NOW();`
    const heldTickets: HeldTicket[] = heldTicketsResult.map(mapHeldTicketRowToInterface)

    // Determine sold tickets from purchases with confirmed payment
    const soldTickets: number[] = []
    purchases.forEach((purchase) => {
      for (const ticketNumStr in purchase.paymentStatus) {
        if (purchase.paymentStatus[Number.parseInt(ticketNumStr)]) {
          soldTickets.push(Number.parseInt(ticketNumStr))
        }
      }
    })

    // Get all held ticket numbers
    const heldTicketNumbers = heldTickets.map((t) => t.ticketNumber)

    return {
      purchases,
      soldTickets: [...new Set(soldTickets)].sort((a, b) => a - b),
      heldTickets: [...new Set(heldTicketNumbers)].sort((a, b) => a - b),
    }
  } catch (error) {
    console.error("Error fetching initial ticket data:", error)
    return { purchases: [], soldTickets: [], heldTickets: [] }
  }
}

export async function savePurchaseAndHoldTickets(
  tickets: number[],
  totalCost: number,
): Promise<{ referenceId: string | null; error?: string }> {
  try {
    await sql`BEGIN;` // Start transaction
    const referenceId = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const holdExpiryDate = new Date(Date.now() + HOLD_DURATION_MS)

    // Insert into purchases table
    await sql`
      INSERT INTO purchases (id, tickets, total_cost, reference_id, hold_expiry)
      VALUES (${uuidv4()}, ${JSON.stringify(tickets)}::jsonb, ${totalCost}, ${referenceId}, ${holdExpiryDate});
    `

    // Insert into held_tickets table
    for (const ticketNumber of tickets) {
      await sql`
        INSERT INTO held_tickets (ticket_number, hold_start_time, reference_id, hold_expiry)
        VALUES (${ticketNumber}, NOW(), ${referenceId}, ${holdExpiryDate})
        ON CONFLICT (ticket_number) DO UPDATE SET
          hold_start_time = EXCLUDED.hold_start_time,
          reference_id = EXCLUDED.reference_id,
          hold_expiry = EXCLUDED.hold_expiry,
          is_confirmed = FALSE; -- Reset to false if it was previously confirmed and now held again
      `
    }

    await sql`COMMIT;` // Commit transaction
    return { referenceId }
  } catch (error: any) {
    await sql`ROLLBACK;` // Rollback on error
    console.error("Error saving purchase and holding tickets:", error)
    return { referenceId: null, error: error.message || "Failed to save purchase." }
  }
}

export async function confirmTicketPaymentAction(ticketNumber: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`BEGIN;` // Start transaction

    // Find the purchase containing this ticket
    // MODIFIED: Select all columns to ensure mapPurchaseRowToInterface has all data
    const purchaseResult = await sql`
      SELECT * FROM purchases WHERE tickets @> ${JSON.stringify([ticketNumber])}::jsonb LIMIT 1;
    `

    if (purchaseResult.length === 0) {
      await sql`ROLLBACK;`
      return { success: false, error: "Purchase not found for this ticket." }
    }

    const purchase = mapPurchaseRowToInterface(purchaseResult[0])
    const updatedPaymentStatus = { ...purchase.paymentStatus, [ticketNumber]: true }

    // Update payment status in purchases table
    await sql`
      UPDATE purchases
      SET payment_status = ${JSON.stringify(updatedPaymentStatus)}::jsonb
      WHERE id = ${purchase.id};
    `

    // Remove ticket from held_tickets table (it's now sold)
    await sql`DELETE FROM held_tickets WHERE ticket_number = ${ticketNumber};`

    await sql`COMMIT;` // Commit transaction
    console.log(`✅ Ticket #${ticketNumber} confirmed and moved from held to sold zone`)
    return { success: true }
  } catch (error: any) {
    await sql`ROLLBACK;` // Rollback on error
    console.error("Error confirming ticket payment:", error)
    return { success: false, error: error.message || "Failed to confirm payment." }
  }
}

export async function releaseTicketAction(ticketNumber: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`BEGIN;` // Start transaction
    // Remove ticket from held_tickets table
    await sql`DELETE FROM held_tickets WHERE ticket_number = ${ticketNumber};`

    // Optionally, update the purchase record to reflect the ticket is no longer held/sold if payment wasn't confirmed
    // This part depends on your exact business logic. If a ticket is released, it means it wasn't paid for.
    // We might want to remove it from the purchase record or mark its payment status as false.
    // For now, we'll just remove it from held_tickets. The admin dashboard will re-fetch and reflect this.

    await sql`COMMIT;` // Commit transaction
    console.log(`🔄 Ticket #${ticketNumber} released back to available zone`)
    return { success: true }
  } catch (error: any) {
    await sql`ROLLBACK;` // Rollback on error
    console.error("Error releasing ticket:", error)
    return { success: false, error: error.message || "Failed to release ticket." }
  }
}

export async function clearAllPurchasedTicketsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`BEGIN;` // Start transaction
    await sql`DELETE FROM held_tickets;`
    await sql`DELETE FROM purchases;`
    await sql`COMMIT;` // Commit transaction
    console.log("✅ All purchased and held tickets cleared from database!")
    return { success: true }
  } catch (error: any) {
    await sql`ROLLBACK;` // Rollback on error
    console.error("Error clearing all purchased tickets:", error)
    return { success: false, error: error.message || "Failed to clear all purchased tickets." }
  }
}

export async function cleanupExpiredHoldsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    // No need for explicit transaction here if it's a single DELETE statement
    const result = await sql`DELETE FROM held_tickets WHERE hold_expiry < NOW() AND is_confirmed = FALSE;`
    // console.log(`Cleaned up ${result.count} expired held tickets.`);
    return { success: true }
  } catch (error: any) {
    console.error("Error cleaning up expired holds:", error)
    return { success: false, error: error.message || "Failed to cleanup expired holds." }
  }
}

// Helper to get ticket hold info from the database
export async function getTicketHoldInfoAction(
  ticketNumber: number,
): Promise<(HeldTicket & { timeRemaining: number }) | null> {
  try {
    const result = await sql`SELECT * FROM held_tickets WHERE ticket_number = ${ticketNumber} LIMIT 1;`
    if (result.length === 0) return null

    const heldTicket = mapHeldTicketRowToInterface(result[0])
    const timeRemaining = Math.max(0, heldTicket.holdExpiry - Date.now())

    return {
      ...heldTicket,
      timeRemaining,
    }
  } catch (error) {
    console.error(`Error getting hold info for ticket ${ticketNumber}:`, error)
    return null
  }
}
