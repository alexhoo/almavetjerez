/**
 * Appointment request: shared option lists + server-side validation.
 *
 * The form component and the `/api/cita` endpoint both import from here so the
 * values the user can pick and the values the server accepts can't drift apart.
 */

export const serviceOptions = [
  "Consultas",
  "Medicina Preventiva",
  "Medicina Interna",
  "Análisis Clínicos",
  "Diagnóstico Imagen",
  "Otro / No estoy seguro",
] as const;

export const petTypeOptions = ["Perro", "Gato", "Otro"] as const;

export const timeOptions = [
  { value: "manana", label: "Mañana (09:30 – 13:30)" },
  { value: "tarde", label: "Tarde (17:30 – 20:30)" },
  { value: "indistinto", label: "Sin preferencia" },
] as const;

/** Value sent by the privacy checkbox when it is ticked. */
export const PRIVACY_ACCEPTED_VALUE = "Sí";
export const MESSAGE_MAX_LENGTH = 500;

export interface Appointment {
  name: string;
  phone: string;
  email: string;
  petName: string;
  petType: string;
  service: string;
  preferredDate: string; // yyyy-MM-dd
  preferredTime: string; // one of timeOptions[].value
  message: string;
}

export type ParseResult =
  | { ok: true; value: Appointment }
  | { ok: false; errors: string[] };

const PHONE_PATTERN = /^[0-9\s+]{9,20}$/;
// Deliberately loose: "something@something.tld" with no whitespace. The real
// check is whether Resend can deliver to it.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Control characters (C0 + DEL) except the ones we handle explicitly.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]+/g;
const CONTROL_CHARS_KEEP_NEWLINE = /[\u0000-\u0009\u000b-\u001f\u007f]+/g;

function singleLine(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.replace(CONTROL_CHARS, " ").trim() : "";
}

function multiLine(data: FormData, key: string): string {
  const value = data.get(key);
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS_KEEP_NEWLINE, " ").trim();
}

/** Today in the clinic's timezone, as yyyy-MM-dd. */
function todayInMadrid(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseAppointment(data: FormData): ParseResult {
  const errors: string[] = [];

  const name = singleLine(data, "name");
  const phone = singleLine(data, "phone");
  const email = singleLine(data, "email");
  const petName = singleLine(data, "pet_name");
  const petType = singleLine(data, "pet_type");
  const service = singleLine(data, "service");
  const preferredDate = singleLine(data, "preferred_date");
  const preferredTime = singleLine(data, "preferred_time");
  const message = multiLine(data, "message");

  if (name.length < 2 || name.length > 100) errors.push("Nombre completo");
  if (!PHONE_PATTERN.test(phone)) errors.push("Teléfono");
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.push("Email");
  if (petName.length < 1 || petName.length > 100) errors.push("Nombre de tu mascota");
  if (!(petTypeOptions as readonly string[]).includes(petType)) errors.push("Tipo de mascota");
  if (!(serviceOptions as readonly string[]).includes(service)) errors.push("Servicio de interés");
  if (!isRealDate(preferredDate) || preferredDate < todayInMadrid()) {
    errors.push("Fecha preferida");
  }
  if (!timeOptions.some((option) => option.value === preferredTime)) {
    errors.push("Franja horaria");
  }
  if (message.length > MESSAGE_MAX_LENGTH) errors.push("Motivo de la consulta");
  if (data.get("privacy_accepted") !== PRIVACY_ACCEPTED_VALUE) errors.push("Política de privacidad");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, phone, email, petName, petType, service, preferredDate, preferredTime, message },
  };
}
