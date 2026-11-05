import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categorieDevis, accompagnementConciergerie, infosProfessionnel } from '../src/lib/devis-admin.ts';
test('les anciens devis Conciergerie MM restent classés en Conciergerie', () => {
  const ancienne = {
    reference_devis: 'MM-20261102-031D771D',
    type_devis: 'detaille',
    prestation_souhaitee: 'Conciergerie',
  };
  assert.equal(categorieDevis(ancienne), 'Conciergerie');
  assert.equal(ancienne.reference_devis, 'MM-20261102-031D771D');
  assert.equal(categorieDevis({ type_devis: 'simple' }), 'Ménage');
  assert.equal(categorieDevis({ type_devis: 'detaille', prestation_souhaitee: 'Grand ménage' }), 'Ménage');
});
test('les listes ne se recouvrent pas et couvrent les deux activités', () => {
  const lignes = [
    { type_devis: 'simple' },
    { type_devis: 'detaille' },
    { prestation_souhaitee: 'Conciergerie' },
    { type_devis: 'Conciergerie' },
  ];
  const menage = lignes.filter((d) => categorieDevis(d) === 'Ménage');
  const cc = lignes.filter((d) => categorieDevis(d) === 'Conciergerie');
  assert.equal(menage.length, 2);
  assert.equal(cc.length, 2);
  assert.equal(menage.length + cc.length, lignes.length);
});
test('l’accompagnement se lit sans casser les anciennes demandes', () => {
  assert.equal(
    accompagnementConciergerie(JSON.stringify({ conciergerie: { Formule: 'Gestion complète' } })),
    'Gestion complète',
  );
  for (const v of [null, 'Ancien commentaire', '{}', '{"conciergerie":{"Formule":12}}'])
    assert.equal(accompagnementConciergerie(v), 'À préciser');
});
test('les devis Professionnel ont une catégorie distincte et gardent les détails du site', () => {
  assert.equal(categorieDevis({ type_devis: 'Professionnel' }), 'Professionnel');
  assert.equal(
    categorieDevis({ prestation_souhaitee: 'Professionnel', type_devis: 'detaille' }),
    'Professionnel',
  );
  assert.deepEqual(
    infosProfessionnel(
      JSON.stringify({
        professionnel: { entreprise: 'Atelier Paris', type_site: 'Cabinet', service: 'Nettoyage de cabinet' },
      }),
    ),
    { entreprise: 'Atelier Paris', site: 'Cabinet', service: 'Nettoyage de cabinet' },
  );
  assert.deepEqual(infosProfessionnel('commentaire ancien'), { entreprise: '', site: '', service: '' });
});
