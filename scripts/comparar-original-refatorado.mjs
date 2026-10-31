// Compara a versão original e a refatorada do ReportGenerator com muitas entradas.
// Confere a string gerada e também a mutação dos itens recebidos (item.priority).
// Uso: node scripts/comparar-original-refatorado.mjs
import { ReportGenerator as Original } from '../src/ReportGenerator.js';
import { ReportGenerator as Refatorado } from '../src/ReportGenerator.refactored.js';

const tipos = ['CSV', 'HTML', 'JSON', '', 'constructor', undefined];
const perfis = ['ADMIN', 'USER', 'GUEST', undefined];
const valores = [0, 1, 499, 500, 501, 1000, 1001, 5000, -3, '700'];
const REPETICOES = 300;

function montaItens(k) {
  return Array.from({ length: k % 6 }, (_, i) => ({
    id: i + 1,
    name: `P${i}`,
    value: valores[(k * 7 + i * 3) % valores.length],
    ...(k % 5 === 0 && i === 0 ? { priority: true } : {}),
  }));
}

let casos = 0;
let diferencas = 0;

for (const tipo of tipos) {
  for (const perfil of perfis) {
    for (let k = 0; k < REPETICOES; k++) {
      const itensOriginal = montaItens(k);
      const itensRefatorado = montaItens(k);
      const usuario = { name: 'U', role: perfil };

      const saidaOriginal = new Original().generateReport(tipo, usuario, itensOriginal);
      const saidaRefatorado = new Refatorado().generateReport(tipo, { ...usuario }, itensRefatorado);

      casos++;
      const mesmaSaida = saidaOriginal === saidaRefatorado;
      const mesmosItens = JSON.stringify(itensOriginal) === JSON.stringify(itensRefatorado);
      if (!mesmaSaida || !mesmosItens) {
        diferencas++;
        if (diferencas <= 3) {
          console.log('DIFERENÇA', { tipo, perfil, saidaOriginal, saidaRefatorado });
        }
      }
    }
  }
}

console.log(`casos: ${casos}, diferenças: ${diferencas}`);
process.exit(diferencas === 0 ? 0 : 1);
