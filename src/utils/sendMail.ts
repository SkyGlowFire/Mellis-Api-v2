import * as nodemailer from 'nodemailer'

export interface MailOptions{
    email: string
    subject: string
    html: string
}

export const sendMail = async (options: MailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: `${options.email}`,
    subject: options.subject,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
};
