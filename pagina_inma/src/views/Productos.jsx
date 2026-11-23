// pagina_inma/src/views/Productos.jsx
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Minus, Camera, X, ArrowLeft, Trash2, ChevronLeft } from 'lucide-react';
import { useData, BusinessError } from '../lib/data';
import { eur, totalStock, unitsLabel, DEPARTMENTS, PRODUCT_TYPES, TAGS, SIZE_PRESETS, dept, LOW_STOCK_DEFAULT, sizeAlerts } from '../lib/format';
import { compressImage } from '../lib/images';
import { Sheet, SheetBody, Field, Toggle, Empty, useConfirm } from '../components/ui';

const blank = () => ({ name: '', department: 'mujer', category: 'Vestidos', description: '', tag: '', featured: false, active: true, salePrice: '', costPrice: '', sku: '', variants: SIZE_PRESETS[0].sizes.map((size) => ({ size, stock: 0 })), images: [] });

const confetti = async () => { try { (await import('canvas-confetti')).default({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#F4C2C2', '#C4552D', '#A2C2E1', '#F3D696'] }); } catch { /* opcional */ } };

function ProductSheet({ product, onClose }) {
  const { actions, backend } = useData();
  const confirm = useConfirm();
  const isNew = !product?.id;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [form, setForm] = useState(() => product ? { ...blank(), ...product, salePrice: product.salePrice, costPrice: product.costPrice, images: (product.images || []).map((url) => ({ url })) } : blank());
  const [customSize, setCustomSize] = useState('');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => () => form.images.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []); // eslint-disable-line

  const sale = Number(String(form.salePrice).replace(',', '.')) || 0;
  const cost = Number(String(form.costPrice).replace(',', '.')) || 0;
  const profit = sale - cost;
  const pct = sale > 0 ? Math.round((profit / sale) * 100) : 0;
  const valid = {
    photos: form.images.length > 0,
    data: form.name.trim().length >= 2,
    price: sale > 0 && form.variants.length > 0,
  };
  const allValid = valid.photos && valid.data && valid.price;

  const addFiles = async (files) => {
    const all = [...files];
    if (all.length > 10 - form.images.length) toast.info('Solo caben 10 fotos: he cogido las primeras.');
    const list = all.slice(0, 10 - form.images.length);
    const done = [];
    setPreparing(true);
    for (const file of list) {
      if (!file.type.startsWith('image/')) { toast.info(`${file.name} no es una imagen`); continue; }
      if (file.size > 30 * 1024 * 1024) { toast.error(`${file.name} pesa demasiado (máx. 30 MB)`); continue; }
      try { const blob = await compressImage(file, backend.mode === 'demo' ? { max: 700, quality: 0.7 } : {}); done.push({ blob, preview: URL.createObjectURL(blob) }); }
      catch { toast.error(`No se pudo leer ${file.name}`); }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...done] }));
    setPreparing(false);
  };
  const moveImg = (i) => setForm((f) => { const a = [...f.images]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...f, images: a }; });
  const removeImg = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }));

  const applyPreset = (sizes) => setForm((f) => ({ ...f, variants: sizes.map((size) => ({ size, stock: f.variants.find((v) => v.size === size)?.stock || 0 })) }));
  const setStockFor = (size, n) => setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.size === size ? { ...v, stock: Math.max(0, Math.min(9999, Number(n) || 0)) } : v)) }));
  const addSize = () => {
    const s = customSize.trim();
    if (!s) return;
    if (form.variants.some((v) => v.size.toLowerCase() === s.toLowerCase())) return toast.info('Esa talla ya está');
    set({ variants: [...form.variants, { size: s, stock: 0 }] }); setCustomSize('');
  };

  const save = async () => {
    if (!allValid) return;
    setSaving(true);
    try {
      const id = product?.id || `prod-${Date.now().toString(36)}`;
      const urls = [];
      const pending = form.images.filter((x) => !x.url).length;
      let n = 0;
      for (let i = 0; i < form.images.length; i++) {
        const img = form.images[i];
        if (img.url) { urls.push(img.url); continue; }
        n += 1;
        setProgress(`Subiendo foto ${n} de ${pending}…`);
        let url;
        for (let attempt = 1; ; attempt++) {
          try { url = await backend.upload(img.blob, `products/${id}/${Date.now()}-${i}.webp`); break; }
          catch (e) { if (attempt >= 2) throw e; }
        }
        urls.push(url);
        // Guardamos la URL: si algo falla después, al reintentar no se vuelve a subir esta foto.
        setForm((f) => ({ ...f, images: f.images.map((x) => (x === img ? { ...x, url } : x)) }));
      }
      setProgress('Guardando…');
      const d = dept(form.department);
      await actions.saveProduct({
        ...form, id, name: form.name.trim(), description: form.description.trim(), salePrice: sale, costPrice: cost, images: urls,
        sku: form.sku.trim() || `${d.id.slice(0, 3).toUpperCase()}-${id.slice(-5).toUpperCase()}`,
        variants: form.variants.map((v) => ({ size: v.size, stock: Number(v.stock) || 0 })),
        demo: undefined, // al editar un producto de prueba deja de ser "de prueba"
      });
      toast.success(isNew ? '¡Producto subido! Ya se ve en la tienda 🎉' : 'Cambios guardados');
      if (isNew) confetti();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof BusinessError ? err.message : `No se pudo guardar${err?.message ? ` (${err.message})` : ''}. Revisa tu conexión y vuelve a intentarlo: las fotos ya subidas no se repiten.`, { duration: 8000 });
      setSaving(false); setProgress('');
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: `¿Borrar "${product.name}"?`, text: 'Desaparecerá de la tienda. Los pedidos antiguos no se tocan.', ok: 'Borrar', danger: true }))) return;
    await actions.deleteProduct(product.id); toast.success('Producto borrado'); onClose();
  };

  const stepsLabels = ['1 · Fotos', '2 · Datos', '3 · Precio y tallas'];
  return (
    <Sheet title={isNew ? 'Nuevo producto' : 'Editar producto'} onClose={onClose} wide
      footer={<>
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}><ArrowLeft aria-hidden />Atrás</button>}
        {step < 2 ? <button className="btn btn-dark" onClick={() => setStep(step + 1)}>Siguiente</button> : <button className="btn btn-primary" disabled={!allValid || saving} onClick={save}>{saving ? (progress || 'Guardando…') : isNew ? 'Publicar producto' : 'Guardar cambios'}</button>}
      </>}>
      <div className="steps" role="tablist">
        {stepsLabels.map((l, i) => <button key={l} className={`step${i < step && Object.values(valid)[i] ? ' done' : ''}`} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>{l}</button>)}
      </div>
      <SheetBody>
        {step === 0 && (
          <div className="stack">
            <p className="muted">Sube todas las fotos que quieras (hasta 10). La primera es la portada que ve el cliente.</p>
            <div className="photos">
              {form.images.map((img, i) => (
                <div className="photo" key={img.url || img.preview}>
                  <img src={img.url || img.preview} alt={`Foto ${i + 1}`} />
                  {i > 0 && <button className="mv" onClick={() => moveImg(i)} aria-label="Mover antes"><ChevronLeft /></button>}
                  <button className="x" onClick={() => removeImg(i)} aria-label="Quitar foto"><X /></button>
                  {i === 0 && <span className="badge b-pink cover">Portada</span>}
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="addphoto" style={{ cursor: 'pointer' }}>
                  <Camera aria-hidden /><span>{preparing ? 'Preparando…' : 'Añadir fotos'}</span>
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              )}
            </div>
            {!valid.photos && <p className="hint">Hace falta al menos una foto para publicar.</p>}
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <Field label="Nombre del producto"><input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej: Vestido midi de lino" maxLength={80} /></Field>
            <div className="field"><span>¿En qué sección va?</span>
              <div className="chips">{DEPARTMENTS.map((d) => <button key={d.id} type="button" className="chip" aria-pressed={form.department === d.id} onClick={() => set({ department: d.id })}>{d.emoji} {d.name}</button>)}</div>
            </div>
            <Field label="Tipo de prenda"><select className="select" value={form.category} onChange={(e) => set({ category: e.target.value })}>{PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Descripción" hint="Material, cómo queda, cómo se cuida…"><textarea className="textarea" value={form.description} onChange={(e) => set({ description: e.target.value })} maxLength={600} /></Field>
            <div className="field"><span>Etiqueta en la foto</span>
              <div className="chips">{TAGS.map((t) => <button key={t || 'none'} type="button" className="chip" aria-pressed={form.tag === t} onClick={() => set({ tag: t })}>{t || 'Ninguna'}</button>)}</div>
            </div>
            <div className="row between"><div><b>Destacado en el inicio</b><p className="hint">Sale en el carrusel de la portada.</p></div><Toggle checked={form.featured} onChange={(v) => set({ featured: v })} label="Destacado" /></div>
            <Field label="Referencia (opcional)" hint="Si lo dejas vacío, la ponemos nosotros."><input className="input" value={form.sku} onChange={(e) => set({ sku: e.target.value })} /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="stack-lg">
            <div className="grid-2">
              <Field label="Lo que te cuesta (€)"><input className="input num" inputMode="decimal" value={form.costPrice} onChange={(e) => set({ costPrice: e.target.value })} placeholder="0,00" /></Field>
              <Field label="Precio de venta (€)" hint="IVA incluido"><input className="input num" inputMode="decimal" value={form.salePrice} onChange={(e) => set({ salePrice: e.target.value })} placeholder="0,00" /></Field>
            </div>
            {sale > 0 && (
              <div className={`margin-box${profit < 0 ? ' neg' : ''}`} aria-live="polite">
                <span>{profit < 0 ? 'Con este precio pierdes' : 'Ganas por cada prenda'}</span>
                <strong className="num">{eur(Math.abs(profit))} <span className="muted small" style={{ fontWeight: 600 }}>({pct}%)</span></strong>
              </div>
            )}
            <div className="field"><span>Tallas</span>
              <div className="chips">{SIZE_PRESETS.map((p) => <button key={p.id} type="button" className="chip" onClick={() => applyPreset(p.sizes)}>{p.label}</button>)}</div>
            </div>
            <div className="sizes">
              {form.variants.map((v) => (
                <div className="size-row" key={v.size}>
                  <b>{v.size}</b>
                  <span className="muted small">{unitsLabel(Number(v.stock) || 0)}</span>
                  <div className="stepper">
                    <button type="button" onClick={() => setStockFor(v.size, (Number(v.stock) || 0) - 1)} aria-label={`Quitar una de la talla ${v.size}`}><Minus size={18} /></button>
                    <input inputMode="numeric" value={v.stock} onChange={(e) => setStockFor(v.size, e.target.value)} aria-label={`Unidades talla ${v.size}`} />
                    <button type="button" onClick={() => setStockFor(v.size, (Number(v.stock) || 0) + 1)} aria-label={`Añadir una de la talla ${v.size}`}><Plus size={18} /></button>
                  </div>
                  {form.variants.length > 1 && <button className="icon-btn" onClick={() => set({ variants: form.variants.filter((x) => x.size !== v.size) })} aria-label={`Quitar talla ${v.size}`}><X /></button>}
                </div>
              ))}
            </div>
            <div className="row"><input className="input" style={{ flex: 1 }} placeholder="Otra talla (ej: 38, XXL…)" value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} /><button className="btn" onClick={addSize}>Añadir</button></div>
            <div className="row between"><div><b>Visible en la tienda</b><p className="hint">Apágalo para esconderlo sin borrarlo.</p></div><Toggle checked={form.active} onChange={(v) => set({ active: v })} label="Visible en la tienda" /></div>
            {!isNew && <button className="btn btn-danger" onClick={remove}><Trash2 aria-hidden />Borrar producto</button>}
            {!allValid && <p className="hint">Para publicar falta: {[!valid.photos && 'una foto', !valid.data && 'el nombre', !valid.price && 'el precio y una talla'].filter(Boolean).join(', ')}.</p>}
          </div>
        )}
      </SheetBody>
    </Sheet>
  );
}

export default function Productos({ intent, clearIntent }) {
  const { products, actions } = useData();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('todos');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!intent) return;
    if (intent.new) setEditing({});
    if (intent.open) { const p = products.find((x) => x.id === intent.open); if (p) setEditing(p); }
    clearIntent();
  }, [intent]); // eslint-disable-line

  const list = useMemo(() => products.filter((p) => {
    if (filter === 'poco' && totalStock(p) > (p.lowStockThreshold ?? LOW_STOCK_DEFAULT)) return false;
    if (filter === 'ocultos' && p.active !== false) return false;
    if (!['todos', 'poco', 'ocultos'].includes(filter) && p.department !== filter) return false;
    const t = q.trim().toLowerCase();
    return !t || `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(t);
  }), [products, q, filter]);

  const filters = [['todos', 'Todos'], ...DEPARTMENTS.map((d) => [d.id, `${d.emoji} ${d.name}`]), ['poco', '⚠️ Poco stock'], ['ocultos', 'Ocultos']];

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div><h1>Productos</h1><p>{products.length} en total · lo que cambies aquí se ve al instante en la tienda.</p></div>
        <div className="actions"><button className="btn btn-primary btn-lg" onClick={() => setEditing({})}><Plus aria-hidden />Nuevo producto</button></div>
      </div>
      <div className="stack">
        <div className="search"><Search aria-hidden /><input className="input" placeholder="Buscar por nombre o referencia" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar productos" /></div>
        <div className="scroll-x" role="group" aria-label="Filtrar">{filters.map(([id, l]) => <button key={id} className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{l}</button>)}</div>
      </div>

      {list.length === 0 ? (
        <Empty emoji="👗" title={products.length ? 'No hay resultados' : 'Aún no hay productos'} text={products.length ? 'Prueba con otra búsqueda.' : 'Sube tu primera prenda: solo necesitas fotos, nombre y precio.'} action={!products.length && <button className="btn btn-primary" onClick={() => setEditing({})}>Subir mi primer producto</button>} />
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 156px), 1fr))' }}>
          {list.map((p, i) => {
            const stock = totalStock(p);
            const low = stock <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT);
            const al = sizeAlerts(p);
            return (
              <div key={p.id} className={`pcard rise${p.active === false ? ' off' : ''}`} style={{ '--i': Math.min(i, 10) }}>
                <button className="ph" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}>
                  {p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" />}
                  <div className="tags">{p.active === false && <span className="badge">Oculto</span>}{stock === 0 && <span className="badge b-bad">Agotado</span>}{p.demo && <span className="badge b-blue">Prueba</span>}</div>
                </button>
                <div className="info">
                  <span className="muted small">{dept(p.department).name} · {p.category}</span>
                  <b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</b>
                  <div className="row between"><b className="num">{eur(p.salePrice)}</b><span className="muted small num">{unitsLabel(stock)}</span></div>
                  <div className={`stockbar${stock === 0 ? ' out' : low ? ' low' : ''}`}><i style={{ width: `${Math.min(100, (stock / 20) * 100)}%` }} /></div>
                  {(al.out.length > 0 || al.last.length > 0) && (
                    <div className="tags" style={{ position: 'static', flexWrap: 'wrap', gap: 4 }}>
                      {al.out.length > 0 && <span className="badge b-bad">Sin talla {al.out.join(', ')}</span>}
                      {al.last.length > 0 && <span className="badge b-warn">Última: {al.last.join(', ')}</span>}
                    </div>
                  )}
                  <div className="row between" style={{ marginTop: 6 }}><span className="small">Visible</span><Toggle checked={p.active !== false} onChange={(v) => actions.setActive(p.id, v)} label={`Mostrar ${p.name} en la tienda`} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editing && <ProductSheet product={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </div>
  );
}
