import nodemailer from "nodemailer";

export async function sendMailServices(
  to: string,
  subject: string,
  text: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_EMAIL_ADDRESS,
      pass: process.env.NEXT_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.NEXT_EMAIL_ADDRESS,
    to,
    subject,
    text,
  });
}
