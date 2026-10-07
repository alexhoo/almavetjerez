export const site = {
  name: "Almavet Jerez",
  tagline: "Centro Veterinario",
  // TODO: confirm real phone number
  phone: "+34 622 576 189",
  // TODO: confirm real phone number (tel: href format, E.164)
  phoneTel: "+34 622 576 189",
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
    {
      days: "Sábados",
      ranges: ["10:30 – 13:30"],
    },
  ],
  social: {
    // TODO: confirm real Facebook URL
    facebook: "https://facebook.com/almavetjerez",
    // TODO: confirm real Instagram URL
    instagram: "https://instagram.com/almavetjerez",
  },
  topBar: {
    hours: "L-V 09:30-13:30 · 17:30-20:30 · Sáb 10:30-13:30",
  },
  nav: [
    { label: "Servicios", href: "#servicios" },
    { label: "La clínica", href: "#clinica" },
    { label: "Horario y ubicación", href: "#ubicacion" },
    { label: "Contacto", href: "#ubicacion" },
  ],
  hero: {
    eyebrow: "Profesionales de confianza en Jerez",
    titleLine1: "Cuidamos de los",
    titleLine2Prefix: "que ",
    titleLine2Accent: "más quieres",
    description:
      "En Almavet Jerez ofrecemos una atención veterinaria integral basada en el cuidado, la innovación y la excelencia clínica para tus mejores amigos.",
    primaryCta: { label: "Pedir cita online", href: "/reservar" },
    secondaryCta: { label: "Llamar a la clínica" },
    checks: ["Laboratorio propio", "Perros, gatos y exóticos", "Cita online"],
    badge: { metric: "10+", label: "años cuidando mascotas" },
    chip: "Resultados de laboratorio en minutos",
    imagePath: "/images/hero-vet.png",
    imageAlt: "Veterinaria abrazando a un perro labrador",
  },
  petCategoriesSection: {
    eyebrow: "Para toda la familia",
    title: "Especialistas en cada miembro de la familia",
    description:
      "Desde los más pequeños hasta los más juguetones, nuestro equipo está preparado para brindar el mejor cuidado a perros, gatos y exóticos.",
    imagePath: "/images/animals.webp",
    imageAlt: "Un perro y un gato posando juntos",
    values: [
      { title: "Cuidado", desc: "Un trato cercano con cada paciente" },
      { title: "Innovación", desc: "Equipamiento de vanguardia" },
      { title: "Excelencia", desc: "Rigor clínico en cada diagnóstico" },
    ],
  },
  servicesSection: {
    eyebrow: "Especialidades",
    title: "Nuestros servicios médicos",
    link: { label: "Reservar una consulta", href: "/reservar" },
  },
  locationSection: {
    eyebrow: "Horario y ubicación",
    title: "Visítanos en Jerez",
    imagePath: "/images/clinic-exterior.jpg",
    imageAlt: "Exterior de la clínica Almavet Jerez",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Almavet+Jerez+de+la+Frontera&output=embed",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Almavet+Jerez+de+la+Frontera",
  },
  cta: {
    title: "¿Tu mascota necesita una revisión?",
    description:
      "No esperes a que surjan problemas. La prevención es la base de una vida larga y feliz. Reserva hoy mismo con nuestros especialistas.",
    primaryCta: { label: "Reservar ahora", href: "/reservar" },
  },
  footer: {
    description:
      "Comprometidos con la salud y el bienestar animal en Jerez de la Frontera. Ofrecemos equipamiento tecnológico de vanguardia y un equipo humano con alma para el cuidado de tu mascota.",
    copyright:
      "© 2026 Centro Veterinario Almavet Jerez. Todos los derechos reservados.",
    tagline: "Cuidando de tu ♥ y de su lealtad.",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Servicios", href: "#servicios" },
      { label: "Horario y ubicación", href: "#ubicacion" },
      { label: "Pedir cita online", href: "/reservar" },
    ],
    privacy: { label: "Política de privacidad", href: "/politica-privacidad" },
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
    id: "analisis-clinicos",
    icon: "flask",
    title: "Análisis clínicos",
    desc: "Laboratorio propio para obtener resultados rápidos y precisos en minutos.",
  },
  {
    id: "diagnostico-por-imagen",
    icon: "scan",
    title: "Diagnóstico por imagen",
    desc: "Pruebas de imagen para ver lo que no se aprecia a simple vista y llegar a un diagnóstico preciso.",
  },
  {
    id: "medicina-preventiva",
    icon: "shield-heart",
    title: "Medicina preventiva",
    desc: "Planes de vacunación, desparasitación y chequeos de salud regulares.",
  },
  {
    id: "terapia-laser",
    icon: "sun",
    title: "Terapia láser",
    desc: "Tratamiento no invasivo que ayuda a aliviar el dolor y la inflamación y favorece la recuperación.",
  },
] as const;

export const petCategories = [
  { icon: "dog", label: "Caninos" },
  { icon: "cat", label: "Felinos" },
  { icon: "reptile", label: "Exóticos" },
] as const;

export type Service = (typeof services)[number];
export type PetCategory = (typeof petCategories)[number];
export type NavItem = (typeof site.nav)[number];
export type FooterLink = (typeof site.footer.links)[number];
