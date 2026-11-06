import { useState, type FormEvent, type ReactNode } from "react";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  MESSAGE_MAX_LENGTH,
  PRIVACY_ACCEPTED_VALUE,
  petTypeOptions,
  serviceOptions,
  timeOptions,
} from "~/lib/appointment";

type SubmitStatus = "idle" | "submitting" | "error";

const controlClass = "h-11 rounded-md bg-white px-4";
const selectTriggerClass = `${controlClass} w-full data-[size=default]:h-11`;

function Field({
  id,
  label,
  required = true,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="gap-1 text-sm font-semibold text-brand-navy">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-red-500">*</span>
        ) : (
          <span className="text-brand-slate font-normal">(opcional)</span>
        )}
      </Label>
      {children}
    </div>
  );
}

function DatePickerField({ id, label }: { id: string; label: string }) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  return (
    <Field id={id} label={label}>
      <input type="hidden" name={id} value={date ? format(date, "yyyy-MM-dd") : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-required="true"
            data-empty={!date}
            className={`${controlClass} w-full justify-between font-normal text-brand-navy data-[empty=true]:text-muted-foreground`}
          >
            {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha…</span>}
            <CalendarIcon className="opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            selected={date}
            {...(date && { defaultMonth: date })}
            disabled={{ before: startOfToday() }}
            onSelect={(next) => {
              setDate(next);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Field id={id} label={label}>
      <Select name={id} required>
        <SelectTrigger id={id} aria-required="true" className={selectTriggerClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function AppointmentForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // The form is noValidate, so the privacy consent is enforced here.
    if (!privacyAccepted) {
      setPrivacyError(true);
      document.getElementById("privacy")?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/cita", { method: "POST", body: formData });

      if (res.ok) {
        window.location.href = "/gracias";
      } else {
        // The endpoint answers with `{ error }` in Spanish (which fields to fix,
        // or a generic failure); fall back to the generic text otherwise.
        const body: { error?: unknown } | null = await res.json().catch(() => null);
        setStatus("error");
        setErrorMsg(
          typeof body?.error === "string"
            ? body.error
            : "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo o llámanos directamente."
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
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Honeypot anti-spam: checked server-side in /api/cita */}
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
        <Field id="name" label="Nombre completo">
          <Input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            placeholder="María García"
            aria-required="true"
            className={controlClass}
          />
        </Field>
        <Field id="phone" label="Teléfono">
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9\s+]{9,}"
            placeholder="612 34 56 78"
            aria-required="true"
            className={controlClass}
          />
        </Field>
      </div>

      {/* Row 2: Email */}
      <Field id="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="maria@ejemplo.com"
          aria-required="true"
          className={controlClass}
        />
      </Field>

      {/* Row 3: Pet name + Pet type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="pet_name" label="Nombre de tu mascota">
          <Input
            id="pet_name"
            name="pet_name"
            type="text"
            required
            placeholder="Luna"
            aria-required="true"
            className={controlClass}
          />
        </Field>
        <SelectField
          id="pet_type"
          label="Tipo de mascota"
          placeholder="Selecciona…"
          options={petTypeOptions.map((opt) => ({ value: opt, label: opt }))}
        />
      </div>

      {/* Row 4: Service */}
      <SelectField
        id="service"
        label="Servicio de interés"
        placeholder="Selecciona un servicio…"
        options={serviceOptions.map((opt) => ({ value: opt, label: opt }))}
      />

      {/* Row 5: Date + Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePickerField id="preferred_date" label="Fecha preferida" />
        <SelectField
          id="preferred_time"
          label="Franja horaria"
          placeholder="Selecciona…"
          options={timeOptions}
        />
      </div>

      {/* Row 6: Message (optional) */}
      <Field id="message" label="Motivo de la consulta" required={false}>
        <Textarea
          id="message"
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="Describe brevemente el motivo de la visita…"
          className="rounded-md bg-white px-4 py-2.5 resize-none"
        />
      </Field>

      {/* Privacy consent (RGPD) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy"
            name="privacy_accepted"
            value={PRIVACY_ACCEPTED_VALUE}
            checked={privacyAccepted}
            onCheckedChange={(checked) => {
              const accepted = checked === true;
              setPrivacyAccepted(accepted);
              if (accepted) setPrivacyError(false);
            }}
            required
            aria-required="true"
            aria-invalid={privacyError}
            aria-describedby={privacyError ? "privacy-error" : undefined}
            className="mt-0.5 bg-white"
          />
          <Label htmlFor="privacy" className="text-sm font-normal text-brand-slate leading-relaxed">
            <span>
              He leído y acepto la{" "}
              <a
                href="/politica-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue underline underline-offset-2 hover:text-brand-blue-600"
              >
                política de privacidad
              </a>{" "}
              y consiento el tratamiento de mis datos para gestionar mi solicitud de cita.{" "}
              <span aria-hidden="true" className="text-red-500">*</span>
            </span>
          </Label>
        </div>
        {privacyError && (
          <p id="privacy-error" role="alert" className="text-sm text-red-600 pl-7">
            Debes aceptar la política de privacidad para solicitar tu cita.
          </p>
        )}
        <p className="text-xs text-brand-slate/80 leading-relaxed pl-7">
          Responsable: MARSON VET S.L. Finalidad: atender tu solicitud de cita. Legitimación: tu
          consentimiento. Puedes ejercer tus derechos de acceso, rectificación, supresión y otros en
          info@almavetjerez.com. Más información en la política de privacidad.
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-md text-sm font-semibold shadow-sm hover:bg-brand-blue-600"
      >
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          "Solicitar cita"
        )}
      </Button>
    </form>
  );
}

export default AppointmentForm;
