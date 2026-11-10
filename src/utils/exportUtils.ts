export function exportarA_CSV(datos: Record<string, any>[], nombreArchivo: string) {
  if (!datos || datos.length === 0) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  const columnas = Object.keys(datos[0]);
  const filasCSV: string[] = [];

  // Encabezados
  filasCSV.push(columnas.map((col) => `"${col.replace(/"/g, '""')}"`).join(';'));

  // Filas
  datos.forEach((fila) => {
    const valores = columnas.map((col) => {
      let val = fila[col];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      return `"${val.replace(/"/g, '""')}"`;
    });
    filasCSV.push(valores.join(';'));
  });

  const contenidoCSV = '\uFEFF' + filasCSV.join('\r\n');
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function imprimirElemento(idElemento: string) {
  window.print();
}
