import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import {
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  let connection: mysql.Connection | undefined;

  const erreur = () => redirect("/admin/connexion/?erreur=1", 303);

  try {
    const data = await request.formData();

    const email = String(data.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(data.get("password") ?? "");

    if (!email || !password || email.length > 255 || password.length > 1024) {
      return erreur();
    }

    connection = await mysql.createConnection({
      host: import.meta.env.DB_HOST || "127.0.0.1",
      port: Number(import.meta.env.DB_PORT || 8889),
      user: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASSWORD,
      database: import.meta.env.DB_NAME,
    });

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT id, mot_de_passe
       FROM administrateurs
       WHERE email = ? AND actif = 1
       LIMIT 1`,
      [email],
    );

    const admin = rows[0];

    if (!admin) {
      return erreur();
    }

    const parties = String(admin.mot_de_passe).split(":");

    if (parties.length !== 2) {
      return erreur();
    }

    const [saltHex, hashHex] = parties;

    if (!/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) {
      return erreur();
    }

    const hashAttendu = Buffer.from(hashHex, "hex");

    const hashCalcule = scryptSync(password, Buffer.from(saltHex, "hex"), 64);

    if (!timingSafeEqual(hashAttendu, hashCalcule)) {
      return erreur();
    }

    // Générer un jeton de session aléatoire.
    const token = randomBytes(32).toString("hex");

    // Seule l'empreinte du jeton est conservée dans MySQL.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await connection.execute(
      `INSERT INTO sessions_admin
       (administrateur_id, token_hash, date_expiration)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 12 HOUR))`,
      [admin.id, tokenHash],
    );

    cookies.set("mm_admin_session", token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return redirect("/admin/", 303);
  } catch (error) {
    console.error("Erreur de connexion administrateur :", error);

    return new Response("Erreur du serveur. Réessayez plus tard.", {
      status: 500,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
