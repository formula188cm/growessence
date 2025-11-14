"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { generateOrderId, submitToGoogleSheets } from "@/lib/google-sheets"

const ENABLE_ONLINE_PAYMENT = false

function CheckoutContent() {
  const searchParams = useSearchParams()
  const quantity = Number.parseInt(searchParams.get("quantity") || "1")

  const BASE_PRICE = 799
  const COD_SHIPPING_FEE = 89
 





  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod" | null>(ENABLE_ONLINE_PAYMENT ? null : "cod")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  })

  const basePrice = BASE_PRICE
  const shippingFee = paymentMethod === "cod" ? COD_SHIPPING_FEE : 0
  const subtotal = basePrice * quantity
  const totalPrice = subtotal + shippingFee

 

 

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMethod) {
      setSubmitError("Please select a payment method")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const orderId = generateOrderId()
      const sheetName = paymentMethod === "online" ? "Sheet1" : "Sheet2"
      const result = await submitToGoogleSheets(
        {
          ...formData,
          paymentMethod,
          quantity,
          totalPrice,
        },
        orderId,
        sheetName,
      )

      if (result.success) {
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            ...formData,
            paymentMethod,
            quantity,
            totalPrice,
            orderId,
          }),
        )
        window.location.href = `/payment?total=${totalPrice}&method=${paymentMethod}&quantity=${quantity}&orderId=${orderId}`
      } else {
        setSubmitError(result.message)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-8 md:py-12 px-3 sm:px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 premium-text">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
            {/* Form - Main Column */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm md:text-base">
                  <p className="font-semibold mb-1">Error:</p>
                  <p>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Payment Method Selection */}
                <div className="p-4 md:p-8 bg-card border border-border rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {ENABLE_ONLINE_PAYMENT ? (
                      <div
                        className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "online"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("online")}
                      >
                        <div className="flex items-center gap-2 md:gap-3 mb-2">
                          <input type="radio" checked={paymentMethod === "online"} readOnly />
                          <h3 className="font-semibold text-sm md:text-base">Online Payment (Razorpay)</h3>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground ml-7">Instant UPI, cards & wallets via Razorpay</p>
                        <p className="text-base md:text-lg font-bold text-primary mt-2 ml-7">₹{BASE_PRICE}</p>
                      </div>
                    ) : (
                      <div className="p-3 md:p-4 border-2 border-dashed border-border rounded-lg bg-muted/30 text-sm md:text-base text-muted-foreground">
                        Online payments are temporarily disabled. Set <code>ENABLE_ONLINE_PAYMENT</code> to <code>true</code> in
                        <code>app/checkout/page.tsx</code> to restore Razorpay checkout.
                      </div>
                    )}

                    <div
                      className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <input type="radio" checked={paymentMethod === "cod"} readOnly />
                        <h3 className="font-semibold text-sm md:text-base">Cash on Delivery</h3>
                      </div>
                        <p className="text-xs md:text-sm text-muted-foreground ml-7">Pay on delivery</p>
                        <p className="text-base md:text-lg font-bold text-primary mt-2 ml-7">₹{BASE_PRICE} + ₹{COD_SHIPPING_FEE} shipping</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="p-4 md:p-8 bg-card border border-border rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Shipping Information</h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      />
                    </div>

                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      />
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                      >
                        <option value="">Select State/UT</option>
                        {[
                          "Andaman and Nicobar Islands",
                          "Andhra Pradesh",
                          "Arunachal Pradesh",
                          "Assam",
                          "Bihar",
                          "Chandigarh",
                          "Chhattisgarh",
                          "Dadra and Nagar Haveli and Daman and Diu",
                          "Delhi",
                          "Goa",
                          "Gujarat",
                          "Haryana",
                          "Himachal Pradesh",
                          "Jammu and Kashmir",
                          "Jharkhand",
                          "Karnataka",
                          "Kerala",
                          "Ladakh",
                          "Lakshadweep",
                          "Madhya Pradesh",
                          "Maharashtra",
                          "Manipur",
                          "Meghalaya",
                          "Mizoram",
                          "Nagaland",
                          "Odisha",
                          "Puducherry",
                          "Punjab",
                          "Rajasthan",
                          "Sikkim",
                          "Tamil Nadu",
                          "Telangana",
                          "Tripura",
                          "Uttar Pradesh",
                          "Uttarakhand",
                          "West Bengal",
                        ].map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      name="pinCode"
                      placeholder="PIN Code"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-border rounded-md bg-background text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base disabled:opacity-50"
                  disabled={!paymentMethod || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment"}
                </button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="h-fit">
              <div className="p-4 md:p-8 bg-card border border-border rounded-lg sticky top-20">
                <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h3>

                <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-border mb-4 md:mb-6 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grow Essence Serum × {quantity}</span>
                    <span className="font-semibold">₹{basePrice > 0 ? subtotal : "-"}</span>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3 pb-4 md:pb-6 border-b border-border mb-4 md:mb-6 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">4-5 Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">{shippingFee > 0 ? `₹${shippingFee}` : "FREE"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">Included</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <span className="font-bold text-base md:text-lg">Total</span>
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    ₹{basePrice > 0 ? totalPrice : "-"}
                  </span>
                </div>

                <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg text-xs md:text-sm text-green-900 mb-4 md:mb-6">
                  <p className="font-semibold">✓ Fast & Secure</p>
                  <p className="text-green-800">Checkout with confidence</p>
                </div>

                {paymentMethod && (
                  <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs md:text-sm text-blue-900">
                    <p className="font-semibold mb-1">Method:</p>
                    <p>{paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
