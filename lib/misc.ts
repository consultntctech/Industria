import { IResponse } from "@/types/Types"
import { getWelcomeEmailHTML, renderPasswordResetEmail, WelcomeEmailParams } from "@/utils/emailtemplate";
import bcrypt from 'bcrypt';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { Types } from 'mongoose';
import {  IRole } from "./models/role.model";
import { IDepartment } from "./models/department.model";

import { randomInt } from "crypto";
// import type { FilterQuery } from "mongoose";



interface INumberConfig {
    length: number;
    prefix?: string;
    suffix?: string;
    auto: boolean;
}

export interface INumberRecord {
    org: unknown;
    code: string;
    auto: boolean;
}

export interface IExistingNumber {
    code: string;
    auto: boolean;
}

export interface INumberResult {
    code: string;
    length: number;
    auto: boolean;
}

export function formatNumber(
    value: number,
    config: INumberConfig,
    length: number
): string {
    const number = String(value).padStart(length, "0");

    return `${config.prefix ?? ""}${number}${config.suffix ?? ""}`;
}

function extractNumber(
    code: string,
    config: INumberConfig
): number | null {
    const prefix = config.prefix ?? "";
    const suffix = config.suffix ?? "";

    if (!code.startsWith(prefix) || !code.endsWith(suffix)) {
        return null;
    }

    const end = suffix.length > 0
        ? code.length - suffix.length
        : code.length;

    const numericPart = code.slice(prefix.length, end);

    if (!/^\d+$/.test(numericPart)) {
        return null;
    }

    const value = Number(numericPart);

    return Number.isSafeInteger(value) ? value : null;
}

export async function generateTransactionNumber(
    config: INumberConfig,
    existingNumbers: IExistingNumber[]
): Promise<INumberResult> {
    const initialLength = Math.max(1, config.length);
    // const prefix = config.prefix ?? "";
    // const suffix = config.suffix ?? "";

    const existingCodes = new Set(
        existingNumbers.map((item) => item.code)
    );

    if (config.auto) {
        const length = initialLength;
        const minimum = 10 ** (length - 1);
        const maximum = 10 ** length;

        // Generate a random number and reject duplicates.
        // Lengths beyond 15 digits require a different random
        // number strategy because JavaScript numbers lose precision.
        if (length > 15) {
            throw new Error(
                "Random numbering supports a maximum length of 15 digits."
            );
        }

        for (let attempt = 0; attempt < 1000; attempt++) {
            const value = length === 1
                ? randomInt(0, 10)
                : randomInt(minimum, maximum);

            const code = formatNumber(value, config, length);

            if (!existingCodes.has(code)) {
                return { code, length, auto:true };
            }
        }

        throw new Error(
            "Unable to generate a unique random transaction number."
        );
    }

    let highestNumber = 0;

    for (const item of existingNumbers) {
        if (item.auto) {
            continue;
        }

        const value = extractNumber(item.code, config);

        if (value !== null && value > highestNumber) {
            highestNumber = value;
        }
    }

    let length = initialLength;
    let nextNumber = highestNumber + 1;

    while (nextNumber >= 10 ** length) {
        length++;
    }

    if (!Number.isSafeInteger(nextNumber)) {
        throw new Error("The transaction number sequence has overflowed.");
    }

    for (let attempt = 0; attempt < 1000; attempt++) {
        const code = formatNumber(nextNumber, config, length);

        if (!existingCodes.has(code)) {
            return { code, length, auto:false };
        }

        nextNumber++;

        while (nextNumber >= 10 ** length) {
            length++;
        }

        if (!Number.isSafeInteger(nextNumber)) {
            throw new Error(
                "The transaction number sequence has overflowed."
            );
        }
    }

    throw new Error(
        "Unable to generate a unique sequential transaction number."
    );
}


export function getRequiredLength(
    config: INumberConfig,
    existingNumbers: IExistingNumber[]
): number {
    let highestNumber = 0;

    for (const item of existingNumbers) {
        if (item.auto) {
            continue;
        }

        const value = extractNumber(item.code, config);

        if (value !== null && value > highestNumber) {
            highestNumber = value;
        }
    }

    let requiredLength = Math.max(1, config.length);

    while (highestNumber >= 10 ** requiredLength) {
        requiredLength++;
    }

    // If the current sequence has exhausted its capacity,
    // the next number needs an additional digit.
    if (highestNumber >= 10 ** requiredLength - 1) {
        requiredLength++;
    }

    return requiredLength;
}



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
}: SendWelcomeEmailOptions): Promise<SentMessageInfo> {
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

  const res = await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    replyTo: supportEmail,
    to,
    subject: `Welcome to ${companyName}!`,
    html,
  });
  // console.log('Email Response: ', emailRes)
  console.log(`✅ Welcome email sent to ${to}`);
  return res;
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