export const objetsContact = ['Ménage', 'Conciergerie', 'Professionnel', 'Autre demande'];
export const disponibilitesRappel = ['Dès que possible', 'Le matin', 'L’après-midi', 'En soirée'];
export function validerContact(data: FormData): string | null {
  const lire = (k: string) => String(data.get(k) ?? '').trim();
  if (!['contact', 'rappel'].includes(lire('type_demande'))) return 'Type de demande invalide.';
  if (
    !lire('prenom') ||
    lire('prenom').length > 100 ||
    !/^[+\d\s().-]{10,30}$/.test(lire('telephone')) ||
    lire('telephone').replace(/\D/g, '').length < 10
  )
    return 'Vérifiez votre prénom et votre téléphone.';
  if (
    lire('type_demande') === 'contact' &&
    (!lire('nom') ||
      lire('nom').length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lire('email')) ||
      lire('email').length > 255 ||
      !objetsContact.includes(lire('objet')) ||
      !lire('message') ||
      lire('message').length > 3000)
  )
    return 'Vérifiez votre nom, votre e-mail, l’objet et le message.';
  if (lire('type_demande') === 'rappel' && !disponibilitesRappel.includes(lire('disponibilite')))
    return 'Choisissez un créneau de rappel.';
  if (data.get('confidentialite') !== 'on') return 'Votre accord est nécessaire pour traiter la demande.';
  if (lire('website')) return 'La demande n’a pas pu être acceptée.';
  return null;
}
