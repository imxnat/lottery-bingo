// Script to clear only purchased tickets data while keeping other settings

function clearPurchasedTicketsOnly() {
  // Clear only purchase-related data
  localStorage.removeItem("purchasedTickets")
  localStorage.removeItem("heldTickets")

  // Keep these intact:
  // - selectedTickets (current user selection)
  // - totalCost (current cart total)
  // - adminAuthenticated (admin login status)

  console.log("✅ Purchased tickets data cleared!")
  console.log("- Purchased tickets: cleared")
  console.log("- Held tickets: cleared")
  console.log("- Admin authentication: preserved")
  console.log("- Current user selection: preserved")

  console.log("🔄 Reloading page to reflect changes...")

  // Reload the page to reflect changes
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Execute the clear function
clearPurchasedTicketsOnly()
