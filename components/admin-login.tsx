"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { authenticateAdmin } from "@/lib/admin-auth"
import { toast } from "@/components/ui/use-toast"

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa la contraseña",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const isAuthenticated = authenticateAdmin(password)

      if (isAuthenticated) {
        toast({
          title: "Acceso Concedido",
          description: "Bienvenido al panel de administración",
        })
        onLoginSuccess()
      } else {
        setAttempts((prev) => prev + 1)
        toast({
          title: "Acceso Denegado",
          description: "Contraseña incorrecta. Inténtalo de nuevo.",
          variant: "destructive",
        })
        setPassword("")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Error interno del sistema",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Ingresa tu contraseña para acceder</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Autenticación Requerida
            </CardTitle>
            <CardDescription className="text-center">
              Acceso restringido solo para administradores autorizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña de Administrador
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Acceder al Panel
                  </>
                )}
              </Button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">Información de Demostración</p>
                  <p className="text-xs text-amber-700">
                    Contraseña de prueba: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin123</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700">Sesión segura • Timeout automático en 30 minutos</p>
              </div>
            </div>

            {attempts > 0 && <div className="text-center text-sm text-red-600">Intentos fallidos: {attempts}</div>}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Sistema de Lotería Premium • Panel de Administración</p>
        </div>
      </div>
    </div>
  )
}
