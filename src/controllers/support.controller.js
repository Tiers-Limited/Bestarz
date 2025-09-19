// controllers/supportController.js
import { transporter } from "../config/nodemailer.js";
import { customerSupportTemplate } from "../templates/customerSupportTemplate.js";

export const sendSupportRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const htmlContent = customerSupportTemplate(name, email, message);

    await transporter.sendMail({
      from: `"Best★rz Support" <${process.env.EMAIL}>`,
      to: process.env.SUPPORT_RECEIVER || process.env.EMAIL, // Support inbox
      subject: "New Customer Support Request",
      html: htmlContent,
    });

    return res.status(200).json({ message: "Support request sent successfully" });
  } catch (err) {
    console.error("Support email error:", err);
    return res.status(500).json({ message: "Error sending support request", error: err.message });
  }
};
