import Image from "next/image";

export default function Logo({
  className = "h-8",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="BucketsAi"
      width={375}
      height={90}
      priority
      className={`${className} w-auto object-contain`}
    />
  );
}
