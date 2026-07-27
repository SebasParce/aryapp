/**
 * Logo de Arya.
 *
 *   <Logo />              icon + wordmark (sidebar, login)
 *   <Logo variant="icon" /> rounded icon only (compact spots)
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
