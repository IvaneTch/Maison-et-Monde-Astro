export const servicesConciergerie = [
  'Ménage et préparation',
  'Blanchisserie et linge',
  'Accueil et départ des voyageurs',
  'Gestion des réservations',
  'Suivi et maintenance',
  'Courses et réassort',
  'Services complémentaires',
];
export const choixConciergerie = {
  logement: ['Studio', 'Appartement', 'Maison'],
  formule: ['Gestion complète', 'Services à la carte'],
  activite: ['Déjà loué', 'Nouveau projet'],
  plateformes: ['Airbnb', 'Booking', 'Abritel', 'Autres', 'Aucune pour le moment'],
  frequence: [
    'Moins de 2 séjours par mois',
    '2 à 4 séjours par mois',
    'Plus de 4 séjours par mois',
    'À définir',
  ],
  periode: ['Toute l’année', 'Saisonnière'],
  cles: ['En personne', 'Boîte à clés', 'Serrure connectée', 'À définir'],
  contact: ['Téléphone', 'E-mail', 'Sans préférence'],
};
export function validerConciergerie(data: FormData): string | null {
  const get = (key: string) => String(data.get(key) ?? '').trim();
  const values = (key: string) => data.getAll(key).map(String);
  for (const [key, choices] of Object.entries(choixConciergerie)) {
    if (key === 'plateformes') continue;
    if (!(choices as string[]).includes(get(key))) return 'Vérifiez les choix du formulaire.';
  }
  const selected = values('services');
  if (
    !selected.length ||
    selected.length > servicesConciergerie.length ||
    new Set(selected).size !== selected.length ||
    selected.some((s) => !servicesConciergerie.includes(s))
  )
    return 'Choisissez les services souhaités.';
  const onlyCleaning =
    get('formule') === 'Services à la carte' &&
    selected.length === 1 &&
    selected[0] === servicesConciergerie[0];
  if (
    !onlyCleaning &&
    (!values('plateformes').length ||
      values('plateformes').length > 5 ||
      values('plateformes').some((s) => !choixConciergerie.plateformes.includes(s)))
  )
    return 'Précisez les plateformes utilisées.';
  for (const [key, min, max] of [
    ['surface', 1, 10000],
    ['chambres', 0, 100],
    ['bains', 0, 30],
    ['capacite', 1, 100],
  ] as const) {
    const n = Number(get(key));
    if (!get(key) || !Number.isInteger(n) || n < min || n > max)
      return 'Vérifiez les informations du logement.';
  }
  for (const [key, max] of [
    ['adresse', 255],
    ['ville', 100],
    ['nom', 100],
    ['prenom', 100],
  ] as const)
    if (!get(key) || get(key).length > max) return 'Vérifiez vos coordonnées.';
  if (
    !/^\d{5}$/.test(get('code_postal')) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email')) ||
    get('email').length > 255 ||
    !/^[+\d\s().-]{10,30}$/.test(get('telephone')) ||
    get('telephone').replace(/\D/g, '').length < 10
  )
    return 'Vérifiez vos coordonnées.';
  const date = get('date_debut');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    return 'Précisez une date de démarrage valide.';
  if (
    selected.includes('Services complémentaires') &&
    (!get('details_services') || get('details_services').length > 2000)
  )
    return 'Précisez les services complémentaires (2 000 caractères maximum).';
  if (get('message').length > 3000 || data.get('confidentialite') !== 'on')
    return 'Vérifiez le message et le consentement.';
  return null;
}
