import images from '../data/images.json';
import { servicesConciergerie } from '../lib/conciergerie';
const form = document.querySelector<HTMLFormElement>('#cq-form')!;
const sections = [...form.querySelectorAll<HTMLElement>('[data-step]')];
const error = document.querySelector<HTMLElement>('#cq-error')!;
const dialog = document.querySelector<HTMLDialogElement>('#cq-dialog')!;
const editor = document.querySelector<HTMLTextAreaElement>('#cq-details')!;
const extra = document.querySelector<HTMLInputElement>('#cq-extra')!;
const saved = form.elements.namedItem('details_services') as HTMLInputElement;
const platformGroup = document.querySelector<HTMLFieldSetElement>('#cq-platforms')!;
const dialogError = document.querySelector<HTMLElement>('#cq-dialog-error')!;
let step = 1;
let busy = false;
let opener: HTMLElement = extra;
const data = () => new FormData(form);
const get = (name: string) => String(data().get(name) ?? '');
const selected = (name: string) => data().getAll(name).map(String);
function platforms() {
  const onlyCleaning =
    get('formule') === 'Services à la carte' &&
    selected('services').length === 1 &&
    selected('services')[0] === servicesConciergerie[0];
  platformGroup.hidden = onlyCleaning;
  platformGroup.disabled = onlyCleaning;
}
function clearError() {
  error.hidden = true;
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
}
function invalid(message: string, el?: HTMLElement) {
  error.textContent = message;
  error.hidden = false;
  el?.setAttribute('aria-invalid', 'true');
  el?.focus();
  return false;
}
function validate(n: number) {
  clearError();
  if (n === 2 && !selected('services').length)
    return invalid('Choisissez au moins un service.', form.querySelector('[name=services]')!);
  if (n === 2 && extra.checked && !saved.value.trim()) {
    openExtra(extra);
    return false;
  }
  if (n === 3 && !platformGroup.hidden && !selected('plateformes').length)
    return invalid(
      'Choisissez au moins une plateforme, ou « Aucune pour le moment ».',
      platformGroup.querySelector('input')!,
    );
  for (const el of sections[n - 1].querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input,select,textarea')) {
    if (el.disabled || (el.closest('fieldset') as HTMLFieldSetElement | null)?.disabled) continue;
    if (!el.checkValidity()) return invalid(el.validationMessage, el);
    if (el.required && el.type !== 'checkbox' && el.type !== 'radio' && !el.value.trim())
      return invalid('Veuillez compléter ce champ.', el);
    if (el.name === 'telephone' && el.value.replace(/\D/g, '').length < 10)
      return invalid('Vérifiez votre numéro de téléphone.', el);
  }
  return true;
}
const labels: Record<string, string> = {
  logement: 'Type de logement',
  adresse: 'Adresse',
  code_postal: 'Code postal',
  ville: 'Ville',
  surface: 'Surface (m²)',
  chambres: 'Chambres',
  bains: 'Salles de bain',
  capacite: 'Capacité d’accueil',
  formule: 'Accompagnement',
  services: 'Services',
  details_services: 'Services complémentaires',
  activite: 'Situation',
  plateformes: 'Plateformes',
  frequence: 'Fréquence des séjours',
  periode: 'Période de location',
  cles: 'Remise des clés',
  date_debut: 'Date de démarrage',
  prenom: 'Prénom',
  nom: 'Nom',
  telephone: 'Téléphone',
  email: 'E-mail',
  contact: 'Préférence de contact',
  message: 'Message',
  confidentialite: 'Consentement',
};
function recap() {
  const root = document.querySelector('#cq-summary')!;
  root.replaceChildren();
  sections.slice(0, 4).forEach((section, i) => {
    const block = document.createElement('section');
    const title = document.createElement('h3');
    title.textContent = ['Votre logement', 'Vos services', 'Votre activité locative', 'Vos coordonnées'][i];
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'cq-secondary';
    edit.textContent = 'Modifier';
    edit.setAttribute('aria-label', `Modifier : ${title.textContent}`);
    edit.onclick = () => show(i + 1);
    const dl = document.createElement('dl');
    const names = new Set(
      [...section.querySelectorAll<HTMLInputElement>('input,select,textarea')].map((el) => el.name),
    );
    if (i === 1 && extra.checked) names.add('details_services');
    names.forEach((name) => {
      const values = selected(name).filter(Boolean);
      if (!values.length) return;
      const dt = document.createElement('dt');
      dt.textContent = labels[name] || name;
      const dd = document.createElement('dd');
      dd.textContent = name === 'confidentialite' ? 'Accord donné' : values.join(', ');
      dl.append(dt, dd);
    });
    block.append(title, edit, dl);
    root.append(block);
  });
}
const accompagnement = [
  {
    titre: 'Chaque logement a son histoire.',
    texte:
      'La surface, la configuration et la capacité d’accueil nous aident à préparer une proposition adaptée à votre bien.',
    image: 'appartement-paris.webp',
    alt: 'Immeuble parisien et balcon fleuri',
  },
  {
    titre: 'Une conciergerie à votre mesure.',
    texte:
      'Gestion complète ou services à la carte : choisissez ce qui vous est utile. Les précisions sur vos besoins nous permettent d’affiner votre proposition.',
    image: 'attention-details.webp',
    alt: 'Préparation soignée d’un logement pour les voyageurs',
  },
  {
    titre: 'Au rythme de vos locations.',
    texte:
      'Quelques séjours ou une activité toute l’année : nous adaptons l’organisation à votre calendrier et à la remise des clés.',
    image: 'accueil-voyageurs.webp',
    alt: 'Accueil de voyageurs dans un logement parisien',
  },
  {
    titre: 'Un échange, en toute confiance.',
    texte:
      'Vos coordonnées nous permettent de vous recontacter pour préciser votre projet. Nous tenons compte de votre préférence de contact.',
    image: 'salon-conciergerie.webp',
    alt: 'Salon parisien accueillant et lumineux',
  },
  {
    titre: 'Votre projet prend forme.',
    texte:
      'Relisez les informations de votre demande. Après son enregistrement, nous vous recontacterons pour préparer votre proposition personnalisée.',
    image: 'chambre-apres.webp',
    alt: 'Chambre préparée avec soin pour un séjour',
  },
];
function presentation(n: number) {
  const aide = accompagnement[n - 1];
  document.querySelector<HTMLElement>('.cq-progress')!.style.setProperty('--cq-progress', `${n * 20}%`);
  document.querySelectorAll('.cq-steps li').forEach((el, i) => el.classList.toggle('is-done', i < n - 1));
  document.querySelector('#cq-help-title')!.textContent = aide.titre;
  document.querySelector('#cq-help-description')!.textContent = aide.texte;
  const photo = document.querySelector<HTMLImageElement>('#cq-help-image')!;
  photo.src = `/images/conciergerie/${aide.image}`;
  photo.alt = aide.alt;
  const meta = images[`/images/conciergerie/${aide.image}` as keyof typeof images];
  if (meta) {
    photo.srcset = meta.srcset;
    photo.sizes = '(max-width: 780px) 100vw, 265px';
  }
}
function show(n: number) {
  step = n;
  clearError();
  platforms();
  presentation(n);
  sections.forEach((s, i) => (s.hidden = i !== n - 1));
  document.querySelectorAll('.cq-steps li').forEach((li, i) => {
    if (i === n - 1) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
  document.querySelector('#cq-progress')!.textContent =
    `Étape ${n} sur 5 — ${['Votre logement', 'Vos services', 'Votre activité locative', 'Vos coordonnées', 'Récapitulatif'][n - 1]}`;
  if (n === 5) recap();
  sections[n - 1].querySelector<HTMLElement>('h2')!.focus();
}
function updateExtra() {
  document.querySelector<HTMLElement>('#cq-extra-summary')!.hidden = !extra.checked || !saved.value;
  document.querySelector('#cq-extra-text')!.textContent = saved.value;
}
function openExtra(trigger: HTMLElement) {
  opener = trigger;
  editor.value = saved.value;
  dialogError.hidden = true;
  editor.removeAttribute('aria-invalid');
  dialog.showModal();
  editor.focus();
}
function cancelExtra() {
  // An unsaved selection is cancelled; previously saved text is retained for editing.
  if (!saved.value.trim()) extra.checked = false;
  dialog.close();
  updateExtra();
  platforms();
}
extra.addEventListener('change', () => {
  if (extra.checked) openExtra(extra);
  else updateExtra();
});
document
  .querySelector('#cq-edit-extra')!
  .addEventListener('click', (e) => openExtra(e.currentTarget as HTMLElement));
dialog.querySelectorAll('[data-dismiss]').forEach((el) => el.addEventListener('click', cancelExtra));
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  cancelExtra();
});
dialog.addEventListener('close', () => opener.focus());
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      (e as MouseEvent).clientX < r.left ||
      (e as MouseEvent).clientX > r.right ||
      (e as MouseEvent).clientY < r.top ||
      (e as MouseEvent).clientY > r.bottom
    )
      cancelExtra();
  }
});
document.querySelector('#cq-dialog-form')!.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!editor.value.trim() || !editor.checkValidity()) {
    dialogError.hidden = false;
    editor.setAttribute('aria-invalid', 'true');
    editor.focus();
    return;
  }
  saved.value = editor.value.trim();
  extra.checked = true;
  updateExtra();
  dialog.close();
});
form.addEventListener('change', () => {
  clearError();
  platforms();
});
form.addEventListener('input', clearError);
form.querySelectorAll('[data-next]').forEach((b) =>
  b.addEventListener('click', () => {
    if (validate(step)) show(step + 1);
  }),
);
form.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => show(step - 1)));
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy) return;
  // Enter in a field advances the current step without sending a partial request.
  if (step < 5) {
    if (validate(step)) show(step + 1);
    return;
  }
  for (let i = 1; i <= 4; i++) {
    if (!validate(i)) {
      show(i);
      validate(i);
      return;
    }
  }
  busy = true;
  const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
  const buttons = [...form.querySelectorAll<HTMLButtonElement>('button')];
  buttons.forEach((b) => (b.disabled = true));
  submit.textContent = 'Enregistrement…';
  try {
    const payload = data();
    if (!extra.checked) payload.delete('details_services');
    const response = await fetch('/api/devis', { method: 'POST', body: payload });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Enregistrement impossible.');
    form.hidden = true;
    document.querySelector<HTMLElement>('#cq-workspace')!.hidden = true;
    document.querySelector('#cq-progress')!.textContent = 'Votre demande a bien été enregistrée';
    document.querySelectorAll('.cq-steps li').forEach((li) => li.classList.add('is-done'));
    document.querySelector('#cq-reference')!.textContent = result.reference;
    const success = document.querySelector<HTMLElement>('#cq-success')!;
    success.hidden = false;
    success.focus();
  } catch (err) {
    invalid(err instanceof Error ? err.message : 'Erreur de connexion. Veuillez réessayer.');
  } finally {
    busy = false;
    buttons.forEach((b) => (b.disabled = false));
    submit.textContent = 'Envoyer ma demande de devis';
  }
});
const serviceDemande = new URLSearchParams(window.location.search).get('service');
if (serviceDemande && servicesConciergerie.includes(serviceDemande)) {
  const serviceInput = [...form.querySelectorAll<HTMLInputElement>('input[name="services"]')].find(
    (input) => input.value === serviceDemande,
  );
  if (serviceInput) {
    serviceInput.checked = true;
    const formule = form.querySelector<HTMLInputElement>(
      'input[name="formule"][value="Services à la carte"]',
    );
    if (formule) formule.checked = true;
    platforms();
    updateExtra();
  }
}
platforms();
updateExtra();
