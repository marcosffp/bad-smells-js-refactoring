# Entrega: Detecção de Bad Smells e Refatoração Segura

- **Disciplina:** Teste de Software (PUC Minas), professor Cleiton Tavares
- **Aluno:** Marcos Alberto Ferreira Pinto
- **Matrícula:** 857547
- **Repositório (fork):** https://github.com/marcosffp/bad-smells-js-refactoring

Este arquivo indica onde está cada item pedido no enunciado. O `README.md` original do repositório foi mantido sem alterações.

## Onde está cada item

| Item do enunciado | Arquivo |
|---|---|
| Código refatorado | [`src/ReportGenerator.refactored.js`](src/ReportGenerator.refactored.js) |
| Teste do código refatorado (cópia do original, só o `import` da linha 1 mudou) | [`tests/ReportGenerator.refactored.test.js`](tests/ReportGenerator.refactored.test.js) |
| Código original (mantido) | [`src/ReportGenerator.js`](src/ReportGenerator.js) |
| Teste original (não alterado) | [`tests/ReportGenerator.test.js`](tests/ReportGenerator.test.js) |
| Configuração do ESLint + SonarJS | [`.eslintrc.json`](.eslintrc.json) |
| **Relatório escrito (PDF, 4 páginas)** | [`entrega/Relatorio_Bad_Smells.pdf`](entrega/Relatorio_Bad_Smells.pdf) |
| Anotações da análise manual de smells | [`notas/NOTAS_SMELLS.md`](notas/NOTAS_SMELLS.md) |
| Saída do `npx eslint src/` antes e depois (texto) | [`notas/ESLINT_ANTES.txt`](notas/ESLINT_ANTES.txt), [`notas/ESLINT_DEPOIS.txt`](notas/ESLINT_DEPOIS.txt) |
| Prints usados no relatório | [`prints/`](prints/) |

**Observação:** o enunciado cita a pasta `__tests__/`, mas este repositório guarda os testes em `tests/`. Por isso o teste refatorado está em `tests/`, ao lado do original.

## Como conferir

```bash
npm install
npm test                                            # 2 suítes, 10 testes passando
npx eslint src/                                     # 2 erros, ambos em ReportGenerator.js (original)
npx eslint src/ReportGenerator.refactored.js        # sem erros (exit code 0)
```

## Resumo

**Smells encontrados** em `src/ReportGenerator.js`: Long Method, Switch Statements (condicionais aninhadas) e Duplicated Code. Também foram tratados os números mágicos (`1000` e `500`).

**Antes (ESLint):** 2 erros: `sonarjs/cognitive-complexity` (27, limite 15) e `sonarjs/no-collapsible-if`.
**Depois (ESLint):** 0 erros. Testes: 10 de 10 passando nas duas suítes.

**Técnicas aplicadas**, uma por commit, com `npm test` verde em cada passo:

| Commit | Técnica |
|---|---|
| `4083331` | Cópias criadas (arquivo refatorado e teste), sem refatorar ainda |
| `f419227` | Replace Magic Number with Symbolic Constant |
| `0a12208` | Extract Method (`buildHeader`, `buildRow`, `buildFooter`) |
| `7db0956` | Decompose Conditional (`markPriority`, `canSee`, `isHighlighted`) |
| `a0c0f9c` | Replace Conditional with Polymorphism (`CsvFormatter`, `HtmlFormatter`) |

Além dos testes, comparei o original e o refatorado com 7.200 combinações de entrada, e a saída foi idêntica em todas.

## Ajustes em relação ao repositório original

Combinados com o professor e feitos antes da refatoração (commit `1de9305`):

1. **`package.json`:** o script `test` passou a ser `NODE_OPTIONS=--experimental-vm-modules jest`, porque o projeto usa módulos ES e o Jest não carregava o `import` sem essa opção.
2. **`src/ReportGenerator.js`:** corrigido um espaço sobrando em `<tr ${style}>` (gerava `<tr >`), que fazia 1 dos 5 testes falhar. O teste não foi alterado.

Além disso, o `.eslintrc.json` foi trocado pelo conteúdo do enunciado (limite de complexidade cognitiva 15; o do repositório estava em 5) no commit `16d5a2c`.

## Histórico completo

```
b3d7aef docs: adiciona relatorio, notas e prints da entrega
a0c0f9c refactor: replace conditional with polymorphism
7db0956 refactor: decompose conditional
0a12208 refactor: extract method
f419227 refactor: replace magic number with symbolic constant
4083331 test: cria copias refatorada e de teste
16d5a2c chore: configura ESLint + SonarJS conforme o enunciado
1de9305 chore: linha de base (script de teste ESM e correcao do <tr>)
39d39f9 Add repositorio (original do professor)
```
