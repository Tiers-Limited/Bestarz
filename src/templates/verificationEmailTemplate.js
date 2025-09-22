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

const verificationEmailTemplate = (name, link) => `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    ${bestarzLogo}
    <div style="background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for signing up on <strong>Best★rz</strong>. Please verify your email address by clicking the button below:</p>
      
      <a href="${link}" 
        style="display: inline-block; margin-top: 15px; padding: 12px 20px; 
        background: #333; color: #fff; text-decoration: none; 
        border-radius: 6px; font-weight: bold;">Verify Email</a>
        
      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        If you didn’t sign up, you can safely ignore this email.
      </p>
    </div>
    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Best★rz. All rights reserved.
    </div>
  </div>
`;

module.exports = verificationEmailTemplate;
