import { Resend} from 'resend'
import { env } from '../config/env'
import AppError from '../errors/AppError';
import logger from '../utils/logger';

const resend = new Resend(env.RESEND_API_KEY)

export const sendOTPEmail = async (to: string, code: string, subject: string) => {
    console.log("Sending OTP email to", to);
    const {data, error} = await resend.emails.send({
        from: 'My App <onboarding@resend.dev>',
        to,
        subject,
       html: `
      <div
        style="
          font-family: Arial;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #ddd;" >
        <h2> Confirm this email address </h2>
        <p> Hi,</p>
        <p>To help us confirm your identity, we need to verify your email address.</p>
        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 30px 0;
            color: #1877f2;
          "> ${code}</div>
        <p>Don't share this code with anyone.</p>
        <hr />
        <h3>If someone asks for this code</h3>
        <p> Don't share this code with anyone, even if they claim to work for support.</p>
        <h3>Didn't expect this?</h3>
        <p> If you didn't request this, you can safely ignore this email.</p>
        <br />
        <p>Thanks,<br />My App Security</p>
    </div>`
    })
    if (error) {
        logger.error("Error sending OTP email:", error);
        throw new AppError("Failed to send OTP email", 500);
    }
}
