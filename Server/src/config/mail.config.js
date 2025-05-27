import nodemailer from "nodemailer";
import Constants from "../constant.js";

export const transporter = nodemailer.createTransport({
  host: Constants.EMAIL_HOST,
  port: Constants.EMAIL_PORT,
  secure: true, 
  auth: {
    user: Constants.EMAIL_USER,
    pass: Constants.EMAIL_PASS,
  },
});
