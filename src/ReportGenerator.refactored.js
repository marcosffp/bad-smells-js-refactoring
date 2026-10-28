const PRIORITY_THRESHOLD = 1000;
const USER_MAX_VALUE = 500;
const ROLE = { ADMIN: 'ADMIN', USER: 'USER' };
const REPORT_TYPE = { CSV: 'CSV', HTML: 'HTML' };

class CsvFormatter {
  header() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  row(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  footer(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter {
  header(user) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  row(item, user, highlighted) {
    const style = highlighted ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  footer(total) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
}

// Tipo de relatório desconhecido: não produz nada (mesmo comportamento original).
class EmptyFormatter {
  header() {
    return '';
  }

  row() {
    return '';
  }

  footer() {
    return '';
  }
}

const FORMATTERS = new Map([
  [REPORT_TYPE.CSV, new CsvFormatter()],
  [REPORT_TYPE.HTML, new HtmlFormatter()],
]);
const EMPTY_FORMATTER = new EmptyFormatter();

// Admins têm itens acima do limite marcados como prioritários.
function markPriority(user, item) {
  if (user.role === ROLE.ADMIN && item.value > PRIORITY_THRESHOLD) {
    item.priority = true;
  }
}

function isHighlighted(user, item) {
  return user.role === ROLE.ADMIN && Boolean(item.priority);
}

function canSee(user, item) {
  if (user.role === ROLE.ADMIN) return true;
  if (user.role === ROLE.USER) return item.value <= USER_MAX_VALUE;
  return false;
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = FORMATTERS.get(reportType) ?? EMPTY_FORMATTER;
    let report = formatter.header(user);
    let total = 0;

    for (const item of items) {
      markPriority(user, item);
      if (!canSee(user, item)) continue;

      const row = formatter.row(item, user, isHighlighted(user, item));
      if (row !== '') {
        report += row;
        total += item.value;
      }
    }

    report += formatter.footer(total);

    return report.trim();
  }
}
