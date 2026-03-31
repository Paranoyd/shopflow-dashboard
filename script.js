const ShopFlow = {
  versao: '2.0',           // Propriedade simples: texto
  loja: {                  // Propriedade que é outro objecto
      nome: 'ShopFlow',
      cidade: 'Porto',
      moeda: 'EUR'
  },
  dados: {
      produtos: [],        // Array vazio — será preenchido na Sessão 3
      totalVendas: 0       // Número — será incrementado na Sessão 4
  }
};

// Como aceder aos dados:
console.log(ShopFlow.loja.nome);      // 'ShopFlow'
console.log(ShopFlow.dados.produtos); // []
// Método antigo (concatenação com +)
const msg1 = 'ShopFlow Dashboard v' + ShopFlow.versao + ' iniciado';
 
// Template literal (mais limpo e legível)
const msg2 = `ShopFlow Dashboard v${ShopFlow.versao} iniciado`;
 
// Também funciona com expressões
const horas = 9;
const msg3 = `São ${horas < 12 ? 'manhã' : 'tarde'}`;
// Resultado: 'São manhã'
// padStart(tamanho, caractere_de_preenchimento)
String(9).padStart(2, '0');   // Resultado: '09'
String(15).padStart(2, '0');  // Resultado: '15' (já tem 2 dígitos)
String(3).padStart(4, '0');   // Resultado: '0003'
// Executar actualizarRelogio() a cada 1000ms (1 segundo)
setInterval(actualizarRelogio, 1000);
 
// Equivalente com função anónima:
setInterval(() => {
    actualizarRelogio();
}, 1000);
 
// Para parar o intervalo, guardamos a referência:
const intervalo = setInterval(actualizarRelogio, 1000);
// Mais tarde: clearInterval(intervalo);

console.log(estaAberta() ? 'Loja aberta' : 'Loja fechada');
setInterval(() => {
  estaAberta();
}, 1000);