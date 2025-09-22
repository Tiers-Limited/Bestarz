// utils/emailTemplates.js

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

// Customer Support Email Template
const customerSupportTemplate = (customerName, customerEmail, message) => `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    ${bestarzLogo}

    <div style="background: #fff; border-radius: 12px; padding: 20px; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin-top: 0;">New Customer Support Request</h2>

      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>

      <p style="margin-top: 10px; color: #444;"><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ddd; margin: 10px 0; padding-left: 10px; color: #555;">
        ${message}
      </blockquote>

      <p style="margin-top: 20px;">
        Please respond to the customer as soon as possible.
      </p>
    </div>

    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Best★rz Support Team. All rights reserved.
    </div>
  </div>
`;

module.exports = customerSupportTemplate;
