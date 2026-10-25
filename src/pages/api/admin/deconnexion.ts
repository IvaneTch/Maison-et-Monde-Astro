import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { createHash } from "node:crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const origine = request.headers.get("origin");

  // Refuser les requêtes provenant d'un autre site.
  if (!origine || origine !== new URL(request.url).origin) {
    return new Response("Requête non autorisée.", { status: 403 });
  }

  const token = cookies.get("mm_admin_session")?.value;

  if (token) {
    let connection: mysql.Connection | undefined;

    try {
      const tokenHash = createHash("sha256").update(token).digest("hex");

      connection = await mysql.createConnection({
        host: import.meta.env.DB_HOST || "127.0.0.1",
        port: Number(import.meta.env.DB_PORT || 8889),
        user: import.meta.env.DB_USER,
        password: import.meta.env.DB_PASSWORD,
        database: import.meta.env.DB_NAME,
      });

      // Supprimer la session de la base de données.
      await connection.execute(
        "DELETE FROM sessions_admin WHERE token_hash = ?",
        [tokenHash],
      );
    } catch (error) {
      console.error("Erreur de déconnexion :", error);

      return new Response("Impossible de terminer la déconnexion.", {
        status: 500,
      });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Supprimer le cookie du navigateur.
  cookies.delete("mm_admin_session", {
    path: "/",
  });

  return redirect("/admin/connexion/", 303);
};
