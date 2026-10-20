"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { signIn } from "@/lib/storage";

type Errors = { email?: string; password?: string };

// The one demo account everyone shares (shown as hints under the fields).
const DEMO_EMAIL = "mpcs@gmail.com";
const DEMO_PASSWORD = "P@s#word";

function check(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email.";
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter an email like name@example.com.";
  if (!password) errors.password = "Enter a password.";
  return errors;
}

// Mock login for the walkthrough: only the demo account gets in. Nothing is saved or
// sent anywhere; it only remembers that this screen was passed.
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
    // Wrong account: keep what they typed and say what to do next, under the password.
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setErrors({ password: "Incorrect email or password. Use the demo login shown under each field." });
      document.getElementById("password")?.focus();
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
          hint={`Demo email: ${DEMO_EMAIL}`}
          hintBelow
          value={email}
          onValueChange={(v) => update(v, password)}
          error={errors.email}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          hint={`Demo password: ${DEMO_PASSWORD}`}
          hintBelow
          value={password}
          onValueChange={(v) => update(email, v)}
          error={errors.password}
        />
        <Button type="submit" full>
          Log in
        </Button>
      </form>
      <p className="text-sm text-ink-muted">Demo only: there are no real accounts, and nothing leaves this browser.</p>
    </div>
  );
}
