export default function Logo({
  className = "h-8",
}: {
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/logo.png"
      alt="Arya"
      className={`${className} w-auto object-contain`}
    />
  );
}
