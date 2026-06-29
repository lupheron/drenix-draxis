import { cn } from "@/utils/cn";

type EyeLogoProps = {
  className?: string;
  animate?: boolean;
};

export default function EyeLogo({ className, animate = false }: EyeLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-12 w-12", animate && "animate-eye-open", className)}
      aria-hidden="true"
    >
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="14"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-foreground/80"
      />
      <circle
        cx="32"
        cy="32"
        r="8"
        fill="currentColor"
        className="text-foreground"
      />
      <circle cx="35" cy="29" r="2.5" fill="var(--background)" />
    </svg>
  );
}
