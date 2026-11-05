import { createHash } from 'node:crypto';
const buckets = new Map<string, { nombre: number; fin: number }>();
export function autoriserRequete(adresse: string, groupe: string, maintenant = Date.now()): boolean {
  const cle = createHash('sha256').update(`${groupe}:${adresse}`).digest('hex');
  const max = groupe === 'connexion' ? 5 : 20;
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.fin <= maintenant) buckets.delete(k);
  const b = buckets.get(cle);
  if (!b || b.fin <= maintenant) {
    if (buckets.size >= 10000) return false;
    buckets.set(cle, { nombre: 1, fin: maintenant + 15 * 60 * 1000 });
    return true;
  }
  b.nombre++;
  return b.nombre <= max;
}
