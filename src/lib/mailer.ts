import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  await transporter.sendMail({
    from: `"Новел сайт" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Нууц үг сэргээх холбоос",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #15131f; color: #f2eee3; padding: 32px; border-radius: 12px;">
        <h2 style="color: #e2a33b; margin-bottom: 8px;">🕯️ Нууц үг сэргээх</h2>
        <p style="color: #9c96b0; margin-bottom: 24px;">Сайн байна уу, <strong style="color: #f2eee3;">${name}</strong></p>
        <p style="margin-bottom: 24px;">Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх товч дээр дарж нууц үгээ шинэчлэнэ үү:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #e2a33b; color: #15131f; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 24px;">
          Нууц үг сэргээх
        </a>
        <p style="color: #9c96b0; font-size: 13px;">Энэ холбоос <strong>30 минут</strong> хүчинтэй байна.</p>
        <p style="color: #6e6884; font-size: 12px; margin-top: 24px; border-top: 1px solid #322c46; padding-top: 16px;">
          Хэрэв та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.
        </p>
      </div>
    `,
  });
}
