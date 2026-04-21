import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "submitting" | "error";

const today = new Date().toISOString().split("T")[0];

const serviceOptions = [
  "Consultas",
  "Medicina Preventiva",
  "Medicina Interna",
  "Análisis Clínicos",
  "Diagnóstico Imagen",
  "Otro / No estoy seguro",
];

const petTypeOptions = ["Perro", "Gato", "Ave", "Otro"];
const timeOptions = [
  { value: "manana", label: "Mañana (09:30 – 13:30)" },
  { value: "tarde", label: "Tarde (17:30 – 20:30)" },
  { value: "indistinto", label: "Sin preferencia" },
];

export function AppointmentForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.href = `${import.meta.env.PUBLIC_SITE_URL}/gracias`;
      } else {
        setStatus("error");
        setErrorMsg(
          "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo o llámanos directamente."
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg(
        "No se pudo conectar. Revisa tu conexión a internet e inténtalo de nuevo."
      );
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <form
      action="https://api.web3forms.com/submit"
      method="POST"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Hidden Web3Forms fields */}
      <input
        type="hidden"
        name="access_key"
        value={import.meta.env.PUBLIC_WEB3FORMS_KEY}
      />
      <input type="hidden" name="from_name" value="Almavet Jerez Reservas" />
      <input type="hidden" name="subject" value="Nueva solicitud de cita" />
      <input
        type="hidden"
        name="redirect"
        value={`${import.meta.env.PUBLIC_SITE_URL}/gracias`}
      />
      {/* Honeypot anti-spam */}
      <input
        type="checkbox"
        name="botcheck"
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Error banner */}
      {status === "error" && errorMsg && (
        <div role="alert" aria-live="polite" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Row 1: Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-brand-navy">
            Nombre completo <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            placeholder="María García"
            aria-required="true"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy placeholder-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-brand-navy">
            Teléfono <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9\s+]{9,}"
            placeholder="612 34 56 78"
            aria-required="true"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy placeholder-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Row 2: Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-brand-navy">
          Email <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="maria@ejemplo.com"
          aria-required="true"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy placeholder-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
      </div>

      {/* Row 3: Pet name + Pet type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pet_name" className="text-sm font-semibold text-brand-navy">
            Nombre de tu mascota <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="pet_name"
            name="pet_name"
            type="text"
            required
            placeholder="Luna"
            aria-required="true"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy placeholder-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pet_type" className="text-sm font-semibold text-brand-navy">
            Tipo de mascota <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="pet_type"
            name="pet_type"
            required
            aria-required="true"
            defaultValue=""
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
          >
            <option value="" disabled>Selecciona…</option>
            {petTypeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Service */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="service" className="text-sm font-semibold text-brand-navy">
          Servicio de interés <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="service"
          name="service"
          required
          aria-required="true"
          defaultValue=""
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
        >
          <option value="" disabled>Selecciona un servicio…</option>
          {serviceOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Row 5: Date + Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferred_date" className="text-sm font-semibold text-brand-navy">
            Fecha preferida <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            required
            min={today}
            aria-required="true"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferred_time" className="text-sm font-semibold text-brand-navy">
            Franja horaria <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="preferred_time"
            name="preferred_time"
            required
            aria-required="true"
            defaultValue=""
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
          >
            <option value="" disabled>Selecciona…</option>
            {timeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 6: Message (optional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-brand-navy">
          Motivo de la consulta <span className="text-brand-slate font-normal">(opcional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={500}
          placeholder="Describe brevemente el motivo de la visita…"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-brand-navy placeholder-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-brand-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando…
          </>
        ) : (
          "Solicitar cita"
        )}
      </button>
    </form>
  );
}

export default AppointmentForm;
