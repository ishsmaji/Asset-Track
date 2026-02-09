// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// export async function sendMail({
//   to,
//   subject,
//   html,
// }: {
//   to: string;
//   subject: string;
//   html: string;
// }) {
//   return transporter.sendMail({
//     from: `Asset Manager <${process.env.MAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// }
