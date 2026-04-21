export const site = {
  name: "Almavet Jerez",
  tagline: "Centro Veterinario",
  // TODO: confirm real phone number
  phone: "956 XX XX XX",
  // TODO: confirm real phone number (tel: href format, E.164)
  phoneTel: "+34956000000",
  // TODO: confirm real email address
  email: "info@almavetjerez.com",
  address: {
    street: "C/ Camarón de la Isla 2",
    zip: "11405",
    city: "Jerez de la Frontera",
    country: "España",
  },
  hours: [
    {
      days: "Lunes a Viernes",
      ranges: ["09:30 – 13:30", "17:30 – 20:30"],
    },
  ],
  social: {
    // TODO: confirm real Facebook URL
    facebook: "https://facebook.com/almavetjerez",
    // TODO: confirm real Instagram URL
    instagram: "https://instagram.com/almavetjerez",
  },
  nav: [
    { label: "Servicios", href: "#servicios" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Contactos", href: "#ubicacion" },
  ],
  hero: {
    eyebrow: "Profesionales de confianza",
    titleLine1: "Cuidamos de los",
    titleLine2Prefix: "que ",
    titleLine2Accent: "más quieres",
    description:
      "En Almavet Jerez ofrecemos una atención veterinaria integral basada en el cuidado, la innovación y la excelencia clínica para tus mejores amigos.",
    primaryCta: { label: "Pedir Cita Online", href: "/reservar" },
    secondaryCta: { label: "Nuestros Servicios", href: "#servicios" },
    badge: { metric: "10+", label: "Años cuidando mascotas" },
    imagePath: "/images/hero-vet.svg",
    imageAlt: "Veterinaria abrazando a un perro labrador",
  },
  petCategoriesSection: {
    title: "Especialistas en cada miembro de la familia",
    description:
      "Desde los más pequeños hasta los más juguetones, nuestro equipo está preparado para brindar el mejor cuidado a perros, gatos, aves y exóticos.",
    imagePath: "/images/pets-group.svg",
    imageAlt: "Dos perros y un gato sentados juntos",
  },
  servicesSection: {
    eyebrow: "Especialidades",
    title: "Nuestros Servicios Médicos",
  },
  locationSection: {
    title: "Visítanos en Jerez",
    imagePath: "/images/clinic-exterior.svg",
    imageAlt: "Exterior de la clínica Almavet Jerez",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Almavet+Jerez+de+la+Frontera",
  },
  cta: {
    title: "¿Tu mascota necesita una revisión?",
    description:
      "No esperes a que surjan problemas. La prevención es la base de una vida larga y feliz. Reserva hoy mismo con nuestros especialistas.",
    primaryCta: { label: "Reservar Ahora", href: "/reservar" },
  },
  footer: {
    description:
      "Comprometidos con la salud y el bienestar animal en Jerez de la Frontera. Ofrecemos equipamiento tecnológico de vanguardia y un equipo humano con alma para el cuidado de tu mascota.",
    copyright: "© 2026 Centro Veterinario Almavet Jerez. Todos los derechos reservados.",
    tagline: "Cuidando de tu ♥ y de su lealtad.",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Servicios", href: "#servicios" },
      { label: "Contactos", href: "#ubicacion" },
      { label: "Política de Privacidad", href: "/politica-privacidad" },
    ],
  },
} as const;

export const services = [
  {
    id: "consultas",
    icon: "stethoscope",
    title: "Consultas",
    desc: "Atención personalizada y exhaustiva para el bienestar general de tu mascota.",
  },
  {
    id: "medicina-preventiva",
    icon: "shield-heart",
    title: "Medicina Preventiva",
    desc: "Planes de vacunación, desparasitación y chequeos de salud regulares.",
  },
  {
    id: "medicina-interna",
    icon: "activity",
    title: "Medicina Interna",
    desc: "Diagnóstico y tratamiento de patologías complejas de órganos internos.",
  },
  {
    id: "analisis-clinicos",
    icon: "flask",
    title: "Análisis Clínicos",
    desc: "Laboratorio propio para obtener resultados rápidos y precisos en minutos.",
  },
  {
    id: "diagnostico-imagen",
    icon: "scan",
    title: "Diagnóstico Imagen",
    desc: "Ecografía y radiología avanzada para un diagnóstico certero y temprano.",
  },
] as const;

export const petCategories = [
  { icon: "dog", label: "Caninos" },
  { icon: "cat", label: "Felinos" },
  { icon: "bird", label: "Aves" },
  { icon: "reptile", label: "Exóticos" },
] as const;

export type Service = (typeof services)[number];
export type PetCategory = (typeof petCategories)[number];
export type NavItem = (typeof site.nav)[number];
export type FooterLink = (typeof site.footer.links)[number];
