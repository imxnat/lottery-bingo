"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getInitialTicketData,
  confirmTicketPaymentAction,
  releaseTicketAction,
  clearAllPurchasedTicketsAction,
  getTicketHoldInfoAction,
} from "@/app/actions"
import type { Purchase } from "@/lib/ticket-holding"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [soldTickets, setSoldTickets] = useState<number[]>([])
  const [heldTickets, setHeldTickets] = useState<number[]>([])
  const [searchTicket, setSearchTicket] = useState("")
  const [holdInfoMap, setHoldInfoMap] = useState<{ [key: number]: any }>({})

  const ADMIN_CODE = "admin2025"

  const loadTicketData = useCallback(async () => {
    const data = await getInitialTicketData()
    setPurchases(data.purchases)
    setSoldTickets(data.soldTickets)
    setHeldTickets(data.heldTickets)
  }, [])

  const handleClearAllPurchasedTickets = async () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los boletos comprados? Esta acción no se puede deshacer.")) {
      const { success, error } = await clearAllPurchasedTicketsAction()
      if (success) {
        console.log("✅ All purchased tickets cleared!")
        loadTicketData()
      } else {
        alert(`Error al borrar boletos: ${error}`)
      }
    }
  }

  const handleConfirmPayment = async (ticketNumber: number) => {
    const { success, error } = await confirmTicketPaymentAction(ticketNumber)
    if (success) {
      loadTicketData()
    } else {
      alert(`Error al confirmar pago: ${error}`)
    }
  }

  const handleReleaseTicket = async (ticketNumber: number) => {
    const { success, error } = await releaseTicketAction(ticketNumber)
    if (success) {
      loadTicketData()
    } else {
      alert(`Error al liberar boleto: ${error}`)
    }
  }

  const getTicketInfo = useCallback(
    (ticketNumber: number) => {
      for (const purchase of purchases) {
        if (purchase.tickets.includes(ticketNumber)) {
          return {
            referenceId: purchase.referenceId,
            purchaseDate: purchase.purchaseDate,
            paymentConfirmed: purchase.paymentStatus?.[ticketNumber] || false,
          }
        }
      }
      return null
    },
    [purchases],
  )

  const getAllPurchasedTicketNumbers = useCallback(() => {
    const allTickets: number[] = []
    purchases.forEach((purchase) => {
      allTickets.push(...purchase.tickets)
    })
    return [...new Set(allTickets)].sort((a, b) => a - b)
  }, [purchases])

  const getFilteredTicketNumbers = useCallback(() => {
    const allTickets = getAllPurchasedTicketNumbers()
    if (!searchTicket.trim()) return allTickets

    return allTickets.filter((ticketNumber) => ticketNumber.toString().includes(searchTicket.trim()))
  }, [searchTicket, getAllPurchasedTicketNumbers])

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuthenticated")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
      loadTicketData()
    }

    const interval = setInterval(() => {
      if (isAuthenticated) {
        loadTicketData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, loadTicketData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminCode === ADMIN_CODE) {
      setIsAuthenticated(true)
      setError("")
      localStorage.setItem("adminAuthenticated", "true")
      await loadTicketData()
    } else {
      setError("Código de administrador inválido. Inténtalo de nuevo.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminCode("")
    localStorage.removeItem("adminAuthenticated")
    router.push("/")
  }

  const getTotalRevenue = () => {
    return purchases.reduce((total, purchase) => total + purchase.totalCost, 0)
  }

  useEffect(() => {
    const fetchHoldInfoForHeldTickets = async () => {
      const newHoldInfoMap: { [key: number]: any } = {}
      for (const ticketNumber of heldTickets) {
        const info = await getTicketHoldInfoAction(ticketNumber)
        newHoldInfoMap[ticketNumber] = info
      }
      setHoldInfoMap(newHoldInfoMap)
    }

    if (isAuthenticated) {
      fetchHoldInfoForHeldTickets()
    }
  }, [isAuthenticated, heldTickets])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        {" "}
        {/* Adjusted padding */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Acceso de Administrador</CardTitle>
            <CardDescription>Introduce el código de administrador para acceder al panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminCode">Código de Administrador</Label>
                <div className="relative">
                  <Input
                    id="adminCode"
                    type={showPassword ? "text" : "password"}
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Introduce el código de administrador"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {" "}
                {/* Adjusted for mobile stacking */}
                <Button type="submit" className="flex-1">
                  Iniciar Sesión
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {" "}
      {/* Adjusted padding */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            {" "}
            {/* Adjusted for mobile stacking */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>{" "}
              {/* Adjusted title size */}
              <p className="text-sm sm:text-base text-gray-600">
                Resumen y gestión de ventas de boletos de la Interfaz de Usuario
              </p>{" "}
              {/* Adjusted text size */}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {" "}
              {/* Adjusted for mobile stacking */}
              <Button variant="outline" onClick={() => router.push("/")} size="sm" className="w-full sm:w-auto">
                {" "}
                {/* Full width on mobile */}
                <Users className="mr-2 h-4 w-4" />
                Ver Interfaz de Usuario
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto bg-transparent">
                {" "}
                {/* Full width on mobile */}
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {" "}
          {/* Adjusted grid for smaller screens */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-xs text-muted-foreground">De la Interfaz de Usuario</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boletos Vendidos</CardTitle>
              <Ticket className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{soldTickets.length}</div>
              <p className="text-xs text-muted-foreground">Pago confirmado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boletos Retenidos</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{heldTickets.length}</div>
              <p className="text-xs text-muted-foreground">Esperando pago</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Incluyendo tarifas de procesamiento</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {" "}
          {/* Stacks on mobile, 3 columns on large screens */}
          {/* All Purchased Tickets with Payment Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    {" "}
                    {/* Adjusted for mobile stacking */}
                    <CardTitle className="text-xl">Todos los Boletos Comprados</CardTitle>
                    {getAllPurchasedTicketNumbers().length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllPurchasedTickets}
                        className="flex-shrink-0 w-full sm:w-auto" // Full width on mobile
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Borrar Todo
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {" "}
                    {/* Adjusted for mobile stacking */}
                    <div className="relative w-full sm:w-64 flex-shrink-0">
                      {" "}
                      {/* Full width on mobile */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Ticket className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        placeholder="Buscar por número de boleto..."
                        value={searchTicket}
                        onChange={(e) => setSearchTicket(e.target.value)}
                        className="pl-10 pr-10 w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500" // Full width on mobile
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
                    <CardDescription className="text-right text-xs sm:text-sm w-full sm:w-auto">
                      {" "}
                      {/* Adjusted text size and width */}
                      Gestión individual de boletos y confirmación de pago desde la Interfaz de Usuario
                      <br />
                      <span className="font-medium">
                        {searchTicket ? (
                          <>
                            <span className="text-blue-600">{getFilteredTicketNumbers().length}</span> de{" "}
                            <span className="text-gray-600">{getAllPurchasedTicketNumbers().length}</span> boletos
                            encontrados
                          </>
                        ) : (
                          <>
                            <span className="text-gray-600">{getAllPurchasedTicketNumbers().length}</span> boletos en
                            total
                          </>
                        )}
                        {" • "}
                        <span className="text-red-600">{soldTickets.length} vendidos</span>
                        {" • "}
                        <span className="text-orange-600">{heldTickets.length} retenidos</span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getAllPurchasedTicketNumbers().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2 text-sm">Aún no se han comprado boletos.</p>{" "}
                    {/* Adjusted text size */}
                    <p className="text-xs text-gray-400">
                      Los usuarios pueden comprar boletos a través de la Interfaz de Usuario.
                    </p>
                  </div>
                ) : getFilteredTicketNumbers().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2 text-sm">
                      No se encontraron boletos que coincidan con "{searchTicket}"
                    </p>{" "}
                    {/* Adjusted text size */}
                    <p className="text-xs text-gray-400">
                      Intenta un término de búsqueda diferente o borra la búsqueda.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {getFilteredTicketNumbers().map((ticketNumber) => {
                        const ticketInfo = getTicketInfo(ticketNumber)
                        const isPaymentConfirmed = ticketInfo?.paymentConfirmed || false
                        const isHeld = heldTickets.includes(ticketNumber)
                        const holdInfo = holdInfoMap[ticketNumber]
                        const timeRemaining = holdInfo ? Math.ceil(holdInfo.timeRemaining / 60000) : 0

                        return (
                          <div
                            key={ticketNumber}
                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border gap-2 sm:gap-0 ${
                              /* Adjusted for mobile stacking */
                              isPaymentConfirmed
                                ? "bg-red-50 border-red-200"
                                : isHeld && timeRemaining > 0
                                  ? "bg-orange-50 border-orange-200"
                                  : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                              {" "}
                              {/* Adjusted for mobile stacking */}
                              <Badge
                                variant={isPaymentConfirmed ? "default" : "secondary"}
                                className={`font-mono text-xs sm:text-sm ${
                                  /* Adjusted text size */
                                  isPaymentConfirmed
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : isHeld && timeRemaining > 0
                                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                                      : "bg-gray-600 hover:bg-gray-700 text-white"
                                }`}
                              >
                                #{ticketNumber.toString().padStart(4, "0")}
                              </Badge>
                              <div className="text-xs sm:text-sm">
                                {" "}
                                {/* Adjusted text size */}
                                <p className="font-medium flex items-center gap-2">
                                  {isPaymentConfirmed ? (
                                    <span className="text-red-600">✅ VENDIDO - Pago Confirmado</span>
                                  ) : isHeld && timeRemaining > 0 ? (
                                    <>
                                      <Clock className="w-4 h-4 text-orange-600" />
                                      <span className="text-orange-600">
                                        🟠 RETENIDO - Pago Pendiente ({timeRemaining} min restantes)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-600">⏰ Retención Expirada</span>
                                  )}
                                </p>
                                <p className="text-gray-500">
                                  Ref: {ticketInfo?.referenceId || "N/A"} • Comprado:{" "}
                                  {ticketInfo?.purchaseDate
                                    ? new Date(ticketInfo.purchaseDate).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                              {" "}
                              {/* Adjusted for mobile stacking */}
                              <span className="text-sm font-medium text-gray-600">$5.00</span>
                              {isPaymentConfirmed ? (
                                <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50 text-xs">
                                  {" "}
                                  {/* Adjusted text size */}
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  VENDIDO
                                </Badge>
                              ) : (
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                  {" "}
                                  {/* Adjusted for mobile stacking */}
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmPayment(ticketNumber)}
                                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" // Full width on mobile
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmar Pago
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReleaseTicket(ticketNumber)}
                                    className="w-full sm:w-auto" // Full width on mobile
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Liberar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Recent Transactions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Transacciones Recientes</CardTitle>
                <CardDescription className="text-sm">Últimas compras de la Interfaz de Usuario</CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-1 text-sm">Aún no hay transacciones.</p> {/* Adjusted text size */}
                    <p className="text-xs text-gray-400">Esperando compras de la Interfaz de Usuario.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {purchases
                        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                        .map((purchase) => (
                          <div key={purchase.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2 text-sm">
                              {" "}
                              {/* Adjusted text size */}
                              <span className="font-medium">
                                {purchase.tickets.length} boleto{purchase.tickets.length !== 1 ? "s" : ""}
                              </span>
                              <span className="font-bold">${purchase.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{purchase.referenceId}</div>
                            <div className="flex flex-wrap gap-1">
                              {purchase.tickets.slice(0, 5).map((ticket) => {
                                const isSold = purchase.paymentStatus?.[ticket] || false
                                const isHeld = heldTickets.includes(ticket)
                                return (
                                  <Badge
                                    key={ticket}
                                    variant="outline"
                                    className={`text-xs ${
                                      isSold
                                        ? "border-red-500 text-red-600 bg-red-50"
                                        : isHeld
                                          ? "border-orange-500 text-orange-600 bg-orange-50"
                                          : "border-gray-500 text-gray-600 bg-gray-50"
                                    }`}
                                  >
                                    #{ticket}
                                  </Badge>
                                )
                              })}
                              {purchase.tickets.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{purchase.tickets.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Transactions Table */}
        {purchases.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Detalles de la Transacción</CardTitle>
              <CardDescription className="text-sm">
                Historial completo de transacciones de la Interfaz de Usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {purchases
                    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                    .map((purchase) => (
                      <div key={purchase.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {" "}
                          {/* Adjusted grid for smaller screens */}
                          <div>
                            <Label className="text-xs text-gray-500">ID de Referencia</Label>
                            <p className="font-mono text-sm">{purchase.referenceId}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Fecha de Compra</Label>
                            <p className="text-sm">{new Date(purchase.purchaseDate).toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Cantidad de Boletos</Label>
                            <p className="text-sm font-medium">{purchase.tickets.length} tickets</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Monto Total</Label>
                            <p className="text-sm font-bold">${purchase.totalCost.toFixed(2)}</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div>
                          <Label className="text-xs text-gray-500">Ticket Numbers</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {purchase.tickets
                              .sort((a, b) => a - b)
                              .map((ticket) => {
                                const isSold = purchase.paymentStatus?.[ticket] || false
                                const isHeld = heldTickets.includes(ticket)
                                return (
                                  <Badge
                                    key={ticket}
                                    variant="outline"
                                    className={`text-xs ${
                                      isSold
                                        ? "border-red-500 text-red-600 bg-red-50"
                                        : isHeld
                                          ? "border-orange-500 text-orange-600 bg-orange-50"
                                          : "border-gray-500 text-gray-600 bg-gray-50"
                                    }`}
                                  >
                                    #{ticket} {isSold ? "VENDIDO" : isHeld ? "RETENIDO" : "EXPIRADO"}
                                  </Badge>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
