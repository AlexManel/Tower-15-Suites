
import { RealBooking, Property } from '../types';

export const emailService = {
  /**
   * Sends a confirmation email to the guest.
   * In a real production environment, this would call a serverless function (e.g., Supabase Edge Function)
   * or a third-party email API (SendGrid, Resend, Postmark) to securely handle SMTP credentials.
   */
  sendConfirmationEmail: async (booking: RealBooking, property: Property, guestName: string) => {
    console.log(`[EmailService] Preparing confirmation email for ${booking.guestEmail}...`);

    // Constructing the email payload
    const emailData = {
      to: booking.guestEmail,
      subject: `Confirmation: Your stay at ${property.title}`,
      body: `
        Dear ${guestName},

        Thank you for choosing TOWER 15 Suites.
        We are thrilled to confirm your reservation.

        RESERVATION DETAILS
        -------------------
        Property: ${property.title}
        Location: ${property.location}
        
        Check-in:  ${booking.checkIn} (from 15:00)
        Check-out: ${booking.checkOut} (by 11:00)
        
        Confirmation Code: ${booking.id}
        Total Paid: $${booking.amount}

        Next Steps:
        You will receive a separate email 24 hours before your arrival containing:
        - Electronic Door Codes
        - WiFi Credentials
        - Google Maps Directions

        If you have any special requests, simply reply to this email.

        Warm regards,
        The TOWER 15 Team
      `
    };

    try {
      // SIMULATION OF API CALL
      // In production: await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      
      console.log(`[EmailService] Email sent successfully to ${booking.guestEmail}`);
      console.log(`[EmailService] Content Preview:`, emailData.body);
      
      return true;
    } catch (error) {
      console.error("[EmailService] Failed to send email:", error);
      // We return true anyway to not block the checkout flow UI, as the booking is already confirmed in DB
      return false;
    }
  }
};
