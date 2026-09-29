// Emails a new executive application to the chapter inbox.
//
// Called by the /apply page right after a successful submission, with the
// application's id. Anyone can call it (applicants aren't signed in), so it
// only ever emails applications that exist, are recent and haven't been
// announced yet. The email address comes from site_settings.notification_email,
// never from the request.
//
// Secrets (`supabase secrets set ...`):
//   RESEND_API_KEY  required, from resend.com
//   NOTIFY_FROM     optional, defaults to "UNAU Kyambogo <onboarding@resend.dev>"
//   SITE_URL        optional, e.g. https://unaukyambogo.org (adds a link to /admin)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_AGE_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let applicationId = "";
  try {
    applicationId = String((await req.json())?.application_id ?? "");
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!UUID.test(applicationId)) return json({ error: "Invalid application id" }, 400);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("[notify-application] RESEND_API_KEY is not set");
    return json({ error: "Email is not configured" }, 503);
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Claim the application atomically so parallel calls can't send twice.
  const { data: app, error: claimError } = await admin
    .from("executive_applications")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", applicationId)
    .is("notified_at", null)
    .gte("created_at", new Date(Date.now() - MAX_AGE_MS).toISOString())
    .select("id, full_name, email, phone, course, year_of_study, faculty, motivation, created_at, executive_positions(title)")
    .maybeSingle();

  if (claimError) {
    console.error("[notify-application] claim failed", claimError);
    return json({ error: "Could not load the application" }, 500);
  }
  if (!app) return json({ skipped: true });

  const { data: settings } = await admin.from("site_settings").select("notification_email").eq("id", 1).maybeSingle();
  const to = settings?.notification_email;
  if (!to) return json({ skipped: true, reason: "No notification email set" });

  const position = (app.executive_positions as { title?: string } | null)?.title ?? "Executive position";
  const siteUrl = Deno.env.get("SITE_URL")?.replace(/\/$/, "");
  const rows: [string, string | number | null][] = [
    ["Position", position],
    ["Name", app.full_name],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Course", app.course],
    ["Year of study", app.year_of_study],
    ["Faculty / school", app.faculty],
    ["Submitted", new Date(app.created_at).toLocaleString("en-GB", { timeZone: "Africa/Kampala" }) + " (EAT)"],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#14203d">
      <div style="height:6px;background:linear-gradient(90deg,#e5243b,#dda63a,#4c9f38,#c5192d,#ff3a21,#26bde2,#fcc30b,#a21942,#fd6925,#dd1367,#fd9d24,#bf8b2e,#3f7e44,#0a97d9,#56c02b,#00689d,#19486a)"></div>
      <h2 style="color:#0c2a6b;margin:20px 0 4px">New cabinet application</h2>
      <p style="margin:0 0 16px;color:#555">${escapeHtml(app.full_name)} applied for <strong>${escapeHtml(position)}</strong>.</p>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .filter(([, v]) => v !== null && v !== "")
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#777;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`
          )
          .join("")}
      </table>
      ${app.motivation ? `<h3 style="color:#0c2a6b;margin:20px 0 6px">Why this role</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(app.motivation)}</p>` : ""}
      ${siteUrl ? `<p style="margin-top:24px"><a href="${escapeHtml(siteUrl)}/admin/applications" style="background:#0c2a6b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Review in the admin panel</a></p>` : ""}
      <p style="margin-top:24px;font-size:12px;color:#999">Reply to this email to reach the applicant directly.</p>
    </div>`;

  const text = [
    `New cabinet application: ${app.full_name} for ${position}`,
    "",
    ...rows.filter(([, v]) => v !== null && v !== "").map(([k, v]) => `${k}: ${v}`),
    ...(app.motivation ? ["", "Why this role:", app.motivation] : []),
    ...(siteUrl ? ["", `Review: ${siteUrl}/admin/applications`] : []),
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("NOTIFY_FROM") ?? "UNAU Kyambogo <onboarding@resend.dev>",
      to: [to],
      reply_to: app.email,
      subject: `New cabinet application: ${app.full_name} (${position})`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    // Release the claim so a retry can send it.
    await admin.from("executive_applications").update({ notified_at: null }).eq("id", app.id);
    console.error("[notify-application] Resend error", res.status, (await res.text()).slice(0, 300));
    return json({ error: "Email could not be sent" }, 502);
  }

  return json({ sent: true });
});
