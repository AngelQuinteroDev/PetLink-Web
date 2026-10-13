import { createClient } from "@supabase/supabase-js";

/** Normaliza valores copiados: quita espacios y comillas accidentales. */
function clean(value: string | undefined): string | undefined {
  const v = value?.trim().replace(/^["']|["']$/g, "");
  return v ? v : undefined;
}

const url = clean(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const key = clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

if (!url || !/^https?:\/\//i.test(url)) {
  throw new Error(
    "VITE_SUPABASE_URL inválida: debe ser una URL http(s), p. ej. https://<ref>.supabase.co. " +
      "Revisa las Environment Variables de Vercel y REDESPLIEGA (las variables se aplican en el build)."
  );
}
if (!key) {
  throw new Error(
    "Falta VITE_SUPABASE_PUBLISHABLE_KEY en las Environment Variables (ver .env.example). Redespliega tras configurarla."
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Implicit: los enlaces de correo (restablecer contraseña) traen el token
    // en el hash y funcionan en cualquier navegador/dispositivo. Con PKCE el
    // code verifier vive en el navegador donde se pidió el enlace y al
    // abrirlo en otro (p. ej. el correo en el celular) el intercambio falla.
    flowType: "implicit",
  },
});
