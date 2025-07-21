"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ticket, Info, CheckCircle, CreditCard, Settings, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HOLD_DURATION_MINUTES } from "@/lib/ticket-holding"

export default function PaymentPage() {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [referenceId, setReferenceId] = useState("")

  useEffect(() => {
    const tickets = localStorage.getItem("selectedTickets")
    const cost = localStorage.getItem("totalCost")
    const refId = localStorage.getItem("currentPurchaseReferenceId")

    if (tickets && cost && refId) {
      setSelectedTickets(JSON.parse(tickets))
      setTotalCost(Number.parseFloat(cost))
      setReferenceId(refId)
    } else {
      router.push("/")
    }
  }, [router])

  const handleConfirmPurchase = useCallback(() => {
    setShowConfirmation(true)
    localStorage.removeItem("selectedTickets")
    localStorage.removeItem("totalCost")
    localStorage.removeItem("currentPurchaseReferenceId")
  }, [])

  const handleBackToUserInterface = () => {
    router.push("/")
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        {" "}
        {/* Adjusted padding */}
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">¡Compra Confirmada!</CardTitle>
            <CardDescription>
              Tus boletos de lotería han sido reservados por {HOLD_DURATION_MINUTES} minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">Resumen de Compra:</h3> {/* Adjusted title size */}
              <div className="space-y-2 text-left text-sm sm:text-base">
                {" "}
                {/* Adjusted text size */}
                <div className="flex justify-between">
                  <span>Boletos Seleccionados:</span>
                  <span className="font-medium">{selectedTickets.length} boletos</span>
                </div>
                <div className="flex justify-between">
                  <span>Números de Boleto:</span>
                  <span className="font-medium">{selectedTickets.sort((a, b) => a - b).join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monto Total:</span>
                  <span className="font-medium">${(totalCost + 2.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  {" "}
                  {/* Adjusted text size */}
                  <span>ID de Referencia:</span>
                  <span>{referenceId}</span>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">
                {" "}
                {/* Adjusted text size */}
                Tus boletos están ahora <strong>retenidos por {HOLD_DURATION_MINUTES} minutos</strong>. Por favor,
                completa el proceso de pago dentro de este tiempo para asegurar tu compra. Si el pago no se recibe en{" "}
                {HOLD_DURATION_MINUTES} minutos, los boletos serán liberados automáticamente.
              </AlertDescription>
            </Alert>

            <Button onClick={handleBackToUserInterface} className="w-full" size="lg">
              <Users className="mr-2 h-4 w-4" />
              Volver a la Interfaz de Usuario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {" "}
      {/* Adjusted padding */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Interfaz de Usuario
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Resumen de Compra</h1>{" "}
          {/* Adjusted title size */}
          <p className="text-sm sm:text-base text-gray-600">
            Revisa tus boletos seleccionados de la Interfaz de Usuario
          </p>{" "}
          {/* Adjusted text size */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {" "}
          {/* Stacks on mobile, 3 columns on large screens */}
          {/* Ticket Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ticket className="h-5 w-5" />
                  Boletos Seleccionados
                </CardTitle>
                <CardDescription className="text-sm">
                  Has seleccionado {selectedTickets.length} boleto{selectedTickets.length !== 1 ? "s" : ""} de lotería
                  de la Interfaz de Usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {" "}
                    {/* Adjusted grid for badges */}
                    {selectedTickets
                      .sort((a, b) => a - b)
                      .map((ticket) => (
                        <Badge key={ticket} variant="secondary" className="justify-center py-2 text-xs sm:text-sm">
                          {" "}
                          {/* Adjusted badge text size */}#{ticket}
                        </Badge>
                      ))}
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 text-base">Tus Números de la Suerte:</h4>{" "}
                    {/* Adjusted title size */}
                    <p className="text-blue-800 text-base sm:text-lg font-medium">
                      {" "}
                      {/* Adjusted text size */}
                      {selectedTickets.sort((a, b) => a - b).join(" • ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-5 w-5" />
                  Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Fecha del Sorteo:</strong> El próximo sorteo se realizará el domingo a las 8:00 PM EST
                  </AlertDescription>
                </Alert>

                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-sm">
                    <strong>Política de Retención de Boletos:</strong> Después de confirmar tu compra, los boletos se
                    retendrán por {HOLD_DURATION_MINUTES} minutos. Completa el pago dentro de este tiempo o los boletos
                    serán liberados automáticamente.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-xs sm:text-sm">
                  {" "}
                  {/* Adjusted text size */}
                  <div>
                    <h4 className="font-semibold mb-1">Cómo funciona:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Cada boleto cuesta $5.00</li>
                      <li>
                        Los boletos se retienen por {HOLD_DURATION_MINUTES} minutos después de la confirmación de compra
                      </li>
                      <li>Los ganadores serán anunciados dentro de las 24 horas del sorteo</li>
                      <li>Los premios se distribuirán según el número de boletos coincidentes</li>
                      <li>Todas las ventas son finales - no hay reembolsos ni cambios</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Estructura de Premios:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Gran Premio: $10,000 (1 ganador)</li>
                      <li>Segundo Premio: $1,000 (5 ganadores)</li>
                      <li>Tercer Premio: $100 (50 ganadores)</li>
                      <li>Premio de Consolación: $10 (100 ganadores)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Información de Contacto:</h4>
                    <p className="text-gray-600">
                      Para preguntas o soporte, contáctanos en support@lottery.com o llama al 1-800-LOTTERY
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Purchase Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm sm:text-base">
                  {" "}
                  {/* Adjusted text size */}
                  <div className="flex justify-between">
                    <span className="text-sm">Número de Boletos:</span>
                    <span className="font-medium">{selectedTickets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Precio por Boleto:</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tarifa de Procesamiento:</span>
                    <span className="font-medium">$2.50</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${(totalCost + 2.5).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button onClick={handleConfirmPurchase} className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Confirmar Compra y Retener Boletos
                  </Button>

                  <Button variant="outline" onClick={() => router.back()} className="w-full">
                    Modificar Selección
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2">
                  Al confirmar, los boletos se retendrán por {HOLD_DURATION_MINUTES} minutos
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
