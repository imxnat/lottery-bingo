// Script to clear all cached data and reset the ticket system (Updated for holding system)

function clearAllData() {
  // Clear all localStorage data
  localStorage.removeItem("purchasedTickets")
  localStorage.removeItem("selectedTickets")
  localStorage.removeItem("totalCost")
  localStorage.removeItem("adminAuthenticated")
  localStorage.removeItem("heldTickets") // New: Clear held tickets

  console.log("✅ All cached data cleared!")
  console.log("- Purchased tickets: cleared")
  console.log("- Selected tickets: cleared")
  console.log("- Held tickets: cleared") // New
  console.log("- Admin authentication: cleared")
  console.log("- Total cost: cleared")

  // Also clear any other potential cache keys
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes("ticket") || key.includes("purchase") || key.includes("admin"))) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
    console.log(`- ${key}: cleared`)
  })

  console.log("🔄 Reloading page to reflect changes...")

  // Reload the page to reflect changes
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Execute the clear function
clearAllData()
