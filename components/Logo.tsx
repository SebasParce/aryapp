/**
 * Logo de Arya.
 *
 *   <Logo />              ícono + wordmark (sidebar, login)
 *   <Logo variant="icon" /> solo el ícono redondeado (espacios compactos)
 */
export default function Logo({
  className = "h-8",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "icon";
}) {
  const src = variant === "icon" ? "/icon-arya.png" : "/logo-arya.png";
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="Arya"
      className={`${className} w-auto object-contain`}
    />
  );
}
