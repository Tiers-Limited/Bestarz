const bestarzLogo = `
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #ffffff, #d2d2d2); 
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); margin: 0;">
      Best<span style="background: linear-gradient(90deg, #ffffff, #f0f0f0); 
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
      text-shadow: 0 0 8px rgba(255,255,255,0.7), 0 0 4px rgba(0,0,0,0.2);">★</span>rz
    </h1>
  </div>
`;

function bookingEmailTemplate(booking) {
  // Helper to format location object as a string
  const formatLocation = (loc) => {
    if (!loc) return '';
    return `${loc.address || ''}, ${loc.city || ''}, ${loc.state || ''}, ${loc.zipCode || ''}, ${loc.country || ''}`;
  };

  // Helper to format contact info
  const formatContact = (contact) => {
    if (!contact) return '';
    return `${contact.email || ''} | ${contact.phone || ''}`;
  };

  return `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    ${bestarzLogo}

    <div style="background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">New Booking Request</h2>
      <p>Hello <strong>${booking.provider.user.firstName} ${booking.provider.user.lastName}</strong>,</p>
      <p>You’ve received a new booking request on <strong>Best★rz</strong>. Here are the details:</p>

      <ul style="line-height: 1.6; color: #444;">
        <li><strong>Client:</strong> ${booking.client.firstName} ${booking.client.lastName}</li>
        <li><strong>Event Type:</strong> ${booking.eventType || ''}</li>
        <li><strong>Service Category:</strong> ${booking.serviceCategory || ''}</li>
        <li><strong>Location:</strong> ${formatLocation(booking.location)}</li>
        <li><strong>Guests:</strong> ${booking.guests || ''}</li>
        <li><strong>Date:</strong> ${booking.dateStart || ''} to ${booking.dateEnd || ''}</li>
        <li><strong>Time:</strong> ${booking.eventTime || ''} (${booking.duration || ''} hrs)</li>
        <li><strong>Budget:</strong> $${booking.budgetMin || ''} - $${booking.budgetMax || ''}</li>
        <li><strong>Description:</strong> ${booking.description || ''}</li>
        <li><strong>Client Contact:</strong> ${formatContact(booking.contactInfo)}</li>
      </ul>

      <p style="margin-top: 20px;">
        Please log in to your provider dashboard to review and respond.
      </p>

      <a href="https://bestarz.com/login" 
        style="display: inline-block; margin-top: 15px; padding: 12px 20px; 
        background: #333; color: #fff; text-decoration: none; 
        border-radius: 6px; font-weight: bold;">View Booking</a>
    </div>

    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Best★rz. All rights reserved.
    </div>
  </div>
  `;
}

module.exports = bookingEmailTemplate;
