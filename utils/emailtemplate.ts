import fs from "fs";
import path from "path";

export interface WelcomeEmailParams {
  companyName: string;
  companyInitials?: string;
  userName: string;
  userEmail: string;
  password: string;
  appUrl: string;
  supportEmail: string;
}

export function getWelcomeEmailHTML(params: WelcomeEmailParams): string {
  const templatePath = path.join(process.cwd(), "emails", "welcome-template.html");

  let html = fs.readFileSync(templatePath, "utf8");

  const replacements: Record<string, string> = {
    "{{companyName}}": params.companyName,
    "{{companyInitials}}": params.companyInitials ?? params.companyName[0],
    "{{userName}}": params.userName,
    "{{userEmail}}": params.userEmail,
    "{{password}}": params.password,
    "{{appUrl}}": params.appUrl,
    "{{supportEmail}}": params.supportEmail,
    "{{year}}": new Date().getFullYear().toString(),
  };

  for (const key in replacements) {
    html = html.replace(new RegExp(key, "g"), replacements[key]);
  }

  return html;
}





type PasswordResetTemplateParams = {
  resetUrl: string;
};

export function renderPasswordResetEmail({
  resetUrl
}: PasswordResetTemplateParams): string {
  const templatePath = path.join(
    process.cwd(),
    'emails',
    'password-reset.html'
  );

  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/{{RESET_URL}}/g, resetUrl)
    .replace(/{{YEAR}}/g, new Date().getFullYear().toString());

  return html;
}