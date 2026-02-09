import { sendMail } from "./index";
import { emailTemplates } from "./templates";

export async function sendSignupMail(email: string, password: string) {
  const { subject, html } = emailTemplates.signup(email, password);
  await sendMail({ to: email, subject, html });
}

export async function sendLoginOtpMail(email: string, otp: string) {
  const { subject, html } = emailTemplates.loginOtp(otp);
  await sendMail({ to: email, subject, html });
}

export async function sendResetPasswordMail(
  email: string,
  resetLink: string
) {
  const { subject, html } =
    emailTemplates.resetPassword(resetLink);

  await sendMail({
    to: email,
    subject,
    html,
  });
}

export async function sendPasswordChangedMail(email: string) {
  try {
    const { subject, html } = emailTemplates.passwordChanged();
    await sendMail({ to: email, subject, html });
  } catch (error) {
    console.error("Error sending password changed email:", error);
  }
}
