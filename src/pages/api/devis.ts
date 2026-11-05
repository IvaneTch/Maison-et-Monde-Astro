import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';
import { enregistrerDevisAvecClient } from '../../lib/clients-devis';
import { validerConciergerie } from '../../lib/conciergerie';
import { randomUUID } from 'node:crypto';

export const prerender = false;

const str = (data: FormData, key: string, max = 255) =>
  String(data.get(key) ?? '')
    .trim()
    .slice(0, max);
const all = (data: FormData, key: string, max = 30) =>
  data
    .getAll(key)
    .map((v) => String(v).slice(0, 120))
    .slice(0, max);
const fail = (error: string, status = 400) =>
  new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) return fail('Format invalide.');
  if (Number(request.headers.get('content-length') ?? 0) > 30000)
    return fail('Demande trop volumineuse.', 413);
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return fail('Formulaire invalide.');
  }
  if (str(data, 'type_devis', 20) === 'professionnel') {
    const entreprise = str(data, 'entreprise', 200);
    const nom = str(data, 'nom', 100);
    const prenom = str(data, 'prenom', 100);
    const email = str(data, 'email', 255);
    const telephone = str(data, 'telephone', 30);
    const codePostal = str(data, 'code_postal', 10);
    const ville = str(data, 'ville', 100);
    const site = str(data, 'type_site', 80);
    const surfaceTexte = str(data, 'surface', 10);
    const surface = surfaceTexte ? Number(surfaceTexte) : null;
    const service = str(data, 'service', 80);
    const frequence = str(data, 'frequence', 40);
    const message = str(data, 'message', 3000);
    const servicesAutorises = [
      'Entretien des bureaux',
      'Nettoyage de commerce',
      'Nettoyage de cabinet',
      'Autre besoin',
    ];
    if (str(data, 'website', 200)) return fail('Demande invalide.');
    if (
      data.get('confidentialite') !== 'on' ||
      !entreprise ||
      !nom ||
      !prenom ||
      !['Bureau', 'Commerce', 'Cabinet', 'Autre'].includes(site) ||
      !ville ||
      !/^[0-9]{5}$/.test(codePostal) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      telephone.replace(/\D/g, '').length < 10 ||
      !servicesAutorises.includes(service) ||
      !['Régulière', 'Ponctuelle', 'À définir'].includes(frequence) ||
      (surface !== null && (!Number.isInteger(surface) || surface < 1 || surface > 100000))
    )
      return fail('Vérifiez les informations de votre demande professionnelle.');

    const reference = `PR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    let connection: mysql.Connection | undefined;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
        user: process.env.DB_USER || import.meta.env.DB_USER,
        password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
        database: process.env.DB_NAME || import.meta.env.DB_NAME || 'maison_monde',
        connectTimeout: 5000,
      });
      await enregistrerDevisAvecClient(
        connection,
        data,
        `INSERT INTO demandes_devis
         (reference_devis,type_devis,nom,prenom,email,telephone,code_postal,ville,type_logement,surface_m2,prestations,frequence,commentaires,prestation_souhaitee)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          reference,
          'detaille',
          nom,
          prenom,
          email,
          telephone,
          codePostal,
          ville,
          site,
          surface,
          JSON.stringify([service]),
          frequence,
          JSON.stringify({ professionnel: { entreprise, type_site: site, service, frequence, message } }),
          'Professionnel',
        ],
      );
      return new Response(JSON.stringify({ ok: true, reference }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    } catch (error) {
      console.error('Échec enregistrement devis professionnel:', error);
      return fail('Le serveur ne peut pas enregistrer la demande pour le moment. Veuillez réessayer.', 500);
    } finally {
      await connection?.end().catch(() => {});
    }
  }
  if (str(data, 'type_devis', 20) === 'conciergerie') {
    const erreur = validerConciergerie(data);
    if (erreur) return fail(erreur);
    const reference = `CC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const services = all(data, 'services');
    const onlyCleaning =
      str(data, 'formule') === 'Services à la carte' &&
      services.length === 1 &&
      services[0] === 'Ménage et préparation';
    const details = Object.fromEntries([
      ['Formule', str(data, 'formule')],
      ['Chambres', str(data, 'chambres')],
      ['Capacité d’accueil', str(data, 'capacite')],
      ['Activité locative', str(data, 'activite')],
      ['Plateformes', onlyCleaning ? 'Non demandé' : all(data, 'plateformes').join(', ')],
      ['Période de location', str(data, 'periode')],
      ['Date de début', str(data, 'date_debut')],
      ['Remise des clés', str(data, 'cles')],
      ['Préférence de contact', str(data, 'contact')],
      [
        'Services complémentaires',
        services.includes('Services complémentaires') ? str(data, 'details_services', 2000) : '',
      ],
      ['Message', str(data, 'message', 3000)],
      ['Consentement', 'Accord au traitement de la demande'],
    ]);
    let connection: mysql.Connection | undefined;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
        user: process.env.DB_USER || import.meta.env.DB_USER,
        password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
        database: process.env.DB_NAME || import.meta.env.DB_NAME || 'maison_monde',
        connectTimeout: 5000,
      });
      // Conserver les valeurs de type_devis déjà acceptées, même si la colonne est un ENUM.
      // La catégorie dédiée est portée par prestation_souhaitee et présentée dans l’administration.
      await enregistrerDevisAvecClient(
        connection,
        data,
        `INSERT INTO demandes_devis
        (reference_devis,type_devis,nom,prenom,email,telephone,adresse,code_postal,ville,
         type_logement,surface_m2,nombre_salles_bain,prestations,frequence,commentaires,prestation_souhaitee)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          reference,
          'detaille',
          str(data, 'nom', 100),
          str(data, 'prenom', 100),
          str(data, 'email'),
          str(data, 'telephone', 30),
          str(data, 'adresse'),
          str(data, 'code_postal', 10),
          str(data, 'ville', 100),
          str(data, 'logement'),
          Number(str(data, 'surface')),
          Number(str(data, 'bains')),
          JSON.stringify(services),
          str(data, 'frequence'),
          JSON.stringify({ conciergerie: details }),
          'Conciergerie',
        ],
      );
      return new Response(JSON.stringify({ ok: true, reference }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    } catch (error) {
      console.error('Échec enregistrement devis conciergerie:', error);
      return fail('Le serveur ne peut pas enregistrer la demande pour le moment. Veuillez réessayer.', 500);
    } finally {
      await connection?.end().catch(() => {});
    }
  }
  // Devis simple : mêmes API et table que le devis détaillé.
  if (str(data, 'type_devis', 20) === 'simple') {
    const nom = str(data, 'nom', 100);
    const prenom = str(data, 'prenom', 100);
    const email = str(data, 'email', 255);
    const telephone = str(data, 'telephone', 30);
    const adresse = str(data, 'adresse', 255);
    const codePostal = str(data, 'code_postal', 10);
    const frequence = str(data, 'frequence', 30);
    // Compatible avec l'ancien formulaire (une prestation) et le nouveau
    // formulaire multisélection (valeurs séparées par des virgules).
    const prestations = data
      .getAll('prestation')
      .flatMap((value) => String(value).split(','))
      .map((value) => value.trim())
      .filter(Boolean);
    const prestationsAutoriseesSimple = [
      'Menage a domicile',
      'Repassage',
      'Nettoyage de vitres',
      'Autre prestation',
    ];

    if (
      data.get('confidentialite') !== 'on' ||
      !nom ||
      !prenom ||
      !adresse ||
      !/^[0-9]{5}$/.test(codePostal) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      telephone.replace(/\D/g, '').length < 10
    ) {
      return fail('Vérifiez vos coordonnées.');
    }
    if (
      !['Reguliere', 'Occasionnelle'].includes(frequence) ||
      prestations.length === 0 ||
      prestations.length > prestationsAutoriseesSimple.length ||
      new Set(prestations).size !== prestations.length ||
      prestations.some((value) => !prestationsAutoriseesSimple.includes(value))
    ) {
      return fail('Sélectionnez une fréquence et une prestation.');
    }
    const reference = `MM-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    let connection: mysql.Connection | undefined;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
        user: process.env.DB_USER || import.meta.env.DB_USER,
        password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
        database: process.env.DB_NAME || import.meta.env.DB_NAME || 'maison_monde',
        connectTimeout: 5000,
      });
      await enregistrerDevisAvecClient(
        connection,
        data,
        `INSERT INTO demandes_devis
         (reference_devis, type_devis, nom, prenom, email, telephone,
          adresse, code_postal, prestations, frequence, commentaires)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reference,
          'simple',
          nom,
          prenom,
          email,
          telephone,
          adresse,
          codePostal,
          JSON.stringify(prestations),
          frequence === 'Reguliere' ? 'Régulière' : 'Occasionnelle',
          `Adresse de prestation : ${adresse}`,
        ],
      );
      return new Response(JSON.stringify({ ok: true, reference }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      console.error('Échec enregistrement devis simple:', error);
      return fail('Le serveur ne peut pas enregistrer la demande pour le moment.', 500);
    } finally {
      await connection?.end().catch(() => {});
    }
  }
  if (str(data, 'type_devis', 20) && str(data, 'type_devis', 20) !== 'detaille') {
    return fail('Type de devis inconnu.');
  }
  const nom = str(data, 'nom', 100),
    prenom = str(data, 'prenom', 100);
  const email = str(data, 'email', 255),
    telephone = str(data, 'telephone', 30);
  const adresse = str(data, 'adresse', 255),
    codePostal = str(data, 'code_postal', 10),
    ville = str(data, 'ville', 100);
  const logement = str(data, 'logement', 50),
    animaux = str(data, 'animaux', 10);
  const surface = Number(str(data, 'surface', 15)),
    pieces = Number(str(data, 'pieces', 5)),
    bains = Number(str(data, 'bains', 5));
  const typePrestation = str(data, 'type_prestation', 30),
    frequence = str(data, 'frequence', 100),
    duree = str(data, 'duree', 100);
  const services = all(data, 'services'),
    disponibilites = all(data, 'disponibilites');
  const prestationsAutorisees = [
    'ponctuel',
    'grand-menage',
    'vitres',
    'repassage',
    'Repassage à domicile',
    'classique',
    'confort',
    'expert',
    'liberte',
    'Ménage ponctuel',
    'Grand ménage',
    'Nettoyage des vitres',
    'Formule Classique',
    'Formule Confort',
    'Formule Expert',
    'Formule Liberté',
    'Formule Test',
    'test',
  ];

  const prestationSouhaitee = str(data, 'prestation_souhaitee', 100);
  // Durée obligatoire de 3 à 7 heures pour la Formule Test.
  if (
    ['Formule Test', 'test'].includes(prestationSouhaitee) &&
    !['3 h', '3 h 30', '4 h', '5 h', '6 h', '7 h'].includes(duree)
  ) {
    return fail('Pour la Formule Test, choisissez une durée de 3 à 7 heures.');
  }

  if (prestationSouhaitee && !prestationsAutorisees.includes(prestationSouhaitee)) {
    return fail('Prestation sélectionnée invalide.');
  }
  if (
    !nom ||
    !prenom ||
    !adresse ||
    !ville ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[0-9]{5}$/.test(codePostal) ||
    telephone.replace(/\D/g, '').length < 10
  )
    return fail('Vérifiez vos coordonnées.');
  if (
    !['Appartement', 'Maison', 'Bureau / local professionnel', 'Autre'].includes(logement) ||
    !['Oui', 'Non'].includes(animaux) ||
    !Number.isInteger(surface) ||
    surface < 1 ||
    surface > 10000 ||
    !Number.isInteger(pieces) ||
    pieces < 1 ||
    pieces > 100 ||
    !Number.isInteger(bains) ||
    bains < 0 ||
    bains > 30
  )
    return fail('Vérifiez les informations du logement.');
  if (
    !services.length ||
    !disponibilites.length ||
    !['Régulière', 'Ponctuelle'].includes(typePrestation) ||
    (typePrestation === 'Régulière' && !frequence) ||
    !duree ||
    data.get('confidentialite') === null
  )
    return fail('Complétez les champs obligatoires et le consentement.');
  const notes = [
    ['Type de prestation', typePrestation],
    ['Animaux', all(data, 'type_animaux').join(', ')],
    ['Précisions services', str(data, 'details_services', 2000)],
    ['Date de début', str(data, 'date_debut', 30)],
    ['Adresse de prestation', adresse],
    ['Complément adresse', str(data, 'complement', 255)],
    ['Message', str(data, 'message', 3000)],
    ['Avance immédiate', data.get('avance_immediate') !== null ? 'Oui' : 'Non'],
    ['Flexibilité', str(data, 'flexible', 100)],
    ['Horaires', str(data, 'horaires', 100)],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key} : ${value}`)
    .join('\n')
    .slice(0, 12000);
  const reference = `MM-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
      user: process.env.DB_USER || import.meta.env.DB_USER,
      password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
      database: process.env.DB_NAME || import.meta.env.DB_NAME || 'maison_monde',
      connectTimeout: 5000,
    });
    await enregistrerDevisAvecClient(
      connection,
      data,
      `INSERT INTO demandes_devis
  (
    reference_devis,
    type_devis,
    nom,
    prenom,
    email,
    telephone,
adresse,
code_postal,
ville,
    type_logement,
    surface_m2,
    nombre_pieces,
    nombre_salles_bain,
    animaux_presents,
    prestations,
    frequence,
    duree_souhaitee,
    disponibilites,
    commentaires,
    prestation_souhaitee
  )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        reference,
        'detaille',
        nom,
        prenom,
        email,
        telephone,
        adresse,
        codePostal,
        ville,
        logement,
        surface,
        pieces,
        bains,
        animaux === 'Oui' ? 1 : 0,
        JSON.stringify(services),
        typePrestation === 'Régulière' ? frequence : 'Ponctuelle',
        duree,
        JSON.stringify(disponibilites),
        notes,
        prestationSouhaitee || null,
      ],
    );
    return new Response(JSON.stringify({ ok: true, reference }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Échec enregistrement devis:', error);
    return fail('Le serveur ne peut pas enregistrer la demande pour le moment.', 500);
  } finally {
    await connection?.end().catch(() => {});
  }
};
