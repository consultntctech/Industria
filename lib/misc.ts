import { IResponse } from "@/types/Types"
import { getWelcomeEmailHTML, renderPasswordResetEmail, WelcomeEmailParams } from "@/utils/emailtemplate";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Types } from 'mongoose';
import {  IRole } from "./models/role.model";
import { IDepartment } from "./models/department.model";


export type RoleRef = string | Types.ObjectId | IRole;
export type DepartmentRef = string | Types.ObjectId | IDepartment;

export const toIdString = (v: RoleRef | DepartmentRef | undefined | null): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (v instanceof Types.ObjectId) return v.toString();

  const id = v._id as unknown as string | Types.ObjectId;
  return typeof id === "string" ? id : id.toString();
};


export const toIdStrings = (refs: RoleRef[] | undefined): string[] =>
  (refs ?? [])
    .map((r) => toIdString(r))
    .filter((id): id is string => id !== undefined);

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
    service: 'Gmail',
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
  companyLogo,
  userName,
  userEmail,
  password,
  appUrl,
  supportEmail,
}: SendWelcomeEmailOptions): Promise<void> {
  const html = getWelcomeEmailHTML({
    companyName,
    companyInitials,
    companyLogo,
    userName,
    userEmail,
    password,
    appUrl,
    supportEmail,
  });

  
 

  // console.log(process.env.GMAIL_USER, process.env.GMAIL_PASS)

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    replyTo: supportEmail,
    to,
    subject: `Welcome to ${companyName}!`,
    html,
  });
  // console.log('Email Response: ', emailRes)
  console.log(`✅ Welcome email sent to ${to}`);
}



export async function sendPasswordResetEmail(
  to: string,
  token: string
) {
  const resetUrl =
    `https://industra-app.vercel.app/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Industra" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your Industra password',
    html: renderPasswordResetEmail({ resetUrl })
  })
  // .then(res=>console.log(res));
}