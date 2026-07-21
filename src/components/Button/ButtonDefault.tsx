import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "ghost" | "outline" | "warning" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonDefaultProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-white/90 border border-transparent",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent-dim border border-transparent",
  outline:
    "bg-transparent text-foreground border border-border-strong hover:border-white/25 hover:bg-accent-dim",
  warning:
    "bg-warning/15 text-warning border border-warning/35 hover:bg-warning/25 hover:border-warning/50",
  danger:
    "bg-danger/15 text-danger border border-danger/35 hover:bg-danger/25 hover:border-danger/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs tracking-wide",
  md: "h-10 px-5 text-sm tracking-wide",
  lg: "h-12 px-6 text-sm tracking-widest uppercase",
};

export default function ButtonDefault({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: ButtonDefaultProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
