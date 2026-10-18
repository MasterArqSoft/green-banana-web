import Link from "next/link";
import { copy, site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

// Pie legal (FR-16, AC-05; Ley 1480 art. 50): identidad del vendedor desde site.json,
// enlaces legales, PQR y enlace visible a la SIC. Datos ficticios hasta RP-01.
export function Footer() {
  const { footer } = copy;
  const { legal } = site;
  const identity = [
    { label: footer.labels.razonSocial, value: legal.razonSocial },
    { label: footer.labels.nit, value: legal.nit },
    { label: footer.labels.direccion, value: legal.direccion },
  ];
  const linkClass = "underline underline-offset-4 hover:text-sol";
  return (
    // Sobre fondo carbón, el foco del teclado se dibuja en crema (WCAG 2.4.7).
    <footer
      id="pie"
      className="bg-carbon text-crema [&_:focus-visible]:outline-crema"
    >
      <div className="contenedor flex flex-col gap-6 py-10 text-sm">
        <p className="font-display text-lg font-semibold">{site.brand}</p>
        <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {identity.map(({ label, value }) => (
            <div key={label}>
              <dt className="inline font-semibold">{label}: </dt>
              <dd className="inline">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="inline font-semibold">{footer.labels.telefono}: </dt>
            <dd className="inline">
              <a href={telHref(site.phone)} className={linkClass}>
                {formatPhone(site.phone)}
              </a>
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">{footer.labels.correo}: </dt>
            <dd className="inline">
              <a href={`mailto:${legal.correo}`} className={linkClass}>
                {legal.correo}
              </a>
            </dd>
          </div>
        </dl>
        <nav aria-label={footer.navLabel}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {/* Las páginas de términos y privacidad llegan con T-27. */}
            <li>
              <Link href="/terminos" className={linkClass}>
                {footer.links.terminos}
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className={linkClass}>
                {footer.links.privacidad}
              </Link>
            </li>
            <li>
              <Link href="/#garantia" className={linkClass}>
                {footer.links.garantia}
              </Link>
            </li>
            <li>
              <a href={site.sicUrl} className={`${linkClass} font-semibold`}>
                {footer.sic}
              </a>
            </li>
          </ul>
        </nav>
        <p>{footer.pqr}</p>
      </div>
    </footer>
  );
}
