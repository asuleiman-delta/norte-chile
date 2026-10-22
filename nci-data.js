/* NCI · datos compartidos de páginas internas + lista de cotización (localStorage) */
(function () {
  const IC = {
    otros: '<path d="M12 5v14M5 12h14"/>',
    fitting: '<path d="M4 21v-8a9 9 0 0 1 9-9h8"/><path d="M9 21v-8a4 4 0 0 1 4-4h8"/><path d="M2.5 21h8M21 2.5v8"/>',
    canerias: '<rect x="2" y="9" width="20" height="6" rx="1"/><path d="M7 7.5v9M17 7.5v9"/>',
    valvulas: '<path d="M5 8l7 4-7 4z"/><path d="M19 8l-7 4 7 4z"/><path d="M12 12V5M9 5h6M2 12h3M19 12h3"/>',
    flanges: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="5.8" r=".8"/><circle cx="12" cy="18.2" r=".8"/><circle cx="5.8" cy="12" r=".8"/><circle cx="18.2" cy="12" r=".8"/>',
    incendio: '<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.2 1-3.8 2.3-5 .2 1.8.9 2.8 2 3.2-.4-3.4.2-6.3.7-8.7z"/>',
    instrumentacion: '<circle cx="12" cy="13" r="8"/><path d="M12 13l3.5-3.5M8.5 17h7M10 3h4M12 3v2"/>',
    pernos: '<path d="M8 3h8l2 3-2 3H8L6 6z"/><path d="M10 9v12h4V9M10 13h4M10 17h4"/>',
    chicagos: '<path d="M3 12h5M16 12h5"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M8 8L6 5.5M16 16l2 2.5"/>',
    camlocks: '<path d="M2 10h8v4H2zM10 8.5h5v7h-5zM15 12h7M12.5 8.5V4l5-1.5"/>',
    storz: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 3.5v3M12 17.5v3"/>',
    abrazaderas: '<path d="M18.5 9A7 7 0 1 1 14 5.3"/><path d="M14 5.3V2.5h5.5v4l-1 2.5"/>',
    hdpe: '<rect x="2" y="8" width="20" height="8" rx="4"/><path d="M6 12h12"/>',
    mangueras: '<path d="M2 8h1c2 0 2 8 4 8s2-8 4-8 2 8 4 8 2-8 4-8h2"/>',
    seguridad: '<path d="M3 18h18v2H3zM5 18a7 7 0 0 1 14 0M10 11.5V7a2 2 0 0 1 4 0v4.5"/>'
  };
  const ico = (k, c) => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + (IC[k] || IC.otros) + '</svg>');

  const P = {
    home: 'index.html',
    catalogo: 'NCI%20Catalogo.dc.html',
    categoria: 'NCI%20Categoria.dc.html',
    producto: 'NCI%20Producto.dc.html',
    cotizacion: 'NCI%20Cotizacion.dc.html',
    nosotros: 'NCI%20Nosotros.dc.html',
    servicios: 'NCI%20Servicios.dc.html',
    contacto: 'NCI%20Contacto.dc.html',
    wa: 'https://wa.me/'
  };

  const CATS = [
    ['fitting', 'Fitting', 'assets/fitting.png'],
    ['canerias', 'Cañerías', 'assets/canerias.png'],
    ['flanges', 'Flanges y Empaquetaduras', 'assets/flanges.png'],
    ['pernos', 'Pernos, Tuercas y Golillas', 'assets/pernos.png'],
    ['valvulas', 'Válvulas', 'assets/valvulas.png'],
    ['incendio', 'Red Contra Incendio', 'assets/incendio.png'],
    ['chicagos', 'Chicagos', 'assets/chicagos.png'],
    ['camlocks', 'Camlocks', 'assets/camlocks.png'],
    ['storz', 'Storz', 'assets/storz.png'],
    ['abrazaderas', 'Abrazaderas', 'assets/abrazaderas.png'],
    ['hdpe', 'HDPE', 'assets/hdpe.png'],
    ['mangueras', 'Mangueras Espiraladas', 'assets/mangueras.png'],
    ['instrumentacion', 'Instrumentación', 'assets/instrumentacion.png'],
    ['seguridad', 'Seguridad', 'assets/seguridad.png']
  ].map(([key, name, src]) => ({ key, name, src, href: P.categoria + '?cat=' + key }));

  const CAT_DESC = { seguridad: 'Insumos de seguridad y protección personal para faenas industriales y mineras.' };

  const SEG = [
    { id: 'seg-conos', name: 'Conos de seguridad', tipo: 'Señalización vial' },
    { id: 'seg-cintas', name: 'Cintas y elementos reflectantes', tipo: 'Señalización vial' },
    { id: 'seg-barreras', name: 'Barreras New Jersey', tipo: 'Señalización vial' },
    { id: 'seg-lentes', name: 'Lentes de seguridad', tipo: 'Protección visual' },
    { id: 'seg-tapones', name: 'Tapones auditivos', tipo: 'Protección auditiva' },
    { id: 'seg-cascos', name: 'Cascos de seguridad', tipo: 'Protección craneal' }
  ].map(p => ({ ...p, cat: 'Seguridad', catKey: 'seguridad', img: 'assets/seguridad.png' }));

  const RELATED = [
    { id: 'val-compuerta', name: 'Válvula de Compuerta', spec: 'Bronce / Fierro · NPT / Flanges' },
    { id: 'val-mariposa', name: 'Válvula de Mariposa (Wafer/Lug)', spec: 'Hierro dúctil · Wafer / Lug' },
    { id: 'val-ventosa', name: 'Válvula de Ventosa', spec: 'Fierro / Inoxidable · ½"–4"' },
    { id: 'val-retencion', name: 'Válvula de Retención', spec: 'Bronce / WCB · 125–300 LB' }
  ].map(p => ({ ...p, cat: 'Válvulas', catKey: 'valvulas', img: 'assets/valvulas.png' }));

  const PRODUCT = { id: 'val-bola', name: 'Válvula de Bola', cat: 'Válvulas', catKey: 'valvulas', img: 'assets/valvulas.png' };

  const DEMO = [
    { ...PRODUCT, qty: 2 },
    { id: 'fit-codo90', name: 'Codo 90°', cat: 'Fitting', catKey: 'fitting', img: 'assets/fitting.png', qty: 10 },
    { id: 'can-a53', name: 'Cañería Acero Carbono ASTM A-53 SCH40', cat: 'Cañerías', catKey: 'canerias', img: 'assets/canerias.png', qty: 1 }
  ];

  const MED = ['½"', '¾"', '1"', '1½"', '2"', '3"', '4"', '6"', '8"', '10"', '12"', '16"', '20"', '24"'];
  const FAKE = {
    fitting: [['Codo 90°', 'Codos'], ['Codo 45°', 'Codos'], ['Tee recta', 'Tees'], ['Tee reductora', 'Tees'], ['Copla', 'Uniones'], ['Unión americana', 'Uniones'], ['Reducción concéntrica', 'Reducciones'], ['Reducción excéntrica', 'Reducciones'], ['Tapa gorro', 'Tapas']],
    canerias: [['Cañería Acero Carbono ASTM A-53 SCH40', 'Acero carbono'], ['Cañería Acero Carbono SCH80', 'Acero carbono'], ['Cañería Acero Inoxidable 304', 'Acero inoxidable'], ['Cañería Acero Inoxidable 316', 'Acero inoxidable'], ['Cañería Galvanizada', 'Galvanizada'], ['Cañería API 5L', 'Acero carbono']],
    flanges: [['Flange Slip-On', 'Flanges'], ['Flange Welding Neck', 'Flanges'], ['Flange Ciego', 'Flanges'], ['Flange Socket Weld', 'Flanges'], ['Empaquetadura Espirometálica', 'Empaquetaduras'], ['Empaquetadura de Grafito', 'Empaquetaduras']],
    pernos: [['Espárrago B7', 'Pernos'], ['Perno Hexagonal Grado 8', 'Pernos'], ['Tuerca Hexagonal 2H', 'Tuercas'], ['Tuerca de Seguridad', 'Tuercas'], ['Golilla Plana', 'Golillas'], ['Golilla de Presión', 'Golillas']],
    valvulas: [['Válvula de Bola', 'Bola'], ['Válvula de Compuerta', 'Compuerta'], ['Válvula de Mariposa (Wafer/Lug)', 'Mariposa'], ['Válvula de Ventosa', 'Ventosa'], ['Válvula de Retención', 'Retención'], ['Válvula de Globo', 'Globo']],
    incendio: [['Copla Ranurada Rígida', 'Ranurados'], ['Copla Ranurada Flexible', 'Ranurados'], ['Codo Ranurado 90°', 'Ranurados'], ['Rociador Colgante', 'Rociadores'], ['Rociador Montante', 'Rociadores'], ['Válvula de Pie (Siamesa)', 'Válvulas']],
    chicagos: [['Chicago Hembra', 'Terminales'], ['Chicago Macho', 'Terminales'], ['Chicago Espiga Manguera', 'Terminales'], ['Chicago Tapón', 'Accesorios'], ['Chicago Doble', 'Accesorios'], ['Pasador de Seguridad', 'Accesorios']],
    camlocks: [['Camlock Tipo A', 'Macho'], ['Camlock Tipo B', 'Hembra'], ['Camlock Tipo C', 'Hembra'], ['Camlock Tipo D', 'Hembra'], ['Camlock Tipo E', 'Macho'], ['Camlock Tipo F', 'Macho']],
    storz: [['Copla Storz Fija', 'Coplas'], ['Copla Storz Espiga', 'Coplas'], ['Tapa Storz', 'Tapas'], ['Reducción Storz', 'Reducciones'], ['Llave Storz', 'Herramientas'], ['Copla Storz Rosca Hembra', 'Coplas']],
    abrazaderas: [['Abrazadera Sin Fin', 'Sin fin'], ['Abrazadera Doble Oreja', 'Oreja'], ['Abrazadera de Reparación', 'Reparación'], ['Abrazadera Tipo U', 'Tipo U'], ['Abrazadera de Perno', 'Perno'], ['Abrazadera Inoxidable', 'Sin fin']],
    hdpe: [['Tubería HDPE PE100', 'Tuberías'], ['Tubería HDPE PE80', 'Tuberías'], ['Electrofusión Copla', 'Fittings'], ['Codo HDPE Termofusión', 'Fittings'], ['Stub End HDPE', 'Fittings'], ['Tee HDPE', 'Fittings']],
    mangueras: [['Manguera Espiralada PVC', 'Succión'], ['Manguera Succión y Descarga', 'Succión'], ['Manguera para Lodos', 'Minería'], ['Manguera para Aire', 'Aire'], ['Manguera para Agua', 'Agua'], ['Manguera Antiabrasiva', 'Minería']],
    instrumentacion: [['Manómetro Glicerina', 'Presión'], ['Manómetro Inoxidable', 'Presión'], ['Termómetro Bimetálico', 'Temperatura'], ['Transmisor de Presión', 'Presión'], ['Sello Diafragma', 'Accesorios'], ['Válvula Manifold', 'Accesorios']]
  };
  const PRODS = [...SEG, ...CATS.filter(c => FAKE[c.key]).flatMap(c => FAKE[c.key].map(([name, tipo], i) => ({
    id: c.key === 'valvulas' && i === 0 ? PRODUCT.id : c.key === 'fitting' && i === 0 ? 'fit-codo90' : c.key === 'canerias' && i === 0 ? 'can-a53' : c.key + '-' + i,
    name, tipo, cat: c.name, catKey: c.key, img: c.src,
    med: (() => { const a = (i * 3 + c.key.length) % 8; return [a, Math.min(MED.length - 1, a + 2 + (i % 4))]; })()
  })))];

  const KEY = 'nci-quote-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const write = (a, added) => {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('nci-quote', { detail: { list: a, added: added || null } }));
  };
  const quote = {
    get: read,
    count: () => read().length,
    has: id => read().some(i => i.id === id),
    add(item, qty) {
      const a = read(), n = Math.max(1, qty || 1), f = a.find(i => i.id === item.id);
      if (f) f.qty += n; else a.push({ id: item.id, name: item.name, cat: item.cat, catKey: item.catKey, img: item.img || '', qty: n });
      write(a, item.name);
    },
    set(id, qty) { const a = read(), f = a.find(i => i.id === id); if (f) { f.qty = Math.max(1, qty); write(a); } },
    remove(id) { write(read().filter(i => i.id !== id)); },
    clear() { write([]); },
    seed() { if (!read().length) write(DEMO.map(i => ({ ...i }))); }
  };
  window.addEventListener('storage', e => { if (e.key === KEY) window.dispatchEvent(new CustomEvent('nci-quote', { detail: { list: read() } })); });

  function reveal(root) {
    if (!root || typeof IntersectionObserver === 'undefined') return () => {};
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, E = 'cubic-bezier(0, 0, 0.2, 1)';
    const fade = [{ opacity: 0 }, { opacity: 1 }];
    root.querySelectorAll('[data-hero-line]').forEach(el => el.animate(reduce ? fade : [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 700, delay: 120 + (+el.dataset.heroLine) * 120, easing: E, fill: 'both' }));
    root.querySelectorAll('[data-hero-fade]').forEach(el => { const a = el.animate(fade, { duration: 500, delay: 380 + (+el.dataset.heroFade) * 90, easing: E, fill: 'both' }); a.onfinish = () => a.cancel(); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.target._a) { e.target._a.play(); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    root.querySelectorAll('[data-reveal]').forEach(el => {
      if (el._a) return;
      const i = +el.dataset.reveal || 0;
      const a = el.animate(reduce ? fade : [{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 800, delay: i * 80, easing: E, fill: 'both' });
      a.pause(); a.onfinish = () => a.cancel(); el._a = a; io.observe(el);
    });
    return () => io.disconnect();
  }

  function circuit(owner, key, theme) {
    return el => {
      if (el === owner[key + 'El']) return;
      if (owner[key]) { owner[key].destroy(); owner[key] = null; }
      owner[key + 'El'] = el;
      if (el) { const go = () => { if (owner[key + 'El'] !== el) return; if (!window.NCICircuit) return setTimeout(go, 50); owner[key] = window.NCICircuit.mount(el, { theme: theme || 'dark' }); }; go(); }
    };
  }

  window.NCI = { IC, ico, P, CATS, CAT_DESC, PRODS, MED, SEG, RELATED, PRODUCT, quote, reveal, circuit };
  window.dispatchEvent(new Event('nci-ready'));
})();
