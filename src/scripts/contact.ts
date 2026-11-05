document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('[data-contact-status]')!;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const bouton = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    if (bouton.disabled) return;
    const label = bouton.textContent;
    bouton.disabled = true;
    bouton.textContent = 'Enregistrement…';
    status.textContent = '';
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Enregistrement impossible.');
      status.dataset.state = 'success';
      status.textContent = `Votre demande est enregistrée. Référence : ${result.reference}. Nous vous recontacterons prochainement.`;
      form.reset();
      if (form.id === 'mm-callback-form') {
        window.setTimeout(() => {
          const dialog = form.closest('dialog');
          if (dialog?.open) dialog.close('submitted');
        }, 1400);
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent =
        error instanceof Error ? error.message : 'Connexion impossible. Veuillez réessayer.';
    } finally {
      bouton.disabled = false;
      bouton.textContent = label;
    }
  });
});
