import dotenv from "dotenv";

dotenv.config();

export default class Constants {
  static PORT = process.env.PORT;
  static DB_URI = process.env.DB_URI;
  static SECRET_KEY = process.env.SECRET_KEY;

  static EMAIL_HOST = process.env.EMAIL_HOST;
  static EMAIL_PORT = process.env.EMAIL_PORT;
  static EMAIL_USER = process.env.EMAIL_USER;
  static EMAIL_PASS = process.env.EMAIL_PASS;
  static EMAIL_FR0M = process.env.EMAIL_FR0M;

  static CLOUD_NAME = process.env.CLOUD_NAME;
  static API_KEY = process.env.API_KEY;
  static API_SECRET = process.env.API_SECRET;

}
