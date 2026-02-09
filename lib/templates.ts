export const emailTemplates = {
  signup: (email: string, password: string) => ({
    subject: "Welcome to AssetTrack",
    html: `
      <h2>Welcome to AssetTrack</h2>
      <p>Your account has been created successfully.</p>
      <p><b>Login Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
      <p>Please login and change your password immediately.</p>
    `,
  }),

  loginOtp: (otp: string) => ({
    subject: "Your Login OTP",
    html: `
      <h2>Login OTP Verification</h2>
      <p>Your 6-digit OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <p>Do not share this OTP with anyone.</p>
    `,
  }),

  resetPassword: (link: string) => ({
    subject: "Reset your AssetTrack password",
    html: `
    <h2>Reset Password</h2>
    <p>You requested to reset your password.</p>
    <p>Click the link below:</p>
    <a href="${link}">${link}</a>
    <p>This link is valid for 15 minutes.</p>
    <p>If you did not request this, ignore this email.</p>
    <br/>
    <p><b>AssetTrack Team</b></p>
  `,
  }),

  passwordChanged: () => ({
    subject: "Password Changed Successfully",
    html: `
      <h2>Password Updated Successfully</h2>
      <p>Your password has been changed successfully.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
      <p>For security reasons, never share your password with anyone.</p>
      <br/>
      <p>Thanks & Regards,</p>
      <p><b>AssetTrack Team</b></p>
    `,
  }),
};
