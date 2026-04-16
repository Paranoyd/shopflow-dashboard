const ShopFlow = {
  dados: {
      produtos: [],
      categoriaActiva: 'todos',
      totalVendas: 0,
      totalReceita: 0
  },
  ligacoes: { 
    websocket: null,
    mqtt: null,
  },
  cache: {}
};

// ── RELÓGIO ──
function iniciarRelogio() {
  setInterval(() => {
      const agora = new Date();

      document.getElementById('relogio').textContent =
          agora.toLocaleTimeString('pt-PT');

      document.getElementById('data-hoje').textContent =
          agora.toLocaleDateString('pt-PT');
  }, 1000);
}

// ── STOCK ──
async function carregarProdutos() {
  const res = await fetch('data/produtos.json');
  const dados = await res.json();

  ShopFlow.dados.produtos = dados.produtos;
  renderizarProdutos(dados.produtos);
}

function filtrarProdutos(cat) {
  if (cat === 'todos') return ShopFlow.dados.produtos;
  return ShopFlow.dados.produtos.filter(p => p.categoria === cat);
}

function renderizarProdutos(produtos) {
  const lista = document.getElementById('lista-produtos');
  const badge = document.getElementById('badge-stock');

  badge.textContent = produtos.length + ' produtos';

  lista.innerHTML = produtos.map(p => `
      <div class="sf-produto-cartao">
          <span>${p.nome}</span>
          <span>${p.preco}€</span>
      </div>
  `).join('');
}

// ── FILTROS ──
document.querySelectorAll('.sf-btn').forEach(btn => {
  btn.addEventListener('click', e => {
      document.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('sf-btn--activo'));
      e.target.classList.add('sf-btn--activo');

      const cat = e.target.dataset.categoria;
      ShopFlow.dados.categoriaActiva = cat;

      renderizarProdutos(filtrarProdutos(cat));
  });
});

// ── VENDAS ──
function actualizarContadores(valor) {
  ShopFlow.dados.totalVendas++;
  ShopFlow.dados.totalReceita += valor;

  document.getElementById('total-vendas').textContent = ShopFlow.dados.totalVendas;
  document.getElementById('total-receita').textContent = ShopFlow.dados.totalReceita + ' €';
}

function adicionarFeed(venda) {
  const feed = document.getElementById('feed-vendas');

  const item = document.createElement('div');
  item.className = 'sf-feed-item';
  item.innerHTML = `
      <span>${venda.produto}</span>
      <span>${venda.total}€</span>
  `;

  feed.prepend(item);
}

// ── WEBSOCKET ──
function ligarWebSocket() {
  const ws = new WebSocket('wss://shopflow-servidor-ivqj.onrender.com/');

  ws.onopen = () => {
      document.getElementById('indicador-ws').textContent = 'Online';
      document.getElementById('indicador-ws').className = 'sf-indicador sf-indicador--online';
  };

  ws.onmessage = (msg) => {
      const venda = JSON.parse(msg.data);

      if (venda.tipo === 'venda') {
          actualizarContadores(venda.total);
          adicionarFeed(venda);
      }
  };

  ws.onclose = () => {
      document.getElementById('indicador-ws').textContent = 'Desligado';
  };
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelogio();
  carregarProdutos();
  ligarWebSocket();
});

// ── Painel de Meteorologia ───────────────────────────
 
// Inicializar o objecto de cache no ShopFlow
// (adicionar junto às outras propriedades do ShopFlow)
// ShopFlow.cache = {};  <- já adicionado na inicialização abaixo
 
/**
 * Converte o código de ícone da OpenWeatherMap num emoji.
 */
function iconeMeteoEmoji(iconCode) {
  const mapa = {
      '01d':'☀️', '01n':'🌙',  '02d':'⛅', '02n':'☁️',
      '03d':'☁️', '03n':'☁️',  '04d':'☁️', '04n':'☁️',
      '09d':'🌧️','09n':'🌧️', '10d':'🌦️','10n':'🌧️',
      '11d':'⛈️','11n':'⛈️', '13d':'❄️', '13n':'❄️',
      '50d':'🌫️','50n':'🌫️',
  };
  return mapa[iconCode] || '🌡️';
}

/**
* Pede dados à OpenWeatherMap com cache de 10 minutos.
*/
async function pedirDadosMeteo() {
  const agora = Date.now();
  if (ShopFlow.cache.meteo &&
      (agora - ShopFlow.cache.meteoTimestamp) < CONFIG.INTERVALO_METEO) {
      return ShopFlow.cache.meteo;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather` +
              `?q=${CONFIG.CIDADE},${CONFIG.PAIS}` +
              `&appid=${CONFIG.OPENWEATHER_KEY}` +
              `&units=metric&lang=pt`;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`OpenWeatherMap: erro ${resposta.status}`);
  const dados = await resposta.json();
  ShopFlow.cache.meteo = dados;
  ShopFlow.cache.meteoTimestamp = agora;
  return dados;
}

/**
* Actualiza o painel de meteorologia no DOM.
*/
async function actualizarPainelMeteo() {
  const painel = document.getElementById('meteo-conteudo');
  if (!painel) return;
  try {
      const d = await pedirDadosMeteo();
      const temp      = Math.round(d.main.temp);
      const sensacao  = Math.round(d.main.feels_like);
      const humidade  = d.main.humidity;
      const vento     = (d.wind.speed * 3.6).toFixed(1);
      const descricao = d.weather[0].description;
      const icone     = iconeMeteoEmoji(d.weather[0].icon);
      const hora      = new Date(d.dt * 1000)
                            .toLocaleTimeString('pt-PT',
                                { hour: '2-digit', minute: '2-digit' });
      painel.innerHTML = `
          <div class="sf-meteo-principal">
              <span class="sf-meteo-icone">${icone}</span>
              <div>
                  <div class="sf-meteo-temp">${temp}°C</div>
                  <div class="sf-meteo-descricao">${descricao}</div>
              </div>
          </div>
          <div class="sf-meteo-detalhes">
              <div class="sf-meteo-detalhe">
                  <span>Sensação</span><span>${sensacao}°C</span>
              </div>
              <div class="sf-meteo-detalhe">
                  <span>Humidade</span><span>${humidade}%</span>
              </div>
              <div class="sf-meteo-detalhe">
                  <span>Vento</span><span>${vento} km/h</span>
              </div>
              <div class="sf-meteo-detalhe">
                  <span>Pressão</span><span>${d.main.pressure} hPa</span>
              </div>
          </div>
          <div class="sf-meteo-actualizado">Actualizado às ${hora}</div>`;
  } catch (erro) {
      console.error('Erro meteorologia:', erro);
      painel.innerHTML = `<div class="sf-api-erro">
          Não foi possível obter dados meteorológicos.<br>
          Verifique a chave API em config.js.</div>`;
  }
}
actualizarPainelMeteo();