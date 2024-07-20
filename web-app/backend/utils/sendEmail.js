import FormData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const mailgun = new Mailgun(FormData);
const mg = process.env.MAILGUN_CINEPHORIA_API_KEY
  ? mailgun.client({
      username: "api",
      key: process.env.MAILGUN_CINEPHORIA_API_KEY,
      url: "https://api.eu.mailgun.net",
    })
  : null;

const sendEmail = async ({
  to,
  subject,
  template,
  variables,
  from = null,
  text = null,
  html = null,
}) => {
  try {
    const messageData = {
      from,
      to,
      subject,
    };

    if (template) {
      messageData.template = template;
      messageData["h:X-Mailgun-Variables"] = JSON.stringify(variables);
    } else {
      messageData.text = text;
      messageData.html = html;
    }

    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );
    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail };
