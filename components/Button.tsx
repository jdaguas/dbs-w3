import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 min-h-11 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
  ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
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
