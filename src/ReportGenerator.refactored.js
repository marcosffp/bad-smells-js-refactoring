const PRIORITY_THRESHOLD = 1000;
const USER_MAX_VALUE = 500;
const ROLE = { ADMIN: 'ADMIN', USER: 'USER' };
const REPORT_TYPE = { CSV: 'CSV', HTML: 'HTML' };

function buildHeader(reportType, user) {
  if (reportType === REPORT_TYPE.CSV) {
    return 'ID,NOME,VALOR,USUARIO\n';
  }
  if (reportType === REPORT_TYPE.HTML) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }
  return '';
}

function buildRow(reportType, user, item, highlighted) {
  if (reportType === REPORT_TYPE.CSV) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }
  if (reportType === REPORT_TYPE.HTML) {
    const style = highlighted ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }
  return '';
}

function buildFooter(reportType, total) {
  if (reportType === REPORT_TYPE.CSV) {
    return `\nTotal,,\n${total},,\n`;
  }
  if (reportType === REPORT_TYPE.HTML) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
  return '';
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
    let report = buildHeader(reportType, user);
    let total = 0;

    for (const item of items) {
      if (user.role === ROLE.ADMIN) {
        if (item.value > PRIORITY_THRESHOLD) {
          item.priority = true;
        }

        const row = buildRow(reportType, user, item, Boolean(item.priority));
        if (row !== '') {
          report += row;
          total += item.value;
        }
      } else if (user.role === ROLE.USER) {
        if (item.value <= USER_MAX_VALUE) {
          const row = buildRow(reportType, user, item, false);
          if (row !== '') {
            report += row;
            total += item.value;
          }
        }
      }
    }

    report += buildFooter(reportType, total);

    return report.trim();
  }
}
