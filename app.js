const ShopFlow = {
  dados: {
      produtos: [],
      categoriaActiva: 'todos',
      totalVendas: 0,
      totalReceita: 0
  },
  ligacoes: {
      websocket: null
  }
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