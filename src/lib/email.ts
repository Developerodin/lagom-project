import { Resend } from "resend";
import { contactInfoContent } from "@/content/contact";
import { siteConfig } from "@/content/site";

const CONTACT_TO =
  contactInfoContent.items.find((item) => item.id === "email")?.value ??
  "studiolagomdesign@gmail.com";

export type ContactEmailPayload = {
  name: string;
  email: string;
  company: string | null;
  services: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildContactEmailHtml(payload: ContactEmailPayload) {
  const rows = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Company", payload.company || "—"],
    ["Services", payload.services],
    ["Message", payload.message],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="padding:12px 16px;text-align:left;vertical-align:top;background:#f5f5f5;border:1px solid #e5e5e5;width:140px;font:600 14px/1.4 Arial,sans-serif;color:#333;">
            ${escapeHtml(label)}
          </th>
          <td style="padding:12px 16px;vertical-align:top;border:1px solid #e5e5e5;font:14px/1.6 Arial,sans-serif;color:#111;white-space:pre-wrap;">
            ${escapeHtml(value)}
          </td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:640px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
        You received a new message from the ${escapeHtml(siteConfig.name)} contact form.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#666;">
        Reply directly to this email to respond to ${escapeHtml(payload.name)}.
      </p>
    </div>
  `.trim();
}

function buildContactEmailText(payload: ContactEmailPayload) {
  return [
    `New contact form submission — ${siteConfig.name}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company || "—"}`,
    `Services: ${payload.services}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function getEmailFrom() {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) {
    return configured;
  }

  const hostname = new URL(siteConfig.url).hostname;
  return `${siteConfig.name} <noreply@${hostname}>`;
}

export async function sendContactNotification(payload: ContactEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[email] RESEND_API_KEY is not set. Contact notification was not sent.",
      );
    } else {
      console.warn(
        "[email] RESEND_API_KEY is not set. Skipping contact notification.",
      );
    }
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: CONTACT_TO,
    replyTo: payload.email,
    subject: `New contact enquiry from ${payload.name}`,
    html: buildContactEmailHtml(payload),
    text: buildContactEmailText(payload),
  });

  if (error) {
    throw new Error(error.message);
  }
}
