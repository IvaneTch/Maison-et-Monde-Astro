import { createHash } from 'node:crypto';
import type { Connection, RowDataPacket } from 'mysql2/promise';
export async function sessionAdminValide(
  connection: Connection,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT s.id FROM sessions_admin s JOIN administrateurs a ON a.id=s.administrateur_id WHERE s.token_hash=? AND s.date_expiration>NOW() AND a.actif=1 LIMIT 1`,
    [createHash('sha256').update(token).digest('hex')],
  );
  return rows.length > 0;
}
