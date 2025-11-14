const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxXjEkrObDRzUN3Cm31fAbzmT6P9dpbcbXrN6VccVVXaepimrs2ynUhk5bJzVMm-_JPVw/exec"

// Generate a unique order ID
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Submit checkout data to Google Sheets
export async function submitToGoogleSheets(data, orderId, sheetName = "Sheet1") {
  try {
    const payloadData = {
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pinCode,
      landmark: "",
      quantity: data.quantity,
      total: data.totalPrice,
      timestamp: new Date().toLocaleString("en-IN"),
      orderStatus: "Pending",
      paymentMethod: data.paymentMethod,
      orderId: orderId,
      beneficiaryName: data.firstName,
      paymentTimestamp: new Date().toLocaleString("en-IN"),
    }

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?sheet=${sheetName}`, {
      method: "POST",
      body: JSON.stringify(payloadData),
      mode: "no-cors",
    })

    return {
      success: true,
      message: "Order data submitted successfully",
    }
  } catch (error) {
    console.error("Google Sheets submission error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit order",
    }
  }
}
