import { transporter } from "../config/mail.config.js";
import Constants from "../constant.js";

async function sendMail({email= [], subject="", html=""}) {
  const info = await transporter.sendMail({
    from: Constants.EMAIL_FR0M,
    to: email.join(", "),
    subject: subject,
    html: html, 
  });

  return info
}

export default sendMail