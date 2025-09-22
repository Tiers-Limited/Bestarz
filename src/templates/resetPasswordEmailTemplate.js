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

const resetPasswordEmailTemplate = (name, link) => `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
    ${bestarzLogo}
    <div style="background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password for your <strong>Best★rz</strong> account.</p>
      <p>Click the button below to create a new password:</p>
      
      <a href="${link}" 
        style="display: inline-block; margin-top: 15px; padding: 12px 20px; 
        background: #333; color: #fff; text-decoration: none; 
        border-radius: 6px; font-weight: bold;">Reset Password</a>
        
      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        This link will expire in 30 minutes for security reasons. If you didn’t request a password reset, you can safely ignore this email.
      </p>
    </div>
    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Best★rz. All rights reserved.
    </div>
  </div>
`;

module.exports = {
  resetPasswordEmailTemplate,
  bestarzLogo
};
