// In a real application, this would use a proper SMS service
export async function sendSMS(phoneNumber, message) {
  const accountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = process.env.VITE_TWILIO_AUTH_TOKEN;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const basicAuth = btoa(`${accountSid}:${authToken}`);

  const data = new URLSearchParams({
    Body: message,
    From: '+12693906946',
    To: phoneNumber
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data
    });

    if (!response.ok) {
      throw new Error(`Error sending SMS: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('SMS sent successfully:', responseData.sid);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

export function formatDeliveryMessage(orderId, status) {
  switch (status) {
    case 'Picked Up':
      return `Your package ${orderId} has been picked up and is on its way!`;
    case 'Delivered':
      return `Your package ${orderId} has been delivered. Thank you for using our service!`;
    default:
      return `Your package ${orderId} status has been updated to: ${status}`;
  }
}