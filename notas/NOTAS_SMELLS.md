# Notas — Análise manual de `src/ReportGenerator.js` (Etapa 2)

Arquivo analisado: `src/ReportGenerator.js` (69 linhas, uma classe, um método `generateReport`).
Números de linha referem-se ao arquivo no commit `1de9305`.

## Linha de base do trabalho
- Repositório original: commit `39d39f9` ("Add repositorio").
- **Linha de base usada nos `git diff`: commit `1de9305`** — igual ao original, mais dois ajustes autorizados pelo professor: (1) script `test` do `package.json` com `NODE_OPTIONS=--experimental-vm-modules` (Jest com ESM); (2) correção do espaço extra em `<tr ${style}>` (`src/ReportGenerator.js`, linhas 39–40), sem o qual 1 dos 5 testes falhava.
- Testes (`tests/ReportGenerator.test.js`) intocados desde o original.

---

## Smell 1 — Long Method
- **Localização:** `generateReport`, linhas 11–68 (~58 linhas).
- **O que acontece:** um único método monta cabeçalho (16–24), corpo (27–55) e rodapé (58–65), para dois formatos (CSV/HTML) e dois perfis (ADMIN/USER), e ainda acumula o total.
- **Manutenção:** muitas responsabilidades num só lugar; para mudar o rodapé HTML é preciso ler o método inteiro. Os comentários `// --- Seção do ... ---` (linhas 15, 26, 57) indicam blocos que deveriam ser métodos (comentários costumam ser "desodorante" para código ruim; solução: Extract Method).
- **Testes:** só dá para testar pelo método inteiro (o teste precisa montar o relatório completo para validar um trecho); não há como testar cabeçalho, linha ou rodapé isoladamente.
- **Técnica:** **Extract Method** (`buildHeader`, `buildRow`, `buildFooter`); alternativa: Replace Method with Method Object.

## Smell 2 — Switch Statements / condicionais complexas e aninhadas
- **Localização:** laço das linhas 27–55 (até 4 níveis: `for` → `if role` → `if value` → `if reportType`); a mesma cadeia `if (reportType === 'CSV') … else if (reportType === 'HTML')` aparece 3 vezes (16–24, 35–42/46–52, 58–65).
- **Manutenção:** para adicionar um formato (ex.: JSON) é preciso editar o cabeçalho, as duas ramificações do corpo e o rodapé (cirurgia em vários pontos). Um tipo ou perfil desconhecido é ignorado em silêncio.
- **Testes:** o número de caminhos cresce com a combinação formato × perfil × faixa de valor; cobrir todos exige muitos casos.
- **Relação com duplicação:** o problema do switch é semelhante ao código duplicado — a mesma estrutura condicional repetida em vários pontos (aqui, a cadeia por `reportType`).
- **Técnica:** **Extract Method** (um método por caso), **Replace Conditional with Polymorphism** (um formatter por formato: CSV e HTML) e, do enunciado, **Decompose Conditional** (regras de visibilidade por perfil).
- **Complexidade cognitiva (confirmada pelo ESLint):** `generateReport` tem **27**, limite 15 (`sonarjs/cognitive-complexity`, linha 11). O linter também aponta `sonarjs/no-collapsible-if` na linha 43 (`else if USER` com `if value <= 500` dentro).

## Smell 3 — Duplicated Code
- **Localização:**
  - linha CSV idêntica em 36 e 47;
  - linha HTML quase idêntica em 40 e 50 (a de 40 só adiciona o `style`);
  - `total += item.value` repetido 4 vezes (37, 41, 48, 51).
- **Manutenção:** mudar o formato da linha CSV exige editar dois lugares; esquecer um gera relatórios diferentes para ADMIN e USER.
- **Testes:** cada cópia precisa ser coberta separadamente; um bug numa cópia passa despercebido se só a outra for testada.
- **Técnica:** **Extract Method** (`formatRow(item, user)`, `shouldInclude(item, user)`), somando o total uma única vez. (Pull Up Method não se aplica: não há herança.)

## Smell 4 — Números Mágicos / strings mágicas
- **Localização:** `1000` (linha 30), `500` (linha 45); literais `'ADMIN'`, `'USER'`, `'CSV'`, `'HTML'` repetidos pelo arquivo.
- **Manutenção:** o significado de 1000 ("prioritário") e 500 ("limite do usuário comum") só aparece em comentários; mudar a regra exige caçar literais.
- **Testes:** os valores-limite não têm nome, então os testes também usam números soltos.
- **Técnica:** **Replace Magic Number with Symbolic Constant** (`PRIORITY_THRESHOLD`, `USER_MAX_VALUE`, constantes para perfis e formatos).
## Observação extra (não é um dos 3 do relatório)
- **Efeito colateral:** linha 32 altera o objeto recebido (`item.priority = true`), mutando a entrada do chamador. Ao refatorar, preservar o comportamento (os testes dependem da prioridade no HTML), mas vale mencionar.

---

## Smell mais crítico (para o "Antes e Depois")
**Smell 2 — condicionais aninhadas em `generateReport` (linhas 27–55).** É o que mais pesa na complexidade cognitiva, concentra a duplicação e é o que mais dificulta estender o código.

## Checklist da Etapa 2
- [x] ≥ 3 tipos distintos de smell (aqui: 4)
- [x] Nome, localização e justificativa de cada um
- [x] Impacto em manutenção e em testes
- [x] Smell mais crítico escolhido

---

# Etapa 4 — Detecção automática e comparação

Saída de `npx eslint src/` (antes da refatoração, linha de base `16d5a2c`), salva em `ESLINT_ANTES.txt`:

| Linha | Regra | Mensagem |
|---|---|---|
| 11:3 | `sonarjs/cognitive-complexity` | Refactor this function to reduce its Cognitive Complexity from **27** to the 15 allowed |
| 43:14 | `sonarjs/no-collapsible-if` | Merge this if statement with the nested one |

**Total: 2 problemas (2 erros, 0 avisos)** — ambos em `src/ReportGenerator.js`. Esta é a contagem "antes" para comparar na Etapa 6.

## Associação achado do linter → smell
- `cognitive-complexity` (linha 11) → **Long Method** e **Switch Statements / condicionais aninhadas** (a complexidade vem dos `if/else if` aninhados dentro do `for`, que a métrica penaliza por nível de aninhamento).
- `no-collapsible-if` (linha 43) → **Switch Statements / condicionais aninhadas** (`else if (user.role === 'USER')` com `if (item.value <= 500)` dentro).

## Comparação manual × ferramenta

| Smell anotado à mão | A ferramenta apontou? | Observação |
|---|---|---|
| 1. Long Method | Indiretamente | Não há regra de "tamanho de método"; o `cognitive-complexity` marca a mesma função (linha 11), mas pela complexidade, não pelas ~58 linhas. |
| 2. Condicionais aninhadas / Switch Statements | **Sim** | `cognitive-complexity` (27) e `no-collapsible-if` (linha 43). |
| 3. Duplicated Code | **Não** | `no-identical-functions` só compara funções inteiras idênticas; a duplicação aqui é de trechos dentro de um único método (linhas 36/47, 40/50, `total +=`), então nada foi reportado. |
| 4. Números mágicos | **Não** | Nenhuma regra ativa para isso (`1000` e `500` passaram sem aviso). |
| Extra: mutação de `item.priority` (linha 32) | **Não** | Sem regra correspondente. |

### O que a ferramenta achou e a análise manual não tinha
- **O valor exato da complexidade: 27.** À mão eu só tinha estimado "acima de 15"; a métrica quantifica o problema e dá um alvo objetivo (≤ 15) para a refatoração.
- **`no-collapsible-if` na linha 43:** à mão eu não tinha visto que o `if` interno do ramo `USER` poderia ser fundido com o externo.

### O que eu vi e a ferramenta não
- Duplicação de trechos (smell 3), números mágicos (smell 4) e a mutação do parâmetro `item`. A ferramenta, com a configuração do enunciado, não cobre esses casos — por isso a análise manual continua necessária.

## Pendência para o relatório
- **Print feito:** `print_eslint_antes.jpeg` (mostra o comando, os 2 erros e o total). O texto da saída está em `ESLINT_ANTES.txt`.

---

# Etapa 5 — Refatoração (resumo)

Arquivos: `src/ReportGenerator.refactored.js` e `tests/ReportGenerator.refactored.test.js` (só a linha 1, o import, difere do teste original). Originais intactos em relação a `16d5a2c`.

| Commit | Passo | Técnica | Smell tratado | Testes |
|---|---|---|---|---|
| `4083331` | cópias criadas | — | — | 10/10 |
| `f419227` | constantes `PRIORITY_THRESHOLD`, `USER_MAX_VALUE`, `ROLE`, `REPORT_TYPE` | Replace Magic Number with Symbolic Constant | Números mágicos | 10/10 |
| `0a12208` | funções `buildHeader`, `buildRow`, `buildFooter` | Extract Method | Long Method, duplicação | 10/10 |
| `7db0956` | funções `markPriority`, `canSee`, `isHighlighted` | Decompose Conditional | Condicionais aninhadas | 10/10 |
| `a0c0f9c` | `CsvFormatter`, `HtmlFormatter`, `EmptyFormatter` + `Map` | Replace Conditional with Polymorphism | Switch Statements (cadeia por `reportType` repetida 3×) | 10/10 |

Todos os helpers são funções internas do módulo; a classe exportada mantém só `constructor` e `generateReport` (mesma API do original).

Verificação extra: comparação original × refatorado em 7.200 entradas (tipos e perfis válidos e inválidos, valores-limite) — 0 diferenças na saída e na mutação de `item.priority`.

`npx eslint src/ReportGenerator.refactored.js`: **0 erros** (antes: 2 erros, complexidade 27).

## "Antes e Depois" sugerido para o relatório (smell mais crítico: condicionais aninhadas)
- **Antes:** `generateReport`, linhas 27–55 do original (for → if role → if value → if reportType, com linha CSV/HTML duplicada).
- **Depois:** `generateReport` com um laço de 5 linhas + `formatter.row(...)`; regras em `canSee`/`markPriority`; um formatter por formato.
