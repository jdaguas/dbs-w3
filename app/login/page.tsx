"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { signIn } from "@/lib/storage";

type Errors = { email?: string; password?: string };

function check(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email.";
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter an email like name@example.com.";
  if (!password) errors.password = "Enter a password.";
  return errors;
}

// Mock login for the walkthrough: any email and password work. Nothing is checked,
// saved, or sent anywhere; it only remembers that this screen was passed.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // After the first submit, errors update as the person fixes them.
  function update(nextEmail: string, nextPassword: string) {
    setEmail(nextEmail);
    setPassword(nextPassword);
    if (submitted) setErrors(check(nextEmail, nextPassword));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const next = check(email, password);
    setErrors(next);
    const target = next.email ? "email" : next.password ? "password" : null;
    if (target) {
      document.getElementById(target)?.focus();
      return;
    }
    signIn();
    router.replace("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Log in to Drafts</h1>
        <p className="mt-1 text-ink-soft">Keep track of the replies you owe.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onValueChange={(v) => update(v, password)}
          error={errors.email}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onValueChange={(v) => update(email, v)}
          error={errors.password}
        />
        <Button type="submit" full>
          Log in
        </Button>
      </form>
      <p className="text-sm text-ink-muted">Demo only: any email and password work, and nothing leaves this browser.</p>
    </div>
  );
}
