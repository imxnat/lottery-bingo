// Example script to add sample purchase data for demonstration
// This would typically be run once to show how the admin dashboard looks with data

const samplePurchases = [
  {
    id: "sample1",
    tickets: [42, 123, 456],
    totalCost: 17.5,
    purchaseDate: "2024-01-15T10:30:00.000Z",
    referenceId: "REF-ABC123DEF",
    paymentStatus: { 42: true, 123: false, 456: true },
  },
  {
    id: "sample2",
    tickets: [7, 77, 777],
    totalCost: 17.5,
    purchaseDate: "2024-01-14T14:22:00.000Z",
    referenceId: "REF-XYZ789GHI",
    paymentStatus: { 7: true, 77: true, 777: false },
  },
  {
    id: "sample3",
    tickets: [1, 100, 500, 999],
    totalCost: 22.5,
    purchaseDate: "2024-01-13T09:15:00.000Z",
    referenceId: "REF-JKL456MNO",
    paymentStatus: { 1: false, 100: true, 500: true, 999: false },
  },
  {
    id: "sample4",
    tickets: [25, 250],
    totalCost: 12.5,
    purchaseDate: "2024-01-12T16:45:00.000Z",
    referenceId: "REF-PQR789STU",
    paymentStatus: { 25: true, 250: true },
  },
]

// To add this sample data, run this in the browser console:
// localStorage.setItem("purchasedTickets", JSON.stringify(samplePurchases))
// Then refresh the admin dashboard

console.log("Sample purchase data created. Run the following command in browser console to add it:")
console.log('localStorage.setItem("purchasedTickets", JSON.stringify(' + JSON.stringify(samplePurchases) + "))")
