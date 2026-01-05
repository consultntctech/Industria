import { IResponse } from "@/types/Types"
import { getWelcomeEmailHTML, renderPasswordResetEmail, WelcomeEmailParams } from "@/utils/emailtemplate";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

export const respond = (message:string, error:boolean, payload?:object, code?:number):IResponse=>{
    const data:IResponse  = {
        message, error, payload, code
    } 
    return JSON.parse(JSON.stringify(data))
}

export const encryptPassword = async(text:string):Promise<string>=>{
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(text, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error)
        return '';
    }
}


export const comparePassword = async(text:string, hash:string):Promise<boolean>=>{
    try {
        const isMatch = await bcrypt.compare(text, hash);
        return isMatch;
    } catch (error) {
        console.log(error);
        return false;
    }
}


 const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST || "smtp.gmail.com",
    // port: Number(process.env.SMTP_PORT) || 587,
    // secure: false,
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_PASS!,
    },
  });



export interface SendWelcomeEmailOptions extends WelcomeEmailParams {
  to: string;
}

export async function sendWelcomeEmail({
  to,
  companyName,
  companyInitials,
  userName,
  userEmail,
  password,
  appUrl,
  supportEmail,
}: SendWelcomeEmailOptions): Promise<void> {
  const html = getWelcomeEmailHTML({
    companyName,
    companyInitials,
    userName,
    userEmail,
    password,
    appUrl,
    supportEmail,
  });

  
 

  // console.log(process.env.GMAIL_USER, process.env.GMAIL_PASS)

  await transporter.sendMail({
    from: `"${companyName}" <${supportEmail}>`,
    to,
    subject: `Welcome to ${companyName}!`,
    html,
  });

  console.log(`✅ Welcome email sent to ${to}`);
}



export async function sendPasswordResetEmail(
  to: string,
  token: string
) {
  const resetUrl =
    `https://industra-app.vercel.app/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Industra" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Reset your Industra password',
    html: renderPasswordResetEmail({ resetUrl })
  });
}