import { useState, useEffect, useRef } from "react";
import type { FC } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  navItems: NavItem[];
  ctaHref: string;
  ctaLabel: string;
}

const MenuIcon: FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const XIcon: FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

export const MobileNav: FC<MobileNavProps> = ({ navItems, ctaHref, ctaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const closeAndNavigate = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        ref={buttonRef}
        aria-controls="mobile-nav-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden p-2 rounded-md text-brand-navy hover:bg-brand-sky transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        {isOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        id="mobile-nav-panel"
        ref={panelRef}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <span className="font-bold text-brand-navy">Menú</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            className="p-2 rounded-md text-brand-navy hover:bg-brand-sky transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <XIcon />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Navegación móvil">
          <ul className="flex flex-col px-4 py-4 gap-1">
            {navItems.map((item) => (
              <li key={item.href + item.label}>
                <a
                  href={item.href}
                  onClick={closeAndNavigate}
                  className="block px-4 py-3 rounded-lg text-brand-navy font-medium hover:bg-brand-sky transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="px-8 pt-2 pb-6">
            <a
              href={ctaHref}
              onClick={closeAndNavigate}
              className="block text-center bg-brand-blue text-white font-semibold py-3 rounded-full hover:bg-brand-blue-600 transition-colors"
            >
              {ctaLabel}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
