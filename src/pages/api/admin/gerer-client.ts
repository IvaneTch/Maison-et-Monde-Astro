import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { createHash } from "node:crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const retour = (url: string) => redirect(url, 303);

  // Protection contre les requêtes provenant d'autres sites
  const origine = request.headers.get("origin");
  const destination = new URL(request.url);

  if (!origine || origine !== destination.origin) {
    return new Response("Origine non autorisée", {
      status: 403,
    });
  }

  // Vérification du cookie administrateur
  const token = cookies.get("mm_admin_session")?.value;

  if (!token) {
    return retour("/admin/connexion/");
  }

  const form = await request.formData();

  const id = Number(form.get("id"));
  const action = String(form.get("action") ?? "");

  const actions = ["modifier", "supprimer", "restaurer"];

  if (!Number.isSafeInteger(id) || id <= 0 || !actions.includes(action)) {
    return new Response("Requête invalide", {
      status: 400,
    });
  }

  let connexion: mysql.Connection | undefined;

  try {
    connexion = await mysql.createConnection({
      host: import.meta.env.DB_HOST || "127.0.0.1",
      port: Number(import.meta.env.DB_PORT || 8889),
      user: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASSWORD,
      database: import.meta.env.DB_NAME,
    });

    // Vérification de la session en base de données
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const [sessions] = await connexion.execute<mysql.RowDataPacket[]>(
      `SELECT s.id
         FROM sessions_admin s
         INNER JOIN administrateurs a
           ON a.id = s.administrateur_id
         WHERE s.token_hash = ?
           AND s.date_expiration > NOW()
           AND a.actif = 1
         LIMIT 1`,
      [tokenHash],
    );

    if (!sessions.length) {
      cookies.delete("mm_admin_session", {
        path: "/",
      });

      return retour("/admin/connexion/");
    }

    // MODIFIER LES INFORMATIONS DU CLIENT
    if (action === "modifier") {
      const lire = (champ: string, max: number) => {
        const valeur = form.get(champ);

        if (typeof valeur !== "string") {
          return null;
        }

        return valeur.trim().slice(0, max) || null;
      };

      const typeClient = String(form.get("type_client") ?? "particulier");

      if (!["particulier", "professionnel"].includes(typeClient)) {
        return new Response("Type de client invalide", {
          status: 400,
        });
      }

      const prenom = lire("prenom", 100);
      const nom = lire("nom", 100);
      const entreprise = lire("entreprise", 200);
      const email = lire("email", 255);
      const telephone = lire("telephone", 30);
      const adresse = lire("adresse", 255);
      const codePostal = lire("code_postal", 15);
      const ville = lire("ville", 100);
      const notes = lire("notes", 10000);

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response("Adresse e-mail invalide", {
          status: 400,
        });
      }

      await connexion.execute(
        `UPDATE clients
         SET
           type_client = ?,
           prenom = ?,
           nom = ?,
           entreprise = ?,
           email = ?,
           telephone = ?,
           adresse = ?,
           code_postal = ?,
           ville = ?,
           notes = ?
         WHERE id = ?
           AND date_suppression IS NULL`,
        [
          typeClient,
          prenom,
          nom,
          entreprise,
          email,
          telephone,
          adresse,
          codePostal,
          ville,
          notes,
          id,
        ],
      );

      return retour(`/admin/clients/${id}/?modifie=1`);
    }

    // METTRE LE CLIENT DANS LA CORBEILLE
    if (action === "supprimer") {
      await connexion.execute(
        `UPDATE clients
         SET date_suppression = NOW()
         WHERE id = ?
           AND date_suppression IS NULL`,
        [id],
      );

      return retour("/admin/#clients");
    }

    // RESTAURER LE CLIENT
    if (action === "restaurer") {
      await connexion.execute(
        `UPDATE clients
         SET date_suppression = NULL
         WHERE id = ?
           AND date_suppression IS NOT NULL`,
        [id],
      );

      return retour(`/admin/clients/${id}/`);
    }

    return new Response("Action inconnue", {
      status: 400,
    });
  } catch (erreur) {
    console.error("Erreur de gestion du client", erreur);

    return new Response("Erreur serveur", {
      status: 500,
    });
  } finally {
    await connexion?.end();
  }
};
