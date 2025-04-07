// This is a mock SMS service
// In a real application, you would use a service like Twilio

export async function sendSMS(phoneNumber, message) {
  // In a real application, this would send an actual SMS
  console.log(`Sending SMS to ${phoneNumber}: ${message}`)

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("SMS sent successfully")
      resolve({ success: true })
    }, 1000)
  })
}

