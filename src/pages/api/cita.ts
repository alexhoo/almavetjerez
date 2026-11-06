import type { APIRoute } from "astro";
import { Resend } from "resend";
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from "astro:env/server";
import { parseAppointment } from "~/lib/appointment";
import { renderAppointmentEmail } from "~/lib/appointment-email";

// This is the only server-rendered route; the rest of the site stays static.
export const prerender = false;

const DEFAULT_TO = "info@almavetjerez.com";
const DEFAULT_FROM = "Almavet Jerez Reservas <citas@almavetjerez.com>";

const GENERIC_ERROR =
  "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo o llámanos directamente.";

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  // Honeypot: real users never tick this hidden checkbox. Pretend it worked so
  // bots get no signal to adapt to.
  if (data.get("botcheck")) return json({ ok: true }, 200);

  const parsed = parseAppointment(data);
  if (!parsed.ok) {
    return json({ error: `Revisa estos campos: ${parsed.errors.join(", ")}.` }, 400);
  }

  if (!RESEND_API_KEY) {
    console.error("[api/cita] RESEND_API_KEY is not configured.");
    return json({ error: GENERIC_ERROR }, 500);
  }

  const { subject, text, html } = renderAppointmentEmail(parsed.value);
  const resend = new Resend(RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL ?? DEFAULT_FROM,
      to: CONTACT_TO_EMAIL ?? DEFAULT_TO,
      replyTo: parsed.value.email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("[api/cita] Resend rejected the email:", error);
      return json({ error: GENERIC_ERROR }, 502);
    }
  } catch (err) {
    console.error("[api/cita] Could not reach Resend:", err);
    return json({ error: GENERIC_ERROR }, 502);
  }

  return json({ ok: true }, 200);
};
