"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ticket, Info, CheckCircle, CreditCard, Settings, Users, Clock, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTicketPrice } from "@/lib/ticket-pricing"
import { HOLD_DURATION_MINUTES } from "@/lib/ticket-holding"
import { savePurchaseAndHoldTickets } from "@/app/actions"

export default function PaymentPage() {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [referenceId, setReferenceId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [ticketPrice, setTicketPrice] = useState(5.0)

  useEffect(() => {
    const tickets = localStorage.getItem("selectedTickets")
    const cost = localStorage.getItem("totalCost")

    // Get current ticket price
    const currentPrice = getTicketPrice()
    setTicketPrice(currentPrice)

    if (tickets && cost) {
      const ticketNumbers = JSON.parse(tickets)
      setSelectedTickets(ticketNumbers)
      // Recalculate total cost with current price
      const recalculatedCost = ticketNumbers.length * currentPrice
      setTotalCost(recalculatedCost)
    } else {
      router.push("/")
    }
  }, [router])

  const handleConfirmPurchase = useCallback(async () => {
    if (selectedTickets.length === 0) return

    setIsProcessing(true)

    try {
      // Retener los boletos al confirmar la compra
      const { referenceId: newReferenceId, error } = await savePurchaseAndHoldTickets(selectedTickets, totalCost)

      if (error) {
        alert(`Error al procesar la compra: ${error}`)
        setIsProcessing(false)
        return
      }

      if (newReferenceId) {
        setReferenceId(newReferenceId)
        setShowConfirmation(true)
        localStorage.removeItem("selectedTickets")
        localStorage.removeItem("totalCost")
      }
    } catch (error) {
      console.error("Error al confirmar la compra:", error)
      alert("Error inesperado al procesar la compra")
    } finally {
      setIsProcessing(false)
    }
  }, [selectedTickets, totalCost])

  const handleBackToUserInterface = () => {
    router.push("/")
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl text-center shadow-2xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-green-600 mb-2">¡Compra Confirmada!</CardTitle>
            <CardDescription className="text-lg">
              Tus boletos de lotería han sido reservados por {HOLD_DURATION_MINUTES} minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-inner">
              <h3 className="font-bold mb-4 text-xl text-gray-800 flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Resumen de Compra
              </h3>
              <div className="space-y-3 text-left text-sm sm:text-base">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="font-medium">Boletos Seleccionados:</span>
                  <Badge className="bg-blue-500">{selectedTickets.length} boletos</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="font-medium">Números de Boleto:</span>
                  <span className="font-mono text-blue-600">{selectedTickets.sort((a, b) => a - b).join(", ")}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="font-medium">Precio por Boleto:</span>
                  <span className="font-bold text-green-600">${ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="font-medium">Monto Total:</span>
                  <span className="font-bold text-green-600 text-lg">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg text-xs sm:text-sm">
                  <span className="font-medium">ID de Referencia:</span>
                  <span className="font-mono text-gray-600">{referenceId}</span>
                </div>
              </div>
            </div>

            <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm sm:text-base">
                <strong className="text-orange-800">¡Importante!</strong> Tus boletos están ahora{" "}
                <strong className="text-orange-700">retenidos por {HOLD_DURATION_MINUTES} minutos</strong>. Por favor,
                completa el proceso de pago dentro de este tiempo para asegurar tu compra. Si el pago no se recibe en{" "}
                {HOLD_DURATION_MINUTES} minutos, los boletos serán liberados automáticamente.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">Próximos Pasos:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Completa el pago en los próximos {HOLD_DURATION_MINUTES} minutos</li>
                <li>
                  • Guarda tu ID de referencia: <strong>{referenceId}</strong>
                </li>
                <li>• El administrador confirmará tu pago</li>
                <li>• Recibirás la confirmación final</li>
              </ul>
            </div>

            <Button
              onClick={handleBackToUserInterface}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <Users className="mr-2 h-4 w-4" />
              Volver a la Interfaz de Usuario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-white hover:bg-opacity-20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Interfaz de Usuario
          </Button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">💳 Resumen de Compra</h1>
            <p className="text-blue-100 text-lg">Revisa tus boletos seleccionados de la Interfaz de Usuario</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  Boletos Seleccionados
                </CardTitle>
                <CardDescription className="text-sm">
                  Has seleccionado {selectedTickets.length} boleto{selectedTickets.length !== 1 ? "s" : ""} de lotería
                  de la Interfaz de Usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {selectedTickets
                      .sort((a, b) => a - b)
                      .map((ticket) => (
                        <Badge
                          key={ticket}
                          variant="secondary"
                          className="justify-center py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-purple-100 hover:shadow-md transition-all duration-300"
                        >
                          #{ticket}
                        </Badge>
                      ))}
                  </div>

                  <Separator />

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-inner">
                    <h4 className="font-semibold text-blue-900 mb-2 text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Tus Números de la Suerte:
                    </h4>
                    <p className="text-blue-800 text-base sm:text-lg font-bold">
                      {selectedTickets.sort((a, b) => a - b).join(" • ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Information Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-5 w-5 text-orange-600" />
                  Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <AlertDescription className="text-sm">
                    <strong>Fecha del Sorteo:</strong> El próximo sorteo se realizará el domingo a las 8:00 PM EST
                  </AlertDescription>
                </Alert>

                <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    <strong>Política de Retención de Boletos:</strong> Después de confirmar tu compra, los boletos se
                    retendrán por {HOLD_DURATION_MINUTES} minutos. Completa el pago dentro de este tiempo o los boletos
                    serán liberados automáticamente.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800">Cómo funciona:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Cada boleto cuesta ${ticketPrice.toFixed(2)}</li>
                      <li>Los boletos se retienen por {HOLD_DURATION_MINUTES} minutos</li>
                      <li>Los ganadores se anuncian en 24 horas</li>
                      <li>Premios según boletos coincidentes</li>
                      <li>Todas las ventas son finales</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800">Estructura de Premios:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>🏆 Gran Premio: $50,000 (1 ganador)</li>
                      <li>🥈 Segundo Premio: $5,000 (5 ganadores)</li>
                      <li>🥉 Tercer Premio: $500 (50 ganadores)</li>
                      <li>🎁 Premio Consolación: $50 (100 ganadores)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">Información de Contacto:</h4>
                  <p className="text-blue-800 text-sm">
                    Para preguntas o soporte, contáctanos en support@lottery.com o llama al 1-800-LOTTERY
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Purchase Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-xl text-center">💰 Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Número de Boletos:</span>
                    <Badge className="bg-blue-500">{selectedTickets.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Precio por Boleto:</span>
                    <span className="font-medium">${ticketPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
                    <span>Total:</span>
                    <span className="text-green-600">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleConfirmPurchase}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                    size="lg"
                    disabled={isProcessing || selectedTickets.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirmar Compra
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    disabled={isProcessing}
                  >
                    Modificar Selección
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2 bg-yellow-50 p-2 rounded-lg">
                  ⏰ Al confirmar, los boletos se retendrán por {HOLD_DURATION_MINUTES} minutos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
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
