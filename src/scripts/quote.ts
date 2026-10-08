// Lista de orçamento (carrinho sem preço) persistida em localStorage.
export interface QuoteItem {
  id: string;      // id do produto
  code: string;
  name: string;
  url: string;
  size: string;
  qty: number;
}
const KEY = 'mga-quote-v1';
const EVT = 'mga:quote';

export function getQuote(): QuoteItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function save(items: QuoteItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: items }));
}

/** Adiciona; se o mesmo produto+bitola já existir, soma a quantidade. */
export function addToQuote(item: QuoteItem) {
  const items = getQuote();
  const found = items.find((i) => i.id === item.id && i.size === item.size);
  if (found) found.qty += item.qty;
  else items.push(item);
  save(items);
}

export function updateQuote(index: number, patch: Partial<QuoteItem>) {
  const items = getQuote();
  if (!items[index]) return;
  items[index] = { ...items[index], ...patch };
  save(items);
}

export function removeFromQuote(index: number) {
  const items = getQuote();
  items.splice(index, 1);
  save(items);
}

export function clearQuote() { save([]); }

export function onQuoteChange(cb: (items: QuoteItem[]) => void) {
  window.addEventListener(EVT, (e) => cb((e as CustomEvent).detail));
  window.addEventListener('storage', (e) => { if (e.key === KEY) cb(getQuote()); });
}

