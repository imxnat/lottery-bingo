"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ShoppingCart, Ticket, CreditCard, Settings, Users, Clock, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { getInitialTicketData, savePurchaseAndHoldTickets, getTicketHoldInfoAction } from "@/app/actions"
import { HOLD_DURATION_MINUTES } from "@/lib/ticket-holding"

export default function Component() {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [soldTickets, setSoldTickets] = useState<number[]>([])
  const [heldTickets, setHeldTickets] = useState<number[]>([])
  const [showCart, setShowCart] = useState(false)
  const [searchTicket, setSearchTicket] = useState("")
  const [holdInfos, setHoldInfos] = useState<{ [key: number]: any }>({})
  const router = useRouter()
  const cartRef = useRef<HTMLDivElement>(null)

  const ticketPrice = 5.0
  const totalNumbers = 10000 // 0 to 9999

  const fetchTicketStatus = useCallback(async () => {
    const data = await getInitialTicketData()
    setSoldTickets(data.soldTickets)
    setHeldTickets(data.heldTickets)
  }, [])

  useEffect(() => {
    fetchTicketStatus()
    const interval = setInterval(fetchTicketStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchTicketStatus])

  useEffect(() => {
    heldTickets.forEach(async (ticket) => {
      const info = await getTicketHoldInfoAction(ticket)
      setHoldInfos((prev) => ({ ...prev, [ticket]: info }))
    })
  }, [heldTickets])

  const toggleTicket = (number: number) => {
    if (soldTickets.includes(number) || heldTickets.includes(number)) return

    setSelectedTickets((prev) => {
      const currentSet = new Set(prev)

      if (currentSet.has(number)) {
        currentSet.delete(number)
      } else {
        currentSet.add(number)
      }

      return Array.from(currentSet).sort((a, b) => a - b)
    })
  }

  const handleTicketClick = (number: number) => {
    const button = document.querySelector(`[data-ticket="${number}"]`) as HTMLButtonElement
    if (button) {
      button.disabled = true
      setTimeout(() => {
        const status = getTicketStatus(number)
        button.disabled = status === "sold" || status === "held"
      }, 200)
    }

    toggleTicket(number)
  }

  const getTicketStatus = (number: number) => {
    if (soldTickets.includes(number)) return "sold"
    if (heldTickets.includes(number)) return "held"
    if (selectedTickets.includes(number)) return "selected"
    return "available"
  }

  const getTicketColor = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-red-600 text-white cursor-not-allowed shadow-md"
      case "held":
        return "bg-orange-500 text-white cursor-not-allowed"
      case "selected":
        return "bg-green-500 text-white cursor-pointer hover:bg-green-600"
      case "available":
        return "bg-gray-100 hover:bg-blue-100 cursor-pointer border-2 border-transparent hover:border-blue-300"
      default:
        return "bg-gray-100"
    }
  }

  const totalCost = selectedTickets.length * ticketPrice
  const availableCount = totalNumbers - soldTickets.length - heldTickets.length

  const filteredTickets = Array.from({ length: totalNumbers }, (_, i) => i).filter(
    (number) => searchTicket === "" || number.toString().includes(searchTicket),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {" "}
      {/* Increased padding for larger screens */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            {" "}
            {/* Adjusted for mobile stacking */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" /> {/* Adjusted icon size */}
                Interfaz de Usuario
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Selecciona tus números de la suerte del 0 al 9999</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {" "}
                {/* Added flex-wrap for badges */}
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  🎫 {availableCount} boletos disponibles
                </Badge>
                {soldTickets.length > 0 && (
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    🔴 {soldTickets.length} boletos vendidos
                  </Badge>
                )}
                {heldTickets.length > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    🟠 {heldTickets.length} boletos retenidos
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                setShowCart(!showCart)
                if (cartRef.current) {
                  cartRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              }}
              className="relative w-full sm:w-auto"
              size="lg"
            >
              {" "}
              {/* Full width on mobile */}
              <ShoppingCart className="mr-2 h-5 w-5" />
              Carrito ({selectedTickets.length})
              {selectedTickets.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500">{selectedTickets.length}</Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {" "}
          {/* Stacks on mobile, 4 columns on large screens */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
                  {" "}
                  {/* Adjusted for mobile stacking */}
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                    {" "}
                    {/* Adjusted title size */}
                    <Ticket className="h-5 w-5" />
                    Boletos Disponibles
                  </CardTitle>
                  <div className="relative w-full sm:w-64 flex-shrink-0">
                    {" "}
                    {/* Full width on mobile */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Buscar número de boleto..."
                      value={searchTicket}
                      onChange={(e) => setSearchTicket(e.target.value)}
                      className="pl-10 pr-10 w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500" /* Full width on mobile */
                    />
                    {searchTicket && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTicket("")}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  {" "}
                  {/* Adjusted description size */}
                  Haz clic en cualquier número disponible para seleccionarlo. Precio: ${ticketPrice} por boleto.
                  <br />
                  <span className="font-medium">
                    {searchTicket ? (
                      <>
                        <span className="text-blue-600">{filteredTickets.length}</span> de{" "}
                        <span className="text-gray-600">{totalNumbers}</span> boletos encontrados
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600">{totalNumbers}</span> boletos en total
                      </>
                    )}
                    {" • "}
                    <span className="text-red-600">{soldTickets.length} vendidos</span>
                    {" • "}
                    <span className="text-orange-600">{heldTickets.length} retenidos</span>
                  </span>
                </CardDescription>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm mt-4">
                  {" "}
                  {/* Adjusted text size and flex-wrap */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border rounded"></div>
                    <span>Disponible ({availableCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Seleccionado ({selectedTickets.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Retenido ({heldTickets.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded shadow-sm"></div>
                    <span>Vendido ({soldTickets.length})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1">
                    {" "}
                    {/* Adjusted grid for smaller screens */}
                    {filteredTickets.map((i) => {
                      const status = getTicketStatus(i)
                      const isHeld = heldTickets.includes(i)
                      const isSold = soldTickets.includes(i)
                      const holdInfo = holdInfos[i]

                      let titleText = `Boleto #${i} - ${status === "available" ? "Disponible" : status === "selected" ? "Seleccionado" : ""}`
                      if (isSold) {
                        titleText = `Boleto #${i} - VENDIDO (Pago Confirmado por el Administrador)`
                      } else if (isHeld) {
                        titleText = `Boleto #${i} - RETENIDO (${holdInfo ? Math.ceil(holdInfo.timeRemaining / 60000) : HOLD_DURATION_MINUTES} min restantes)`
                      }

                      return (
                        <button
                          key={i}
                          data-ticket={i}
                          onClick={() => handleTicketClick(i)}
                          disabled={isSold || isHeld}
                          className={`
                            w-8 h-8 text-xs font-medium rounded transition-all duration-200 relative
                            ${getTicketColor(status)}
                            ${isSold || isHeld ? "opacity-90" : ""}
                          `}
                          title={titleText}
                        >
                          {i}
                          {isHeld && <Clock className="absolute -top-1 -right-1 w-3 h-3 text-orange-600" />}
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className={`sticky top-4 ${showCart ? "ring-2 ring-blue-500" : ""}`} ref={cartRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Tu Carrito
                </CardTitle>
                <CardDescription>{selectedTickets.length} boleto(s) seleccionado(s)</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Ningún boleto seleccionado</p>
                ) : (
                  <div className="space-y-3">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {selectedTickets
                          .sort((a, b) => a - b)
                          .map((ticket) => (
                            <div key={ticket} className="flex justify-between items-center text-sm">
                              <span>Boleto #{ticket}</span>
                              <div className="flex items-center gap-2">
                                <span>${ticketPrice.toFixed(2)}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleTicket(ticket)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={selectedTickets.length === 0}
                  size="lg"
                  onClick={async () => {
                    const { referenceId, error } = await savePurchaseAndHoldTickets(selectedTickets, totalCost + 2.5)
                    if (referenceId) {
                      localStorage.setItem("selectedTickets", JSON.stringify(selectedTickets))
                      localStorage.setItem("totalCost", totalCost.toString())
                      localStorage.setItem("currentPurchaseReferenceId", referenceId)
                      router.push("/payment")
                    } else {
                      alert(`Error al procesar la compra: ${error || "Desconocido"}`)
                    }
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Comprar Boletos
                </Button>
                {selectedTickets.length > 0 && (
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedTickets([])}>
                    Limpiar Selección
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Total de boletos: {totalNumbers} • Disponible: {availableCount} • Retenidos: {heldTickets.length} •
            Vendidos: {soldTickets.length}
          </p>
          {soldTickets.length > 0 && (
            <p className="text-red-700 font-medium mt-2">
              🔴 {soldTickets.length} boleto(s) vendido(s) permanentemente (pago confirmado por el administrador)
            </p>
          )}
          {heldTickets.length > 0 && (
            <p className="text-orange-600 font-medium mt-1">
              🟠 {heldTickets.length} boleto(s) retenido(s) temporalmente (esperando pago)
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="mr-2 h-4 w-4" />
              Acceso de Administrador
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
