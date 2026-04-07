/* ═══════════════════════════════════════════════════
   ShopFlow Dashboard — Lógica Principal (app.js)
   Sessão 2: Relógio, estrutura e eventos base
   ═══════════════════════════════════════════════════ */
 
   // ── Estado global do dashboard ──────────────────────
   // Objecto central que guarda os dados do dashboard.
   // Vai crescer em cada sessão.
   const ShopFlow = {
       versao: '2.0',
       loja: {
           nome: 'ShopFlow',
           cidade: 'Porto',
           moeda: 'EUR'
       },
       dados: {
        produtos: [],
        categoriaActiva: 'todos',   // <- NOVO
        totalVendas: 0,
        totalReceita: 0,
        temperatura: null,
        humidade: null
    
       },
       ligacoes: {
           websocket: null,      // Criado na Sessão 4
           mqtt: null            // Criado na Sessão 7
       }
   };
    
   // ── Utilitários ──────────────────────────────────────
    
   /**
    * Formata um número como valor monetário em EUR
    * @param {number} valor - O valor a formatar
 * @returns {string} - Ex: '1.234,56 EUR'
 */
 function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
  }).format(valor);
}

/*
* Formata uma data no padrão português
* @param {Date} data - O objecto Date a formatar
* @returns {string} - Ex: 'segunda-feira, 11 de março de 2026'
*/
function formatarData(data) {
  return data.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
}

// ── Relógio em tempo real ────────────────────────────

function actualizarRelogio() {
  const agora = new Date();

  // Formatar hora com dois dígitos (ex: 09:05:03)
  const horas   = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');
  const horaFormatada = `${horas}:${minutos}:${segundos}`;

  // Actualizar o elemento do relógio no HTML
  const elemRelogio = document.getElementById('relogio');
  if (elemRelogio) elemRelogio.textContent = horaFormatada;

  // Actualizar a data (só precisa de mudar uma vez por dia,
  // mas actualizamos aqui para simplificar)
  const elemData = document.getElementById('data-hoje');
  if (elemData) elemData.textContent = formatarData(agora);
}

// Iniciar o relógio: actualizar imediatamente e depois
// a cada 1000 milissegundos (1 segundo)
actualizarRelogio();
setInterval(actualizarRelogio, 1000);

// ── Gestão de eventos — Filtros de stock ─────────────
// Os botões de filtro são criados aqui.
// A lógica de filtro real será adicionada na Sessão 3.

document.querySelectorAll('.sf-btn').forEach(botao => {
  botao.addEventListener('click', (evento) => {
      // Remover classe activo de todos os botões
      document.querySelectorAll('.sf-btn').forEach(b => {
          b.classList.remove('sf-btn--activo');
      });
      // Activar o botão clicado
      evento.target.classList.add('sf-btn--activo');
 
      const categoria = evento.target.dataset.categoria;
      console.log('Filtro seleccionado:', categoria);
      // Na Sessão 3: filtrarProdutos(categoria);
  });
});

// ── Inicialização ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  console.log(`ShopFlow Dashboard v${ShopFlow.versao} iniciado`);
  console.log('Sessão 2: Estrutura base criada com sucesso');
  console.log('Próximos passos:');
  console.log('  Sessão 3: Carregar produtos a partir de produtos.json');
  console.log('  Sessão 4: Ligar WebSocket para vendas em tempo real');

  // Activar o primeiro botão de filtro
  const primeiroBotao = document.querySelector('.sf-btn');
  if (primeiroBotao) primeiroBotao.classList.add('sf-btn--activo');
});
document.getElementById('btn-tema').addEventListener('click', () => {
  document.body.classList.toggle('tema-escuro');
  const temaModo = document.body.classList.contains('tema-escuro');
  evento.target.textContent = temaModo ? 'Modo Claro' : 'Modo Escuro';
});
function estaAberta() {
  const agora = new Date();
  const hora = agora.getHours();
  const diaSemana = agora.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado

  const diaUtil = diaSemana >= 1 && diaSemana <= 5;
  const horario = hora >= 9 && hora < 18;

  return diaUtil && horario;
}
// Com .then() encadeados (funciona, mas fica difícil de ler)
//fetch('data/produtos.json')
//    .then(r => r.json())
//    .then(dados => mostrarProdutos(dados))
//    .catch(e => console.error(e));
 
// Com async/await (mais limpo — é o que vamos usar)
async function carregarProdutos() {
    try {
        const resposta = await fetch('data/produtos.json');
        const dados = await resposta.json();
        //mostrarProdutos(dados);
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
    }
}
// Seleccionar um elemento pelo ID
const lista = document.getElementById('lista-produtos');
 
// Seleccionar múltiplos elementos por classe
const botoes = document.querySelectorAll('.sf-btn');
 
// Modificar o conteúdo HTML de um elemento
lista.innerHTML = '<p>Nenhum produto encontrado</p>';
 
// Criar um novo elemento e adicioná-lo à página
const cartao = document.createElement('div');
cartao.className = 'sf-produto-cartao';
cartao.innerHTML = '<h3>Portátil</h3><p>899,99 EUR</p>';
lista.appendChild(cartao);
// ── Painel de Stock ───────────────────────────────────
 
/*
 * Carrega os produtos a partir do ficheiro JSON.
 * Usa async/await para esperar pela resposta sem bloquear a página.
 */
 async function carregarProdutos() {
  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = '<p class="sf-placeholder">A carregar produtos...</p>';

  try {
      const resposta = await fetch('data/produtos.json');

      // Verificar se o pedido foi bem sucedido (código HTTP 200)
      if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const dados = await resposta.json();
      ShopFlow.dados.produtos = dados.produtos;

      console.log(`Carregados ${dados.produtos.length} produtos`);
      renderizarProdutos(ShopFlow.dados.produtos);

  } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      lista.innerHTML = `<p class="sf-placeholder">
          Erro ao carregar produtos. Verifique a consola.</p>`;
  }
}

/*
* Filtra os produtos pela categoria seleccionada.
* @param {string} categoria - 'todos' ou o nome da categoria
* @returns {Array} - Array de produtos filtrados
*/
function filtrarProdutos(categoria) {
  if (categoria === 'todos') {
      return ShopFlow.dados.produtos;
  }
  return ShopFlow.dados.produtos.filter(p => p.categoria === categoria);
}
/*
* Determina o estado do stock de um produto.
* @param {number} stock - Quantidade em stock
* @returns {Object} - { classe, texto } para usar no HTML
*/
function estadoStock(stock) {
  if (stock === 0)  return { classe: 'esgotado', texto: 'Esgotado' };
  if (stock <= 5)   return { classe: 'baixo',    texto: `Apenas ${stock}` };
  return               { classe: 'ok',       texto: `${stock} unid.` };
}
/* Renderiza os cartões de produto no DOM.
* @param {Array} produtos - Array de objectos produto
*/
function renderizarProdutos(produtos) {
   const lista = document.getElementById('lista-produtos');
   const badge = document.getElementById('badge-stock');

   // Actualizar o contador no cabeçalho do painel
   badge.textContent = `${produtos.length} produto${produtos.length !== 1 ? 's' : ''}`;

   // Caso não haja produtos na categoria
   if (produtos.length === 0) {
       lista.innerHTML = `<div class="sf-sem-produtos">
           Nenhum produto na categoria "${ShopFlow.dados.categoriaActiva}".
       </div>`;
       return;
   }

   // Construir o HTML de todos os cartões de uma vez
   const html = produtos.map(produto => {
       const estado = estadoStock(produto.stock);
       const classeCartao = produto.stock === 0 ? 'sf-produto-cartao sf-produto-cartao--esgotado'
                                                : 'sf-produto-cartao';
       const precoFormatado = formatarMoeda(produto.preco);

       return `
           <div class="${classeCartao}" data-id="${produto.id}">
               <div class="sf-produto-info">
                   <div class="sf-produto-nome">${produto.nome}</div>
                   <div class="sf-produto-categoria">${produto.categoria}</div>
               </div>
               <div class="sf-produto-direita">
                   <span class="sf-produto-preco">${precoFormatado}</span>
                   <span class="sf-produto-stock sf-produto-stock--${estado.classe}">
                       ${estado.texto}
                   </span>
               </div>
           </div>
       `;
   }).join('');

   lista.innerHTML = html;
}
// ── Gestão de eventos — Filtros de stock ─────────────
document.querySelectorAll('.sf-btn').forEach(botao => {
  botao.addEventListener('click', (evento) => {
      const categoria = evento.target.dataset.categoria;
        // Actualizar estado visual dos botões
        document.querySelectorAll('.sf-btn').forEach(b => {
          b.classList.remove('sf-btn--activo');
      });
      evento.target.classList.add('sf-btn--activo');

      // Guardar categoria activa no estado global
      ShopFlow.dados.categoriaActiva = categoria;

      // Filtrar e renderizar os produtos
      const produtosFiltrados = filtrarProdutos(categoria);
      renderizarProdutos(produtosFiltrados);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  console.log(`ShopFlow Dashboard v${ShopFlow.versao} iniciado`);

  // Activar o primeiro botão de filtro
  const primeiroBotao = document.querySelector('.sf-btn');
  if (primeiroBotao) primeiroBotao.classList.add('sf-btn--activo');

  // NOVO: Carregar os produtos a partir do JSON
  carregarProdutos();
});
// Dica: o método .sort() recebe uma função de comparação
// Devolver negativo = a vem antes de b
// Devolver positivo = b vem antes de a
// Devolver zero = ordem indiferente-->
//produtos.sort((a, b) => a.preco - b.preco);  // Preço crescente
//produtos.sort((a, b) => b.preco - a.preco);  // Preço decrescente
//produtos.sort((a, b) => a.nome.localeCompare(b.nome));  // Nome A-Z
//produtos.sort((a, b) => b.stock - a.stock);  // Stock decrescente
// Dicas de JavaScript para calcular as estatísticas:
//const selectOrdenacao = document.getElementById("ordenacao");

//selectOrdenacao.addEventListener("change", function () {
//  ordenarProdutos(this.value);
//});
function ordenarProdutos(tipo) {
  switch (tipo) {
    case "nome":
      produtos.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case "preco-asc":
      produtos.sort((a, b) => a.preco - b.preco);
      break;

    case "preco-desc":
      produtos.sort((a, b) => b.preco - a.preco);
      break;

    case "stock":
      produtos.sort((a, b) => b.stock - a.stock);
      break;
  }
//  mostrarProdutos(lista);
}

//mostrarProdutos(lista);
// Número de esgotados
//const esgotados = produtos.filter(p => p.stock === 0).length;
 
// Valor total do stock
//const valorTotal = produtos.reduce((soma, p) => soma + (p.preco * p.stock), 0);
 
// Formatar como moeda (reutilizar a função da Sessão 2)
//formatarMoeda(valorTotal); // ex: '45.678,90 EUR'

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -->

// Criar uma ligação WebSocket
//const ws = new WebSocket('wss://shopflow-servidor-ivqj.onrender.com/');
//                        ^^^                                  
//                        wss:// = WebSocket Secure (como https)
 
// Reagir aos eventos
ws.onopen    = () => console.log('Ligado ao servidor');
ws.onmessage = (evento) => console.log('Mensagem:', evento.data);
ws.onerror   = (erro)   => console.error('Erro WebSocket:', erro);
ws.onclose   = () => console.log('Ligação fechada');
 
// Enviar uma mensagem ao servidor (se necessário)
ws.send('Olá servidor!');
 
// Fechar a ligação
ws.close();

// No servidor (Node.js) — estrutura básica com a biblioteca ws
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
 
// Quando um cliente se liga
wss.on('connection', (ws) => {
    console.log('Novo cliente ligado');
 
    // Enviar uma mensagem ao cliente
    ws.send(JSON.stringify({ tipo: 'bem-vindo', mensagem: 'Ligado!' }));
 
    // Receber mensagens do cliente
    ws.on('message', (dados) => {
        console.log('Cliente enviou:', dados.toString());
    });
 
    // Quando o cliente se desliga
    ws.on('close', () => {
        console.log('Cliente desligado');
    });
});
// Confirmar que o objecto ShopFlow tem esta estrutura
// (já existe do app.js da Sessão 2 — não duplicar)
//ligacoes: {
//  websocket: null,   // Será preenchido pela função ligarWebSocket()
//  mqtt; null         // Sessão 7
//};
// ── Painel de Vendas em Tempo Real ───────────────────
 
/**
 * Actualiza os contadores de encomendas e receita.
 * @param {number} totalVendido - Valor da venda a adicionar
 */
function actualizarContadores(totalVendido) {
  ShopFlow.dados.totalVendas  += 1;
  ShopFlow.dados.totalReceita += totalVendido;

  const elemVendas  = document.getElementById('total-vendas');
  const elemReceita = document.getElementById('total-receita');

  if (elemVendas)  elemVendas.textContent  = ShopFlow.dados.totalVendas;
  if (elemReceita) elemReceita.textContent  = formatarMoeda(ShopFlow.dados.totalReceita);
}

/**
* Adiciona uma nova venda ao feed, no topo da lista.
* Mantém no máximo 20 itens visíveis.
* @param {Object} venda - Dados da venda recebidos do servidor
*/
function adicionarAoFeed(venda) {
  const feed = document.getElementById('feed-vendas');

  // Remover o placeholder se ainda existir
  const placeholder = feed.querySelector('.sf-placeholder');
  if (placeholder) placeholder.remove();

  // Criar o elemento da venda
  const item = document.createElement('div');
  item.className = 'sf-feed-item';
  item.innerHTML = `
      <span class="sf-feed-produto">${venda.produto}</span>
      <span class="sf-feed-local">${venda.localidade} &bull; ${venda.hora}</span>
      <span class="sf-feed-valor">${formatarMoeda(venda.total)}</span>
  `;

  // Inserir no topo (antes do primeiro filho)
  feed.insertBefore(item, feed.firstChild);

  // Limitar a 20 itens para não sobrecarregar o DOM
  const itens = feed.querySelectorAll('.sf-feed-item');
  if (itens.length > 20) {
      itens[itens.length - 1].remove();
  }

  // Animar a barra de actividade WebSocket
  const barra = document.getElementById('ws-barra');
  if (barra) {
    barra.classList.remove('sf-ws-barra--activa');
    void barra.offsetWidth; // Forçar re-render para reiniciar animação
    barra.classList.add('sf-ws-barra--activa');
}
}

/**
* Actualiza o indicador de estado da ligação WebSocket.
* @param {'online'|'offline'} estado
*/
function actualizarIndicadorWS(estado) {
const indicador = document.getElementById('indicador-ws');
if (!indicador) return;

if (estado === 'online') {
    indicador.textContent = 'Online';
    indicador.className   = 'sf-indicador sf-indicador--online';
} else {
    indicador.textContent = 'Desligado';
    indicador.className   = 'sf-indicador sf-indicador--offline';
}
}
/**
 * Estabelece e gere a ligação WebSocket ao servidor ShopFlow.
 * Implementa reconexão automática com backoff exponencial.
 */
function ligarWebSocket() {
  // IMPORTANTE: Substituir pelo URL do vosso serviço no Render
  const URL_SERVIDOR = 'wss://shopflow-servidor-ivqj.onrender.com/';

  console.log('A ligar ao servidor WebSocket...');

  try {
      ShopFlow.ligacoes.websocket = new WebSocket(URL_SERVIDOR);
  } catch (e) {
      console.error('Não foi possível criar WebSocket:', e);
      return;
  }

  const ws = ShopFlow.ligacoes.websocket;

  // ── Ligação estabelecida ──
  ws.onopen = () => {
      console.log('WebSocket ligado ao servidor ShopFlow');
      actualizarIndicadorWS('online');
      ShopFlow.reconexoes = 0; // Resetar contador de reconexões
  };

  // ── Mensagem recebida do servidor ──
  ws.onmessage = (evento) => {
      try {
          const mensagem = JSON.parse(evento.data);
 
          if (mensagem.tipo === 'venda') {
            // Processar venda: actualizar contadores e feed
            actualizarContadores(mensagem.total);
            adicionarAoFeed(mensagem);

        } else if (mensagem.tipo === 'ligado') {
            console.log('Servidor:', mensagem.mensagem);
        }

    } catch (e) {
        console.error('Erro ao processar mensagem:', e);
    }
};

// ── Erro na ligação ──
ws.onerror = (erro) => {
    console.error('Erro WebSocket — verifique se o servidor está activo');
    actualizarIndicadorWS('offline');
};

// ── Ligação fechada — tentar reconectar ──
ws.onclose = (evento) => {
    console.log(`WebSocket fechado (código: ${evento.code})`);
    actualizarIndicadorWS('offline');

    // Reconexão automática após 5 segundos
    if (!ShopFlow.reconectar) return; // Não reconectar se foi fechado intencionalmente
    console.log('A reconectar em 5 segundos...');
    setTimeout(ligarWebSocket, 5000);
};
}
document.addEventListener('DOMContentLoaded', () => {
  console.log(`ShopFlow Dashboard v${ShopFlow.versao} iniciado`);

  const primeiroBotao = document.querySelector('.sf-btn');
  if (primeiroBotao) primeiroBotao.classList.add('sf-btn--activo');

  carregarProdutos();  // Sessão 3

  // NOVO (Sessão 4): Ligar ao servidor WebSocket
  ShopFlow.reconectar = true;  // Permitir reconexão automática
  ligarWebSocket();
});
