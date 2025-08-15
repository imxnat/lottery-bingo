"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  DollarSign,
  Ticket,
  Clock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  X,
  Search,
  RotateCcw,
  Settings,
  Save,
  Edit,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getInitialTicketData, confirmTicketPaymentAction } from "@/app/actions"
import { releaseTicket } from "@/lib/ticket-holding"
import { getTicketPrice, setTicketPrice, getTicketPricing } from "@/lib/ticket-pricing"
import { isAdminAuthenticated, clearAdminSession, updateLastActivity } from "@/lib/admin-auth"
import { AdminLogin } from "@/components/admin-login"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [soldTickets, setSoldTickets] = useState<number[]>([])
  const [heldTickets, setHeldTickets] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingPayment, setConfirmingPayment] = useState<number | null>(null)
  const [releasingTicket, setReleasingTicket] = useState<number | null>(null)
  const [searchHeldTicket, setSearchHeldTicket] = useState("")
  const [resettingSystem, setResettingSystem] = useState(false)
  const [ticketPrice, setTicketPriceState] = useState(5.0)
  const [newTicketPrice, setNewTicketPrice] = useState("")
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [savingPrice, setSavingPrice] = useState(false)
  const router = useRouter()

  const totalNumbers = 10000

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated()
      setIsAuthenticated(authenticated)
      setIsCheckingAuth(false)

      if (authenticated) {
        updateLastActivity()
      }
    }

    checkAuth()
  }, [])

  // Update last activity on user interaction
  useEffect(() => {
    if (isAuthenticated) {
      const handleActivity = () => {
        updateLastActivity()
      }

      // Add event listeners for user activity
      window.addEventListener("click", handleActivity)
      window.addEventListener("keypress", handleActivity)
      window.addEventListener("scroll", handleActivity)

      return () => {
        window.removeEventListener("click", handleActivity)
        window.removeEventListener("keypress", handleActivity)
        window.removeEventListener("scroll", handleActivity)
      }
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const data = await getInitialTicketData()
      setSoldTickets(data.soldTickets)
      setHeldTickets(data.heldTickets)

      // Update ticket price from storage
      const currentPrice = getTicketPrice()
      setTicketPriceState(currentPrice)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
      // Refresh data every 5 seconds
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    updateLastActivity()
  }

  const handleConfirmPayment = async (ticketNumber: number) => {
    setConfirmingPayment(ticketNumber)
    try {
      const result = await confirmTicketPaymentAction(ticketNumber)
      if (result.success) {
        toast({
          title: "Pago Confirmado",
          description: `El pago del boleto #${ticketNumber} ha sido confirmado`,
        })
        // Refresh data
        await fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo confirmar el pago",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: "Error interno del servidor",
        variant: "destructive",
      })
    } finally {
      setConfirmingPayment(null)
    }
  }

  const handleReleaseTicket = async (ticketNumber: number) => {
    setReleasingTicket(ticketNumber)
    try {
      // Release the ticket from held status
      releaseTicket(ticketNumber)

      toast({
        title: "Boleto Liberado",
        description: `El boleto #${ticketNumber} ha sido liberado y está disponible nuevamente`,
      })

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error releasing ticket:", error)
      toast({
        title: "Error",
        description: "No se pudo liberar el boleto",
        variant: "destructive",
      })
    } finally {
      setReleasingTicket(null)
    }
  }

  const handleResetSystem = async () => {
    setResettingSystem(true)
    try {
      // Clear all localStorage data
      localStorage.removeItem("purchasedTickets")
      localStorage.removeItem("selectedTickets")
      localStorage.removeItem("totalCost")
      localStorage.removeItem("heldTickets")

      toast({
        title: "Sistema Reiniciado",
        description:
          "Todos los boletos han sido liberados y están disponibles nuevamente. El sistema ha sido reiniciado completamente.",
      })

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error resetting system:", error)
      toast({
        title: "Error",
        description: "No se pudo reiniciar el sistema",
        variant: "destructive",
      })
    } finally {
      setResettingSystem(false)
    }
  }

  const handleEditPrice = () => {
    setNewTicketPrice(ticketPrice.toString())
    setIsEditingPrice(true)
  }

  const handleSavePrice = async () => {
    const price = Number.parseFloat(newTicketPrice)

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un precio válido mayor a $0.00",
        variant: "destructive",
      })
      return
    }

    if (price > 1000) {
      toast({
        title: "Error",
        description: "El precio no puede ser mayor a $1,000.00",
        variant: "destructive",
      })
      return
    }

    setSavingPrice(true)
    try {
      setTicketPrice(price, "Administrador")
      setTicketPriceState(price)
      setIsEditingPrice(false)

      toast({
        title: "Precio Actualizado",
        description: `El precio del boleto ha sido actualizado a $${price.toFixed(2)}`,
      })
    } catch (error) {
      console.error("Error saving price:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive",
      })
    } finally {
      setSavingPrice(false)
    }
  }

  const handleCancelEditPrice = () => {
    setIsEditingPrice(false)
    setNewTicketPrice("")
  }

  const handleLogout = () => {
    // Clear admin session
    clearAdminSession()
    setIsAuthenticated(false)

    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente. Deberás autenticarte nuevamente para acceder.",
    })
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  // Filter held tickets based on search
  const filteredHeldTickets = heldTickets.filter(
    (ticket) => searchHeldTicket === "" || ticket.toString().includes(searchHeldTicket),
  )

  const availableCount = totalNumbers - soldTickets.length - heldTickets.length
  const totalRevenue = soldTickets.length * ticketPrice
  const potentialRevenue = heldTickets.length * ticketPrice
  const salesPercentage = ((soldTickets.length / totalNumbers) * 100).toFixed(2)
  const ticketPricing = getTicketPricing()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Sistema de Boletos
            </Button>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-500 bg-opacity-20 border-yellow-300 border-opacity-50 text-white hover:bg-yellow-500 hover:bg-opacity-30"
                    disabled={resettingSystem}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar Sistema
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      ¿Reiniciar Sistema Completo?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <strong>⚠️ ADVERTENCIA:</strong> Esta acción eliminará permanentemente:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <strong>{soldTickets.length}</strong> boletos vendidos (confirmados)
                      </li>
                      <li>
                        <strong>{heldTickets.length}</strong> boletos comprados (pendientes)
                      </li>
                      <li>Todo el historial de compras y pagos</li>
                      <li>Todas las selecciones de usuarios</li>
                    </ul>
                    <div className="text-red-600 font-medium">
                      Todos los <strong>{totalNumbers}</strong> boletos quedarán disponibles nuevamente.
                    </div>
                    <div className="text-sm text-gray-600">
                      Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetSystem}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={resettingSystem}
                    >
                      {resettingSystem ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Reiniciando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Sí, Reiniciar Sistema
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
                      <LogOut className="h-5 w-5" />
                      ¿Cerrar Sesión de Administrador?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Estás a punto de cerrar tu sesión de administrador. Deberás ingresar tu contraseña nuevamente para
                      acceder al panel.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Nota:</strong> Asegúrate de haber guardado todos los cambios antes de cerrar sesión.
                      </p>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sí, Cerrar Sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">🎯 Panel de Administración</h1>
            <p className="text-blue-100 text-lg">Gestiona las ventas y pagos de boletos de lotería</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Pricing Configuration Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50 mb-8 -mt-8">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-6 w-6 text-orange-600" />
              Configuración de Precios
            </CardTitle>
            <CardDescription>Gestiona el precio de los boletos de lotería</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Precio Actual del Boleto</Label>
                  {isEditingPrice ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-600">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="1000"
                          value={newTicketPrice}
                          onChange={(e) => setNewTicketPrice(e.target.value)}
                          className="text-2xl font-bold h-12 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSavePrice}
                          disabled={savingPrice}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          {savingPrice ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelEditPrice}
                          disabled={savingPrice}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50 bg-transparent"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-bold text-green-600">${ticketPrice.toFixed(2)}</div>
                      <Button
                        onClick={handleEditPrice}
                        size="sm"
                        variant="outline"
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Precio
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Información del Precio</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Última actualización:</span>
                      <span className="font-medium">
                        {new Date(ticketPricing.lastUpdated).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actualizado por:</span>
                      <span className="font-medium">{ticketPricing.updatedBy || "Sistema"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingresos por boleto:</span>
                      <span className="font-medium text-green-600">${ticketPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Boletos Disponibles</CardTitle>
              <Ticket className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{availableCount.toLocaleString()}</div>
              <p className="text-xs text-green-600">de {totalNumbers.toLocaleString()} totales</p>
              <div className="mt-2 bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(availableCount / totalNumbers) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Boletos Vendidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{soldTickets.length.toLocaleString()}</div>
              <p className="text-xs text-blue-600">{salesPercentage}% del total</p>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${salesPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Boletos Comprados</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{heldTickets.length.toLocaleString()}</div>
              <p className="text-xs text-orange-600">Esperando confirmación de pago</p>
              {heldTickets.length > 0 && (
                <div className="mt-2 flex items-center text-xs text-orange-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requiere atención
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-purple-600">+${potentialRevenue.toFixed(2)} potencial</p>
              <div className="mt-2 flex items-center text-xs text-purple-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Ingresos confirmados
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Held Tickets Section with Search */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-xl">Boletos Comprados</CardTitle>
                  {heldTickets.length > 0 && (
                    <Badge className="bg-orange-500 text-white animate-pulse">{heldTickets.length}</Badge>
                  )}
                </div>
                <div className="relative w-full sm:w-64 flex-shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Buscar boleto comprado..."
                    value={searchHeldTicket}
                    onChange={(e) => setSearchHeldTicket(e.target.value)}
                    className="pl-10 pr-10 w-full h-10 border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-full bg-white"
                  />
                  {searchHeldTicket && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-orange-100 text-gray-400 hover:text-gray-600 rounded-full"
                      onClick={() => setSearchHeldTicket("")}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                Boletos que han sido comprados y están esperando confirmación de pago
                {searchHeldTicket && (
                  <span className="block mt-1 text-orange-700 font-medium">
                    Mostrando {filteredHeldTickets.length} de {heldTickets.length} boletos comprados
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {heldTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-gray-500 text-lg">No hay boletos comprados actualmente</p>
                  <p className="text-gray-400 text-sm mt-2">Todos los pagos están al día</p>
                </div>
              ) : filteredHeldTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">No se encontraron boletos comprados</p>
                  <p className="text-gray-400 text-sm mt-2">
                    No hay boletos comprados que coincidan con "{searchHeldTicket}"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchHeldTicket("")}
                    className="mt-3 text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredHeldTickets.map((ticket) => (
                      <div
                        key={ticket}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-800 border-orange-300 font-bold"
                          >
                            #{ticket}
                          </Badge>
                          <div>
                            <p className="font-semibold text-gray-900">Boleto #{ticket}</p>
                            <p className="text-sm text-gray-600">Precio: ${ticketPrice.toFixed(2)}</p>
                            <p className="text-xs text-orange-600">⏰ Tiempo límite: 30 min</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleConfirmPayment(ticket)}
                            disabled={confirmingPayment === ticket || releasingTicket === ticket}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md transform hover:scale-105 transition-all duration-300"
                          >
                            {confirmingPayment === ticket ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Confirmando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar Pago
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReleaseTicket(ticket)}
                            disabled={confirmingPayment === ticket || releasingTicket === ticket}
                            size="sm"
                            variant="outline"
                            className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-300 text-red-700 hover:text-red-800 shadow-md transform hover:scale-105 transition-all duration-300"
                          >
                            {releasingTicket === ticket ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Liberando...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Liberar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Sold Tickets Section */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Boletos Vendidos
                {soldTickets.length > 0 && <Badge className="bg-green-500 text-white">{soldTickets.length}</Badge>}
              </CardTitle>
              <CardDescription>Boletos con pago confirmado por el administrador</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {soldTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎫</div>
                  <p className="text-gray-500 text-lg">No hay boletos vendidos aún</p>
                  <p className="text-gray-400 text-sm mt-2">Los boletos confirmados aparecerán aquí</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {soldTickets.map((ticket) => (
                      <Badge
                        key={ticket}
                        variant="outline"
                        className="justify-center py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-300 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                      >
                        #{ticket}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Summary Section */}
        <Card className="mt-6 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-blue-600" />
              Resumen del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">{salesPercentage}%</div>
                <p className="text-sm text-gray-600 font-medium">Boletos Vendidos</p>
                <div className="mt-3 bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${salesPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl font-bold text-green-600 mb-2">${totalRevenue.toFixed(2)}</div>
                <p className="text-sm text-gray-600 font-medium">Ingresos Confirmados</p>
                <p className="text-xs text-green-600 mt-1">💰 Pagos procesados</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl font-bold text-orange-600 mb-2">{heldTickets.length}</div>
                <p className="text-sm text-gray-600 font-medium">Pagos Pendientes</p>
                <p className="text-xs text-orange-600 mt-1">⏳ Esperando confirmación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
