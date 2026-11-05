/** Le marqueur métier distingue aussi les anciens devis Conciergerie référencés MM. */
export function categorieDevis(d: {
  prestation_souhaitee?: unknown;
  type_devis?: unknown;
}): 'Ménage' | 'Conciergerie' | 'Professionnel' {
  if (d.prestation_souhaitee === 'Professionnel' || d.type_devis === 'Professionnel') {
    return 'Professionnel';
  }
  return d.prestation_souhaitee === 'Conciergerie' || d.type_devis === 'Conciergerie'
    ? 'Conciergerie'
    : 'Ménage';
}
export function accompagnementConciergerie(commentaires: unknown): string {
  try {
    const valeur = JSON.parse(String(commentaires ?? '')).conciergerie?.Formule;
    return typeof valeur === 'string' && valeur ? valeur : 'À préciser';
  } catch {
    return 'À préciser';
  }
}
export function infosProfessionnel(commentaires: unknown): {
  entreprise: string;
  site: string;
  service: string;
} {
  try {
    const info = JSON.parse(String(commentaires ?? '')).professionnel ?? {};
    return {
      entreprise: typeof info.entreprise === 'string' ? info.entreprise : '',
      site: typeof info.type_site === 'string' ? info.type_site : '',
      service: typeof info.service === 'string' ? info.service : '',
    };
  } catch {
    return { entreprise: '', site: '', service: '' };
  }
}
