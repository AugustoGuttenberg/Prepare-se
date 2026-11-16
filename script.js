(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // localStorage com proteção (pode estar bloqueado)
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignora */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* ignora */ }
    }
  };

  const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- menu mobile ---------- */
  const menuBtn = $('#menuBtn');
  const nav = $('#mainNav');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- linguagem simples e modo discreto ---------- */
  const simpleBtn = $('#simpleBtn');
  simpleBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('simple');
    simpleBtn.setAttribute('aria-pressed', String(on));
  });

  const discreetBtn = $('#discreetBtn');
  const brand = $('#brand');
  const originalBrand = brand.innerHTML;
  const originalTitle = document.title;
  discreetBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('discreet');
    discreetBtn.setAttribute('aria-pressed', String(on));
    brand.innerHTML = on ? 'Saúde &amp; Bem-estar' : originalBrand;
    document.title = on ? 'Saúde e bem-estar' : originalTitle;
  });

  /* ---------- "Não sei por onde começar" ---------- */
  const paths = {
    entender: {
      title: 'Quero entender o que é PrEP',
      text: 'A PrEP é uma estratégia de prevenção do HIV usada antes de possíveis exposições, com avaliação e acompanhamento profissional.',
      links: [['#prep', 'Conhecer a PrEP'], ['#prep-pep', 'Diferença entre PrEP e PEP']]
    },
    exposicao: {
      urgent: true,
      title: 'Procure atendimento agora',
      text: 'Se houve uma possível exposição ao HIV, procure imediatamente um serviço de saúde ou pronto atendimento para avaliar a PEP. Ela deve ser iniciada o mais rápido possível, em até 72 horas. Não espere por sintomas e não perca tempo com questionários.',
      links: [['#servicos', 'Como encontrar atendimento'], ['#prep-pep', 'Entender a PEP']]
    },
    teste: {
      title: 'Quero fazer um teste de HIV',
      text: 'Unidades de saúde e serviços de testagem podem orientar e realizar o teste. Confirme horários e se é preciso agendamento antes de ir.',
      links: [['#servicos', 'Onde encontrar atendimento']]
    },
    usuario: {
      title: 'Já utilizo PrEP',
      text: 'Organize dúvidas, consultas e exames para conversar com a equipe de saúde. Dúvidas sobre doses esquecidas devem ser esclarecidas com a equipe, conforme a modalidade que você usa.',
      links: [['#orientacao', 'Esqueci minha dose'], ['#meu-cuidado', 'Preparar minha consulta']]
    },
    vergonha: {
      title: 'Tenho vergonha ou medo',
      text: 'Isso é mais comum do que parece. Você pode começar dizendo apenas que quer conversar sobre prevenção do HIV. O atendimento deve ser respeitoso, sigiloso e sem discriminação.',
      links: [['#acolhimento', 'Ver conversas sem julgamento'], ['#meu-cuidado', 'Preparar minha primeira consulta']]
    },
    aprender: {
      title: 'Quero aprender mais',
      text: 'Explore mitos e verdades, faça o teste rápido e siga o desafio de 7 dias.',
      links: [['#aprenda', 'Ir para Aprenda']]
    }
  };

  const startResult = $('#startResult');
  $$('#startChoices .choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#startChoices .choice').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const p = paths[btn.dataset.key];
      startResult.innerHTML =
        `<span class="tag">Seu caminho</span><h3>${p.title}</h3><p>${p.text}</p>` +
        (p.urgent ? '<div class="urgent" role="alert"><strong>Atenção:</strong> o tempo importa. Em dúvida sobre onde ir, o Disque Saúde (136) pode orientar.</div>' : '') +
        `<div class="row">${p.links.map(([href, label]) => `<a class="btn small" href="${href}">${label}</a>`).join('')}</div>`;
    });
  });

  /* ---------- autoavaliação educativa (não diagnostica) ---------- */
  const selfQuestions = [
    { q: 'Você já ouviu falar sobre PrEP?', a: ['Sim', 'Não'] },
    { q: 'Conhece as formas de prevenção do HIV?', a: ['Conheço algumas', 'Quase nenhuma'] },
    { q: 'Gostaria de entender se a PrEP pode fazer sentido para a sua realidade?', a: ['Sim', 'Ainda não sei'] },
    { q: 'Tem dificuldade para encontrar atendimento?', a: ['Sim', 'Não'] }
  ];
  const selfBox = $('#selfCheck');
  let selfStep = 0;
  let selfAnswers = [];

  function renderSelf() {
    if (selfStep >= selfQuestions.length) {
      const hardAccess = selfAnswers[3] === 'Sim';
      const wantsInfo = selfAnswers[2] === 'Sim' || selfAnswers[2] === 'Ainda não sei';
      selfBox.innerHTML =
        '<div class="result"><strong>Próximos passos sugeridos</strong><ul>' +
        '<li>Conversar com um profissional de saúde é a melhor forma de saber se a PrEP é uma opção para você.</li>' +
        (wantsInfo ? '<li>Leia a seção <a href="#prep-pep">PrEP ou PEP?</a> e prepare suas perguntas em <a href="#meu-cuidado">Meu cuidado</a>.</li>' : '') +
        (hardAccess ? '<li>Veja <a href="#servicos">onde encontrar atendimento</a> e confirme horários antes de ir.</li>' : '') +
        '<li>Se houve uma possível exposição recente, procure atendimento imediatamente (PEP, em até 72 horas).</li>' +
        '</ul><p class="privacy" style="margin:0">Este resultado é apenas educativo: não indica nem descarta o uso de PrEP.</p></div>' +
        '<button class="btn small outline" id="scRestart" style="margin-top:12px">Refazer</button>';
      $('#scRestart').addEventListener('click', () => { selfStep = 0; selfAnswers = []; renderSelf(); });
      return;
    }
    const item = selfQuestions[selfStep];
    selfBox.innerHTML =
      `<p class="sc-step">Pergunta ${selfStep + 1} de ${selfQuestions.length}</p>` +
      `<p class="sc-q">${item.q}</p><div class="sc-opts">` +
      item.a.map((opt) => `<button class="chip" data-opt="${escapeHTML(opt)}">${opt}</button>`).join('') + '</div>';
    $$('.sc-opts .chip', selfBox).forEach((b) => b.addEventListener('click', () => {
      selfAnswers.push(b.dataset.opt);
      selfStep++;
      renderSelf();
    }));
  }
  renderSelf();

  /* ---------- Meu cuidado (dados apenas neste aparelho) ---------- */
  const NOTES_KEY = 'prepare-se:notas';
  const DATE_KEY = 'prepare-se:data';
  const noteList = $('#noteList');
  const noteInput = $('#duvida');
  const dateInput = $('#nextDate');
  const dateInfo = $('#nextDateInfo');

  function renderNotes() {
    const notes = store.get(NOTES_KEY, []);
    noteList.innerHTML = notes.map((n, i) =>
      `<li><span>${escapeHTML(n)}</span><button data-i="${i}" aria-label="Remover anotação"><svg class="ic" aria-hidden="true"><use href="#i-x"/></svg></button></li>`).join('');
    $$('button', noteList).forEach((b) => b.addEventListener('click', () => {
      const list = store.get(NOTES_KEY, []);
      list.splice(Number(b.dataset.i), 1);
      store.set(NOTES_KEY, list);
      renderNotes();
    }));
  }

  function renderDate() {
    const v = dateInput.value;
    if (!v) { dateInfo.textContent = ''; return; }
    const target = new Date(v + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    dateInfo.textContent = diff > 0 ? `Faltam ${diff} dia(s).` : diff === 0 ? 'É hoje!' : 'Essa data já passou.';
  }

  $('#saveNote').addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
      const list = store.get(NOTES_KEY, []);
      list.push(text.slice(0, 300));
      store.set(NOTES_KEY, list);
      noteInput.value = '';
      renderNotes();
    }
    if (dateInput.value) store.set(DATE_KEY, dateInput.value);
  });
  $('#clearNote').addEventListener('click', () => {
    store.remove(NOTES_KEY); store.remove(DATE_KEY);
    noteInput.value = ''; dateInput.value = '';
    renderNotes(); renderDate();
  });
  dateInput.addEventListener('change', renderDate);
  dateInput.value = store.get(DATE_KEY, '');
  renderNotes(); renderDate();

  /* ---------- serviços e mapa ----------
     Dados reunidos em 16/11/2026. Endereços e telefones das UPAs: Carta de Serviços da SES-PE.
     Policlínicas: lista de testagem rápida da Prefeitura do Recife, Folha de Pernambuco (SAE) e Cidadão Recifense.
     lat/lng são APROXIMADOS. Para corrigir, clique com o botão direito no local no Google Maps,
     copie as coordenadas e cole aqui. Sem lat/lng, o serviço aparece só na lista. */
  const SERVICES = [
    // UPAs
    { id: 'upa-torroes', tipo: 'upa', nome: 'UPA Torrões', municipio: 'Recife', bairro: 'Torrões', endereco: 'Av. Abdias de Carvalho, 30', telefone: '(81) 3184-4440', lat: -8.0585, lng: -34.9480 },
    { id: 'upa-caxanga', tipo: 'upa', nome: 'UPA Caxangá', municipio: 'Recife', bairro: 'Várzea', endereco: 'Av. Caxangá, s/n (em frente ao nº 40 da Rua Ribeiro Pessoa)', telefone: '(81) 3184-4366', lat: -8.0385, lng: -34.9525 },
    { id: 'upa-imbiribeira', tipo: 'upa', nome: 'UPA Imbiribeira', municipio: 'Recife', bairro: 'Imbiribeira', endereco: 'Av. Mascarenhas de Morais, 4.223', telefone: '(81) 3184-4328', lat: -8.1095, lng: -34.9120 },
    { id: 'upa-ibura', tipo: 'upa', nome: 'UPA Ibura', municipio: 'Recife', bairro: 'Ibura', endereco: 'Rua Vale do Itajaí, s/n', telefone: '(81) 3184-4595', lat: -8.1280, lng: -34.9480 },
    { id: 'upa-nova-descoberta', tipo: 'upa', nome: 'UPA Nova Descoberta', municipio: 'Recife', bairro: 'Brejo da Guabiraba', endereco: 'Av. Vereador Otacílio de Azevedo, s/n', telefone: '(81) 3184-4568' },
    { id: 'upa-curado', tipo: 'upa', nome: 'UPA Curado', municipio: 'Jaboatão dos Guararapes', bairro: 'Curado', endereco: 'Av. Leonardo da Vinci, 68', telefone: '(81) 3184-4467', lat: -8.0905, lng: -34.9745 },
    { id: 'upa-barra-jangada', tipo: 'upa', nome: 'UPA Barra de Jangada', municipio: 'Jaboatão dos Guararapes', bairro: 'Barra de Jangada', endereco: 'Rua Cruz Alta, s/n (em frente à estação de tratamento da Compesa)', telefone: '(81) 3184-4495', lat: -8.2370, lng: -34.9350 },
    { id: 'upa-engenho-velho', tipo: 'upa', nome: 'UPA Engenho Velho', municipio: 'Jaboatão dos Guararapes', endereco: 'Av. General Manoel Rabelo, s/n (esquina com a Estrada do Eixo da Integração)', telefone: '(81) 3184-4520' },
    { id: 'upa-olinda', tipo: 'upa', nome: 'UPA Olinda', municipio: 'Olinda', bairro: 'Cidade Tabajara', endereco: 'Rodovia PE-15 (Av. Joaquim Nabuco), s/n', telefone: '(81) 3184-4303', lat: -7.9985, lng: -34.8545 },
    { id: 'upa-paulista', tipo: 'upa', nome: 'UPA Paulista', municipio: 'Paulista', bairro: 'Aurora Jardim Paulista', endereco: 'Estrada do Frio, 10.000', telefone: '(81) 3184-4255', lat: -7.9360, lng: -34.8610 },
    { id: 'upa-sao-lourenco', tipo: 'upa', nome: 'UPA São Lourenço da Mata', municipio: 'São Lourenço da Mata', bairro: 'Pixete', endereco: 'Av. Dr. Francisco Correia, 2009', telefone: '(81) 3184-4378', lat: -8.0015, lng: -35.0110 },
    { id: 'upa-igarassu', tipo: 'upa', nome: 'UPA Igarassu', municipio: 'Igarassu', bairro: 'Rubina', endereco: 'Rodovia BR-101 Norte, km 47, s/n', telefone: '(81) 3184-4280' },
    { id: 'upa-cabo', tipo: 'upa', nome: 'UPA Cabo de Santo Agostinho', municipio: 'Cabo de Santo Agostinho', bairro: 'COHAB', endereco: 'Rua 27, s/n' },

    // Policlínicas do Recife
    { id: 'pol-albert-sabin', tipo: 'policlinica', sae: true, nome: 'Policlínica Albert Sabin', municipio: 'Recife', bairro: 'Tamarineira',
      nota: 'Abriga o SAE Josefa Severina da Conceição, inaugurado em 23/12/2025: segunda a sexta, das 8h às 17h, por demanda espontânea. Segundo a Folha de Pernambuco, oferece PrEP a residentes do Recife com 16 anos ou mais. Confirme antes de ir.', lat: -8.0355, lng: -34.9010 },
    { id: 'pol-waldemar', tipo: 'policlinica', sae: true, nome: 'Policlínica Waldemar de Oliveira', municipio: 'Recife', bairro: 'Santo Amaro', endereco: 'Rua do Pombal, 115',
      nota: 'Abriga temporariamente a Policlínica Gouveia de Barros, que tem dois SAE (um deles pediátrico). Testagem rápida de HIV e sífilis.', lat: -8.0550, lng: -34.8830 },
    { id: 'pol-lessa', tipo: 'policlinica', sae: true, nome: 'Policlínica Lessa de Andrade', municipio: 'Recife', bairro: 'Madalena', endereco: 'Estrada dos Remédios, 2416', telefone: '(81) 3355-7826',
      nota: 'Tem SAE. Testagem rápida de HIV e sífilis.', lat: -8.0495, lng: -34.9085 },
    { id: 'pol-centro', tipo: 'policlinica', nome: 'Policlínica Centro', municipio: 'Recife', bairro: 'Boa Vista',
      nota: 'Testagem rápida de HIV e sífilis. Endereço não verificado: use o botão do Google Maps e confirme por telefone.', lat: -8.0588, lng: -34.8880 },
    { id: 'pol-salomao-kelner', tipo: 'policlinica', nome: 'Policlínica Salomão Kelner', municipio: 'Recife', bairro: 'Água Fria',
      nota: 'Testagem rápida de HIV e sífilis. Endereço não verificado: use o botão do Google Maps e confirme por telefone.', lat: -8.0200, lng: -34.8920 },
    { id: 'pol-clementino-fraga', tipo: 'policlinica', nome: 'Policlínica Clementino Fraga', municipio: 'Recife', bairro: 'Casa Amarela',
      nota: 'Testagem rápida de HIV e sífilis. Endereço não verificado: use o botão do Google Maps e confirme por telefone.', lat: -8.0270, lng: -34.9075 }
  ];

  // Serviços de PrEP/PEP do Portal Conecta Recife. "confirmado" = data da última confirmação.
  const fix = (id, o) => Object.assign(SERVICES.find((s) => s.id === id), o);
  fix('pol-albert-sabin', { endereco: 'Rua Padre Roma, 149' });
  fix('pol-salomao-kelner', { endereco: 'Estrada Velha de Água Fria' });
  [['pol-barros-lima', 'Policlínica Barros Lima', 'Casa Amarela', 'Avenida Norte Miguel Arraes de Alencar, 6465'],
   ['pol-arnaldo-marques', 'Policlínica Arnaldo Marques', 'Ibura', 'Avenida Dois Rios, s/n'],
   ['pol-agamenon', 'Policlínica Agamenon Magalhães', 'Afogados', 'Avenida Sul, s/n'],
   ['pol-amaury-coutinho', 'Policlínica Amaury Coutinho', 'Campina do Barreto', 'Rua Iguatu, s/n']]
    .forEach(([id, nome, bairro, endereco]) => SERVICES.push({ id, tipo: 'policlinica', nome, municipio: 'Recife', bairro, endereco }));
  const OFERTA = { 'pol-albert-sabin': ['prep', 'teste'], 'pol-waldemar': ['prep', 'teste'], 'pol-lessa': ['prep', 'teste'], 'pol-salomao-kelner': ['prep', 'teste'],
    'pol-centro': ['teste'], 'pol-clementino-fraga': ['teste'], 'pol-barros-lima': ['pep'], 'pol-arnaldo-marques': ['pep'], 'pol-agamenon': ['pep'], 'pol-amaury-coutinho': ['pep'] };
  const OV_KEY = 'prepare-se:servicos';
  const overrides = store.get(OV_KEY, {});
  SERVICES.forEach((s) => {
    s.ofertas = (OFERTA[s.id] || []).concat(s.sae ? ['sae'] : [], s.tipo === 'upa' ? ['upa'] : []);
    if ((OFERTA[s.id] || []).some((o) => o === 'prep' || o === 'pep')) s.fonte = 'Portal Conecta Recife';
    Object.assign(s, overrides[s.id] || {});
  });
  const OFERTA_LABEL = { prep: 'PrEP', pep: 'PEP', teste: 'Testagem rápida' };

  const UPA_NOTE = 'Atendimento de urgência e emergência, em geral 24 horas. Em caso de possível exposição ao HIV, vá o quanto antes e diga que busca avaliação para PEP (até 72 horas). Confirme o funcionamento por telefone.';
  const icon = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const mapsLink = (s) => 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent([s.nome, s.endereco || s.bairro, s.municipio, 'PE'].filter(Boolean).join(', '));

  let currentFilter = 'todos';
  let map = null;
  let layer = null;
  const markers = {};
  const serviceBox = $('#serviceList');
  const mapBox = $('#map');

  const visibleServices = () => SERVICES.filter((s) =>
    currentFilter === 'todos' || (s.ofertas || []).includes(currentFilter));

  function detailsHTML(s, withMapBtn) {
    const place = [s.endereco, s.bairro, s.municipio].filter(Boolean).map(escapeHTML).join(' • ');
    const tags = `<span class="${s.tipo === 'upa' ? 't-upa' : ''}">${s.tipo === 'upa' ? 'UPA' : 'Policlínica'}</span>` +
      (s.sae ? '<span class="t-sae">SAE</span>' : '') +
      (s.ofertas || []).filter((o) => OFERTA_LABEL[o]).map((o) => `<span>${OFERTA_LABEL[o]}</span>`).join('');
    const note = s.nota || (s.tipo === 'upa' ? UPA_NOTE : '');
    return `<div class="svc"><h4>${escapeHTML(s.nome)}</h4><div class="tags">${tags}</div>` +
      `<p>${place}</p>` +
      (s.telefone ? `<p>${icon('phone')} ${escapeHTML(s.telefone)}</p>` : '') +
      (s.horario ? `<p>${icon('clock')} ${escapeHTML(s.horario)}</p>` : '') +
      (note ? `<p>${escapeHTML(note)}</p>` : '') +
      (s.fonte ? `<p class="privacy" style="margin:4px 0">Fonte: ${escapeHTML(s.fonte)}. Última confirmação: ${escapeHTML(s.confirmado || 'ainda não confirmada')}.</p>` : '') +
      `<div class="links">` + (withMapBtn ? `<button type="button" data-edit="${s.id}">Atualizar dados</button>` : '') +
      (withMapBtn && s.lat ? `<button type="button" data-focus="${s.id}">${icon('pin')} Ver no mapa</button>` : '') +
      (withMapBtn && !s.lat ? '<span class="privacy" style="margin:0">Sem ponto no mapa</span>' : '') +
      `<a href="${mapsLink(s)}" target="_blank" rel="noopener">${icon('external')} Abrir no Google Maps</a></div></div>`;
  }

  function pinFor(s) {
    const cls = s.tipo === 'upa' ? 'pin-upa' : (s.sae ? 'pin-sae' : 'pin-pol');
    return L.divIcon({ className: 'pin ' + cls, html: '<span></span>', iconSize: [26, 32], iconAnchor: [13, 31], popupAnchor: [0, -28] });
  }

  function renderMarkers() {
    if (!map) return;
    layer.clearLayers();
    const pts = [];
    visibleServices().forEach((s) => {
      if (typeof s.lat !== 'number') return;
      const m = L.marker([s.lat, s.lng], { icon: pinFor(s), title: s.nome, alt: s.nome, keyboard: true });
      m.bindPopup(detailsHTML(s, false), { maxWidth: 290 });
      markers[s.id] = m;
      layer.addLayer(m);
      pts.push([s.lat, s.lng]);
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 14 });
  }

  function initMap() {
    if (!window.L) {
      mapBox.innerHTML = '<div class="empty"><strong>Não foi possível carregar o mapa.</strong> Verifique sua conexão ou use a aba Lista, que traz os mesmos serviços e links para o Google Maps.</div>';
      return;
    }
    map = L.map(mapBox, { scrollWheelZoom: false, maxZoom: 18 }).setView([-8.06, -34.92], 11);
    // Mapa de ruas padrão da Esri (sem chave de API; funciona também com o arquivo aberto direto no computador).
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap contributors'
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    // evita que a roda do mouse "sequestre" a rolagem da página
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
    renderMarkers();
  }

  function renderServices() {
    const list = visibleServices();
    serviceBox.innerHTML = list.length
      ? list.map((s) => `<div class="service">${detailsHTML(s, true)}</div>`).join('')
      : '<div class="empty">Nenhum serviço encontrado para este filtro.</div>';
    $$('[data-edit]', serviceBox).forEach((b) => b.addEventListener('click', () => {
      const s = SERVICES.find((x) => x.id === b.dataset.edit);
      const tel = prompt('Telefone confirmado:', s.telefone || ''); if (tel === null) return;
      const hor = prompt('Horário de funcionamento:', s.horario || ''); if (hor === null) return;
      const ov = store.get(OV_KEY, {});
      ov[s.id] = { telefone: tel.trim(), horario: hor.trim(), confirmado: new Date().toLocaleDateString('pt-BR') };
      Object.assign(s, ov[s.id]); store.set(OV_KEY, ov); renderServices();
    }));
    $$('[data-focus]', serviceBox).forEach((b) => b.addEventListener('click', () => focusService(b.dataset.focus)));
  }

  function showTab(name) {
    const isMap = name === 'map';
    $('#tabMap').setAttribute('aria-selected', String(isMap));
    $('#tabList').setAttribute('aria-selected', String(!isMap));
    $('#tabMap').tabIndex = isMap ? 0 : -1;
    $('#tabList').tabIndex = isMap ? -1 : 0;
    $('#mapView').hidden = !isMap;
    $('#listView').hidden = isMap;
    if (isMap && map) setTimeout(() => map.invalidateSize(), 0);
  }

  function focusService(id) {
    const m = markers[id];
    if (!m || !map) return;
    showTab('map');
    mapBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { map.setView(m.getLatLng(), 15); m.openPopup(); }, 250);
  }

  $('#tabMap').addEventListener('click', () => showTab('map'));
  $('#tabList').addEventListener('click', () => showTab('list'));
  $$('.tabs button').forEach((b) => b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const next = b.id === 'tabMap' ? 'list' : 'map';
      showTab(next);
      $(next === 'map' ? '#tabMap' : '#tabList').focus();
    }
  }));
  $$('.filters .chip').forEach((b) => b.addEventListener('click', () => {
    $$('.filters .chip').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    currentFilter = b.dataset.filter;
    renderServices();
    renderMarkers();
  }));

  initMap();
  renderServices();

  /* ---------- mitos e verdades ---------- */
  const myths = [
    { q: 'A PrEP protege contra todas as ISTs.', truth: false, exp: 'Mito. A PrEP previne o HIV, mas não outras ISTs. A prevenção combinada pode incluir preservativos, testagem, vacinação e acompanhamento.' },
    { q: 'Só pessoas LGBTQIA+ podem usar PrEP.', truth: false, exp: 'Mito. A avaliação considera a situação, as necessidades e o contexto de cada pessoa, sem julgamento.' },
    { q: 'Quem usa PrEP não precisa fazer exames.', truth: false, exp: 'Mito. A testagem e o acompanhamento periódico fazem parte do cuidado preventivo.' },
    { q: 'Uma pessoa vivendo com HIV pode ter uma vida saudável.', truth: true, exp: 'Verdade. Com tratamento e acompanhamento adequados, é possível cuidar da saúde e ter qualidade de vida.' },
    { q: 'Preciso ter vergonha de procurar atendimento.', truth: false, exp: 'Mito. Buscar informação e cuidado é um direito. O atendimento deve ser acolhedor, respeitoso e sigiloso.' }
  ];
  const mythBox = $('#mythList');
  myths.forEach((m) => {
    const el = document.createElement('div');
    el.className = 'myth';
    el.innerHTML = `<p class="q">${m.q}</p><div class="opts"><button data-v="true">Verdade</button><button data-v="false">Mito</button></div><div class="exp-slot" aria-live="polite"></div>`;
    $$('button', el).forEach((b) => b.addEventListener('click', () => {
      const hit = (b.dataset.v === 'true') === m.truth;
      $('.exp-slot', el).innerHTML = `<p class="exp ${hit ? 'ok' : 'no'}">${hit ? '<svg class="ic" aria-hidden="true"><use href="#i-check"/></svg> Você acertou! ' : '<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg> Quase! '}${m.exp}</p>`;
    }));
    mythBox.appendChild(el);
  });

  /* ---------- quiz ---------- */
  const quizResult = $('#quizResult');
  $$('#quiz button').forEach((btn) => btn.addEventListener('click', () => {
    $$('#quiz button').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizResult.textContent = btn.dataset.correct === 'true'
      ? 'Isso mesmo! A PrEP é uma estratégia utilizada antes de possíveis exposições, com avaliação e acompanhamento profissional.'
      : 'Não é essa. A PrEP é utilizada antes de possíveis exposições. A PEP é a estratégia de urgência após uma possível exposição.';
  }));

  /* ---------- desafio de 7 dias ---------- */
  const days = [
    'Leia o que é HIV e como ele é transmitido, em fontes oficiais.',
    'Entenda o que é prevenção combinada.',
    'Descubra a diferença entre PrEP e PEP.',
    'Aprenda por que a testagem é importante.',
    'Conheça mitos e verdades sobre HIV e ISTs.',
    'Reflita sobre estigma e como combater o preconceito.',
    'Anote suas dúvidas e pesquise onde buscar atendimento.'
  ];
  const CH_KEY = 'prepare-se:desafio';
  const challengeBox = $('#challenge');
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');

  function updateProgress() {
    const done = $$('input:checked', challengeBox).length;
    progressBar.style.width = (done / days.length * 100) + '%';
    progressText.textContent = `${done} de ${days.length} dias concluídos.` + (done === days.length ? ' Parabéns pela jornada!' : '');
  }

  const saved = store.get(CH_KEY, []);
  days.forEach((txt, i) => {
    const card = document.createElement('div');
    card.className = 'card day';
    card.innerHTML = `<label><input type="checkbox" ${saved.includes(i) ? 'checked' : ''}><span><b>Dia ${i + 1}</b>${txt}</span></label>`;
    const cb = $('input', card);
    card.classList.toggle('done', cb.checked);
    cb.addEventListener('change', () => {
      card.classList.toggle('done', cb.checked);
      const marked = $$('.day input', challengeBox).map((c, idx) => (c.checked ? idx : null)).filter((v) => v !== null);
      store.set(CH_KEY, marked);
      updateProgress();
    });
    challengeBox.appendChild(card);
  });
  updateProgress();

  /* ---------- FAQ de acolhimento ---------- */
  const faq = [
    ['Tenho vergonha de procurar PrEP. O que faço?', 'Você pode começar dizendo apenas que gostaria de conversar sobre prevenção do HIV. A equipe de saúde pode explicar as opções e avaliar suas necessidades. Você merece ser atendido com respeito.'],
    ['Preciso contar a alguém que uso PrEP?', 'Não. Contar ou não é uma decisão sua. O atendimento de saúde deve ser sigiloso.'],
    ['Posso usar PrEP em um relacionamento?', 'Sim, a avaliação considera o contexto de cada pessoa. Converse com um profissional sobre o que faz sentido para você.'],
    ['A PrEP pode causar efeitos colaterais?', 'Alguns medicamentos podem causar efeitos em algumas pessoas. Por isso o acompanhamento é importante: a equipe de saúde explica o que esperar e como agir.'],
    ['Como conversar com meu parceiro sobre prevenção?', 'Escolha um momento tranquilo, fale de cuidado e não de acusação, e use “eu” (“eu me sinto mais seguro quando…”). Testagem e prevenção combinada podem ser decididas em conjunto.']
  ];
  $('#faq').innerHTML = faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  /* ---------- caixa de perguntas anônimas (protótipo: não envia) ---------- */
  $('#askForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#ask').value = '';
    $('#askMsg').textContent = 'Obrigado! Neste protótipo a pergunta não foi enviada nem armazenada. Na versão publicada, ela seria moderada e respondida com revisão de profissionais de saúde.';
  });
  /* ===== PREPARE-SE: cuidado farmacêutico ===== */
  const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  /* Biblioteca de medicamentos */
  const FICHAS = [
    { t: 'Tenofovir desoproxila (TDF) 300 mg + Entricitabina (FTC) 200 mg: PrEP oral', open: true, d: [
      ['Princípios ativos e nomes comerciais', 'Fumarato de tenofovir desoproxila + entricitabina, em comprimido de dose fixa. Distribuído pelo SUS; existem também apresentações comerciais (ex.: Truvada®) e genéricas.'],
      ['Classe farmacológica', 'Inibidores nucleosídeo/nucleotídeo da transcriptase reversa (ITRN/ITRNt).'],
      ['Mecanismo de ação', 'Após fosforilação dentro da célula, TDF e FTC competem com nucleotídeos naturais e interrompem a síntese do DNA viral pela transcriptase reversa do HIV, dificultando o estabelecimento da infecção.'],
      ['Indicações e modalidades', 'Prevenção do HIV, conforme avaliação profissional. O protocolo do Ministério da Saúde descreve o uso diário e, em situações específicas, o uso sob demanda. A modalidade é definida pela equipe de saúde.'],
      ['Via de administração', 'Oral, com ou sem alimentos, preferencialmente no mesmo horário.'],
      ['Possíveis efeitos adversos', 'Náuseas, diarreia, dor abdominal, dor de cabeça e fadiga, geralmente leves e no início do uso. Mais raros: alteração da função renal e redução da densidade mineral óssea.'],
      ['Contraindicações e precauções', 'Teste de HIV reagente ou suspeita de infecção aguda; função renal abaixo do critério do protocolo; hipersensibilidade aos componentes. Precaução em doença óssea e em hepatite B (a suspensão pode causar exacerbação da hepatite).'],
      ['Interações medicamentosas', 'Medicamentos nefrotóxicos ou que competem pela secreção tubular renal. Use a consulta de interações da Central de orientação.'],
      ['Metabolismo e eliminação', 'Sem metabolização relevante pelo CYP450. Eliminação principalmente renal (filtração e secreção tubular), por isso a função renal é monitorada.'],
      ['Cuidados farmacêuticos', 'Reforçar adesão e horário; revisar todos os medicamentos, suplementos e fitoterápicos; orientar sobre efeitos iniciais; lembrar testagem periódica; não interromper sem orientação.']] },
    { t: 'PrEP injetável (cabotegravir de longa ação): confira a disponibilidade', d: [
      ['Situação', 'Cabotegravir de ação prolongada é uma modalidade de PrEP descrita em diretrizes internacionais. <strong>Antes de orientar qualquer pessoa, confirme no Ministério da Saúde e na Anvisa o registro e a disponibilidade atuais no Brasil.</strong> Este app não afirma que ela esteja disponível na rede pública.'],
      ['Classe e mecanismo', 'Inibidor da integrase: bloqueia a integração do DNA viral ao genoma da célula.'],
      ['Observação', 'Esquema, monitoramento e acompanhamento próprios, definidos por serviço de saúde.']] }
  ];
  $('#medList').innerHTML = FICHAS.map((f) => `<details${f.open ? ' open' : ''}><summary>${f.t}</summary>${f.d.map(([k, v]) => `<p><b>${k}:</b> ${v}</p>`).join('')}</details>`).join('');

  /* Central de orientação */
  const ORI = {
    'Esqueci de tomar meu medicamento': ['O que fazer depende da modalidade (diária ou sob demanda) e do tempo desde a última dose.', 'Não tome comprimidos extras por conta própria para “compensar”.', 'Fale com o serviço que acompanha você ou com um farmacêutico; se for recorrente, peça estratégias para lembrar.'],
    'Esqueci vários dias': ['A proteção pode ficar reduzida. Reinício e novo teste de HIV dependem do tempo de pausa e de exposições recentes, e são decididos pela equipe.', 'Procure o serviço o quanto antes. Se houve possível exposição nas últimas 72 horas, procure atendimento para PEP imediatamente (Disque Saúde 136).'],
    'Quero interromper a PrEP': ['Converse com a equipe antes: a interrupção costuma ser planejada, com orientação sobre o período após a última exposição e avaliação (incluindo teste de HIV e hepatite B).', 'Não suspenda por conta própria.'],
    'Estou sentindo algum efeito adverso': ['Muitos efeitos iniciais são leves e transitórios. Veja o guia de efeitos adversos nesta seção.', 'Registre em “Minha adesão e meus sintomas” e relate à equipe. Sinais de alerta exigem avaliação médica.'],
    'Utilizo outros medicamentos': ['Informe à equipe todos os medicamentos, incluindo anti-inflamatórios, antivirais, suplementos, fitoterápicos e hormônios.', 'Use a consulta de interações como apoio e confirme com o farmacêutico.'],
    'Tenho dúvidas sobre interações': ['Pesquise o medicamento na consulta de interações. Se ele não aparecer, isso não indica segurança: peça orientação farmacêutica.']
  };
  const orBox = $('#orChoices');
  Object.keys(ORI).forEach((k) => {
    const b = document.createElement('button'); b.className = 'choice'; b.textContent = k;
    b.addEventListener('click', () => {
      $$('.choice', orBox).forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
      $('#orResult').innerHTML = `<span class="tag">Orientação educativa</span><h3>${k}</h3>${ORI[k].map((p) => `<p>${p}</p>`).join('')}<p class="privacy">Baseado nos princípios dos protocolos do Ministério da Saúde. Não substitui avaliação profissional.</p>`;
    });
    orBox.appendChild(b);
  });

  /* Interações */
  const IX = [
    { n: ['ibuprofeno', 'diclofenaco', 'naproxeno', 'cetoprofeno', 'nimesulida', 'anti-inflamatório'], w: 1, r: 'Atenção: monitorar função renal', m: 'AINEs podem reduzir o fluxo sanguíneo renal; somados ao tenofovir (eliminação renal), podem elevar o risco de lesão renal, sobretudo com uso frequente ou desidratação.', p: 'Evite uso frequente sem orientação, mantenha hidratação e informe a equipe.' },
    { n: ['aciclovir', 'valaciclovir', 'ganciclovir', 'valganciclovir'], w: 1, r: 'Atenção: monitorar função renal', m: 'Competição pela secreção tubular renal pode aumentar as concentrações de ambos os fármacos.', p: 'Pode ser necessário acompanhar a creatinina. Consulte o farmacêutico.' },
    { n: ['gentamicina', 'amicacina', 'tobramicina', 'vancomicina', 'anfotericina', 'colistina'], w: 1, r: 'Atenção: efeito nefrotóxico somado', m: 'Fármacos nefrotóxicos somam risco renal ao do tenofovir.', p: 'Geralmente usados em ambiente hospitalar: informe que usa PrEP.' },
    { n: ['sofosbuvir', 'ledipasvir', 'velpatasvir'], w: 1, r: 'Atenção: exposição ao tenofovir pode aumentar', m: 'Algumas associações para hepatite C aumentam a exposição ao tenofovir.', p: 'Requer avaliação especializada e monitoramento renal.' },
    { n: ['lamivudina', 'emtricitabina', 'entricitabina', 'tenofovir'], w: 1, r: 'Duplicidade terapêutica', m: 'Mesma classe ou mesmo componente da PrEP: o uso conjunto gera duplicidade.', p: 'Não associe sem orientação do serviço.' },
    { n: ['didanosina'], w: 1, r: 'Associação a evitar', m: 'O tenofovir pode aumentar a exposição à didanosina e seus efeitos adversos.', p: 'Consulte o médico.' },
    { n: ['paracetamol', 'dipirona'], r: 'Sem interação farmacocinética relevante estabelecida', m: 'Não há interação clinicamente relevante bem estabelecida com TDF/FTC no uso habitual.', p: 'Respeite as doses e informe se houver doença renal ou hepática.' }
  ];
  $('#ixList').innerHTML = IX.flatMap((x) => x.n).map((n) => `<option value="${n}">`).join('');
  $('#ixQ').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase(); const out = $('#ixOut');
    if (q.length < 3) { out.innerHTML = ''; return; }
    const x = IX.find((i) => i.n.some((n) => n.includes(q) || q.includes(n)));
    out.innerHTML = x
      ? `<div class="out${x.w ? ' warn' : ''}"><strong>${x.r}</strong><p><b>Mecanismo:</b> ${x.m}</p><p><b>Precauções:</b> ${x.p}</p><p class="privacy">Referências: bula e resumo de características de TDF/FTC. Confirme com o farmacêutico.</p></div>`
      : `<div class="out warn"><p>“${escapeHTML(q)}” não está na base deste app. Isso <strong>não indica</strong> segurança: consulte a bula, um farmacêutico ou o serviço de saúde.</p></div>`;
  });

  /* Efeitos adversos */
  const SX = {
    'Náuseas': ['Comum no início; costuma diminuir em dias ou semanas. Tomar com alimentos pode ajudar.', 'Vômitos persistentes ou incapacidade de se hidratar.'],
    'Dor de cabeça': ['Costuma ser leve e transitória.', 'Dor intensa e súbita, com febre, rigidez no pescoço ou alteração neurológica.'],
    'Desconforto gastrointestinal': ['Diarreia, gases e dor abdominal são comuns no início do uso.', 'Diarreia intensa ou persistente, sangue nas fezes ou desidratação.'],
    'Função renal': ['O tenofovir é eliminado pelos rins; alterações costumam ser silenciosas e detectadas pela creatinina.', 'Pouca urina, inchaço, sede intensa ou cansaço marcante: avaliação médica.'],
    'Saúde óssea': ['Pode haver pequena redução da densidade mineral óssea com TDF, em geral modesta. Cálcio, vitamina D e atividade física ajudam.', 'Dor óssea persistente ou fratura.'],
    'Sinais de alerta': ['Pele ou olhos amarelados, urina escura, falta de ar ou febre alta com mal-estar podem indicar reação grave.', 'Procure atendimento médico imediato (SAMU 192).']
  };
  const sxBox = $('#sxChips');
  Object.keys(SX).forEach((k) => {
    const b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.textContent = k; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      const sel = $$('[aria-pressed="true"]', sxBox).map((x) => x.textContent);
      $('#sxOut').innerHTML = sel.length ? `<div class="out${sel.includes('Sinais de alerta') ? ' warn' : ''}">${sel.map((s) => `<p><b>${s}</b><br>O que pode ocorrer: ${SX[s][0]}<br><b>Quando buscar avaliação:</b> ${SX[s][1]}</p>`).join('')}<p class="privacy">Informe a equipe de saúde e não interrompa a medicação por conta própria.</p></div>` : '';
    });
    sxBox.appendChild(b);
  });

  /* Adesão */
  const AD_KEY = 'prepare-se:adesao';
  function renderAd() {
    const set = store.get(AD_KEY, []); const box = $('#adCal'); box.innerHTML = ''; let n = 0;
    for (let i = 27; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const k = ymd(d); const on = set.includes(k); if (on) n++;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (on ? ' active' : ''); b.setAttribute('aria-pressed', String(on));
      b.textContent = d.getDate() + '/' + (d.getMonth() + 1);
      b.addEventListener('click', () => { const s = store.get(AD_KEY, []); const x = s.indexOf(k); x < 0 ? s.push(k) : s.splice(x, 1); store.set(AD_KEY, s); renderAd(); });
      box.appendChild(b);
    }
    $('#adText').textContent = `${n} de 28 dias registrados (${Math.round(n / 28 * 100)}%).`;
  }
  renderAd();

  /* Lembrete discreto (notificação local, sem nome de medicamento) */
  const REM_KEY = 'prepare-se:lembrete'; let remTimer = null;
  function startRem() {
    clearInterval(remTimer); const r = store.get(REM_KEY, null); if (!r) return;
    remTimer = setInterval(() => {
      const n = new Date(); const hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
      if (hm === r.time && r.last !== ymd(n) && window.Notification && Notification.permission === 'granted') {
        r.last = ymd(n); store.set(REM_KEY, r); new Notification('Lembrete');
      }
    }, 20000);
  }
  const remMsg = $('#remMsg');
  const savedRem = store.get(REM_KEY, null); if (savedRem) $('#remTime').value = savedRem.time;
  $('#remOn').addEventListener('click', async () => {
    const t = $('#remTime').value;
    if (!t) { remMsg.textContent = 'Escolha um horário.'; return; }
    if (!window.Notification) { remMsg.textContent = 'Seu navegador não permite notificações. Use o alarme do aparelho com um nome neutro.'; return; }
    if (await Notification.requestPermission() !== 'granted') { remMsg.textContent = 'Permissão negada. Use o alarme do aparelho com um nome neutro.'; return; }
    store.set(REM_KEY, { time: t }); startRem(); remMsg.textContent = 'Lembrete ativado para ' + t + ' (a página precisa estar aberta).';
  });
  $('#remOff').addEventListener('click', () => { store.remove(REM_KEY); clearInterval(remTimer); remMsg.textContent = 'Lembrete desativado.'; });
  startRem();

  /* Efeitos adversos registrados */
  const AE_KEY = 'prepare-se:efeitos';
  function renderAE() {
    const l = store.get(AE_KEY, []);
    $('#aeList').innerHTML = l.map((n, i) => `<li><span>${escapeHTML(n.d)}: ${escapeHTML(n.t)}</span><button data-i="${i}" aria-label="Remover"><svg class="ic" aria-hidden="true"><use href="#i-x"/></svg></button></li>`).join('');
    $$('#aeList button').forEach((b) => b.addEventListener('click', () => { const a = store.get(AE_KEY, []); a.splice(Number(b.dataset.i), 1); store.set(AE_KEY, a); renderAE(); }));
  }
  $('#aeSave').addEventListener('click', () => {
    const t = $('#aeTxt').value.trim(); if (!t) return;
    const a = store.get(AE_KEY, []); a.push({ t: t.slice(0, 300), d: new Date().toLocaleDateString('pt-BR') }); store.set(AE_KEY, a); $('#aeTxt').value = ''; renderAE();
  });
  $('#aeClear').addEventListener('click', () => { store.remove(AE_KEY); renderAE(); });
  renderAE();

  /* Exames e monitoramento */
  const EXAMES = [
    ['Testagem para HIV', 'Confirma que a pessoa não tem HIV antes de iniciar e durante o uso da PrEP.'],
    ['Creatinina e função renal', 'Avalia a eliminação renal do tenofovir; feita antes de iniciar e periodicamente.'],
    ['Hepatites B e C', 'Hepatite B é importante pela possível exacerbação ao suspender TDF/FTC; a vacinação pode ser indicada. Hepatite C: rastreamento conforme protocolo.'],
    ['Sífilis e outras ISTs', 'Testagem e tratamento periódicos: a PrEP não previne outras ISTs.'],
    ['Consultas periódicas', 'Reavaliação de adesão, efeitos adversos, exposições e retirada da medicação.']
  ];
  const EX_KEY = 'prepare-se:exames'; const exData = store.get(EX_KEY, {});
  $('#examList').innerHTML = EXAMES.map(([t, d], i) => `<div class="card exam"><h3>${t}</h3><p>${d}</p><label for="exl${i}">Última realização</label><input type="date" id="exl${i}" data-k="l${i}" value="${exData['l' + i] || ''}"><label for="exn${i}">Próxima (conforme a equipe)</label><input type="date" id="exn${i}" data-k="n${i}" value="${exData['n' + i] || ''}"></div>`).join('');
  $('#examList').addEventListener('change', (e) => { if (e.target.dataset.k) { exData[e.target.dataset.k] = e.target.value; store.set(EX_KEY, exData); } });

})();
