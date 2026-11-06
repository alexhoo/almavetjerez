import { timeOptions, type Appointment } from "~/lib/appointment";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** yyyy-MM-dd -> dd/MM/yyyy */
function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function renderAppointmentEmail(appointment: Appointment) {
  const timeLabel =
    timeOptions.find((option) => option.value === appointment.preferredTime)?.label ??
    appointment.preferredTime;

  const rows: ReadonlyArray<readonly [label: string, value: string]> = [
    ["Nombre", appointment.name],
    ["Teléfono", appointment.phone],
    ["Email", appointment.email],
    ["Mascota", `${appointment.petName} (${appointment.petType})`],
    ["Servicio", appointment.service],
    ["Fecha preferida", formatDate(appointment.preferredDate)],
    ["Franja horaria", timeLabel],
    ["Motivo de la consulta", appointment.message || "—"],
    ["Política de privacidad", "Aceptada"],
  ];

  const subject = `Nueva solicitud de cita — ${appointment.name} (${appointment.petName})`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f2540;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:20px;">Nueva solicitud de cita</h1>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${rows
  .map(
    ([label, value]) =>
      `          <tr><td style="padding:8px 0;border-top:1px solid #e5eaf1;vertical-align:top;width:170px;font-weight:bold;">${escapeHtml(label)}</td><td style="padding:8px 0;border-top:1px solid #e5eaf1;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#5b6b80;">Responde a este correo para escribir directamente al cliente.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
