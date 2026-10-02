"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase, onAuthStateChange, getSecureSession } from "@/lib/supabaseClient";

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Si ya hay una sesión activa (o llega una vía Magic Link), saltamos el login.
  useEffect(() => {
    getSecureSession().then((session) => {
      if (session) router.replace("/");
    });

    const unsubscribe = onAuthStateChange((session) => {
      if (session) router.replace("/");
    });
    return unsubscribe;
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage("No pudimos enviar el enlace. Revisá el email e intentá de nuevo.");
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="w-full max-w-sm rounded-3xl bg-[#107671]/5 border border-[#107671]/15 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <Image
            src="/icons/icon-192.png"
            alt="Hablate Bien"
            width={56}
            height={56}
            className="rounded-full"
            priority
          />
        </div>

        <h1 className="text-center text-2xl font-semibold text-[#107671] mb-2">
          Hablate Bien
        </h1>
        <p className="text-center text-sm text-[#107671]/70 mb-8">
          Entrá con tu email. Te mandamos un enlace, sin contraseñas.
        </p>

        {status === "sent" ? (
          <div className="rounded-2xl bg-[#107671]/10 px-5 py-4 text-center">
            <p className="text-[#107671] font-medium">Revisá tu correo</p>
            <p className="text-[#107671]/70 text-sm mt-1">
              Te enviamos un enlace a <span className="font-medium">{email}</span> para entrar.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-[#107671]/70 underline underline-offset-2"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-[#107671]/80 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#107671]/25 bg-white px-4 py-3 text-[#107671] placeholder:text-[#107671]/35 outline-none focus:border-[#107671] transition-colors"
              />
            </div>

            {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-[#107671] py-3 font-medium text-[#FDFBF7] transition-opacity disabled:bg-[#107671]/40 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Enviando..." : "Enviar enlace mágico"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
