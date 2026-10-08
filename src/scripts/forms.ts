// Validação acessível + envio JSON para endpoint configurável.
// Mensagens vêm de data-* do <form> (traduzidas no servidor).
export interface FormOptions {
  endpoint: string;
  extra?: () => Record<string, unknown>;
  onSuccess?: (data: Record<string, unknown>) => string | void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{10,20}$/;

export function setupForm(form: HTMLFormElement, opts: FormOptions) {
  const msg = form.dataset;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;

  const fieldOf = (el: Element) => el.closest<HTMLElement>('.field');
  const setError = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, text: string) => {
    const field = fieldOf(el);
    const err = field?.querySelector<HTMLElement>('.error');
    if (text) { field?.setAttribute('data-invalid', ''); el.setAttribute('aria-invalid', 'true'); }
    else { field?.removeAttribute('data-invalid'); el.removeAttribute('aria-invalid'); }
    if (err) err.textContent = text;
  };
  const check = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    if (el.disabled || el.closest('[hidden]')) { setError(el, ''); return true; }
    const v = el.value.trim();
    let e = '';
    if (el instanceof HTMLInputElement && el.type === 'checkbox') { if (el.required && !el.checked) e = msg.errConsent!; }
    else if (el.required && !v) e = msg.errRequired!;
    else if (v && el.type === 'email' && !EMAIL.test(v)) e = msg.errEmail!;
    else if (v && el.type === 'tel' && !PHONE.test(v)) e = msg.errPhone!;
    setError(el, e);
    return !e;
  };
  const controls = () => [...form.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([name=website]), select, textarea')];
  form.noValidate = true;
  form.addEventListener('blur', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.matches?.('input, select, textarea') && el.value) check(el);
  }, true);
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.getAttribute('aria-invalid')) check(el);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = controls().filter((el) => !check(el));
    if (invalid.length) {
      status.className = 'form-status is-error';
      status.textContent = msg.errSummary!;
      invalid[0].focus();
      return;
    }
    if ((form.elements.namedItem('website') as HTMLInputElement)?.value) return; // honeypot
    const data: Record<string, unknown> = {};
    new FormData(form).forEach((v, k) => {
      if (k === 'website') return;
      if (k in data) data[k] = ([] as unknown[]).concat(data[k], v);
      else data[k] = v;
    });
    Object.assign(data, opts.extra?.() ?? {}, { page: location.href, lang: document.documentElement.lang, sentAt: new Date().toISOString() });

    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = msg.sending!;
    try {
      if (!opts.endpoint) {
        console.info('[form demo] payload:', data);
        status.className = 'form-status is-warn';
        status.textContent = msg.notConfigured!;
      } else {
        const res = await fetch(opts.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
        const extra = opts.onSuccess?.(data);
        status.className = 'form-status is-ok';
        status.textContent = extra || msg.success!;
        form.reset();
      }
    } catch {
      status.className = 'form-status is-error';
      status.textContent = msg.error!;
    } finally {
      submit.disabled = false;
      submit.textContent = label;
      status.focus();
    }
  });
}
