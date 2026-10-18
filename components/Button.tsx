import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 min-h-11 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-card hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-ink shadow-card hover:border-line-hover hover:bg-canvas",
  ghost: "text-ink-soft hover:bg-subtle hover:text-ink",
  danger: "border border-danger-line bg-surface text-danger hover:bg-danger-soft",
};

type CommonProps = { variant?: Variant; full?: boolean; className?: string; children: ReactNode };

export function buttonClass({ variant = "primary", full = false, className = "" }: Omit<CommonProps, "children">) {
  return `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
}

export function Button({
  variant,
  full,
  className,
  type = "button",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClass({ variant, full, className })} {...props} />;
}

export function ButtonLink({ variant, full, className, ...props }: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, full, className })} {...props} />;
}
