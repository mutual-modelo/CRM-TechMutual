/**
 * ============================================================================
 * SISTEMA: CRM & BACKOFFICE FINANCIERO — ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS
 * MÓDULO 1: ARQUITECTURA DE BASE DE DATOS (SHEETS) Y MOTOR DE LEGAJOS EN DRIVE
 * ARCHIVO: 01_Config_DB_Drive.gs (Apps Script V8)
 * ============================================================================
 */

// Identificador de hoja maestra (si se deja vacío, busca la activa o crea una nueva automáticamente)
var SPREADSHEET_ID = '';

// Operadores oficiales de la Mutual
var OPERADORES_MUTUAL = ['Julian', 'Melina', 'Lucrecia', 'Andrea', 'Valentina', 'Nicolas'];

// Diccionario de Hojas del Sistema (14 Hojas Normalizadas — Edición Enterprise v3.0)
var HOJAS = {
  PADRON: 'Socios_Padron',
  AYUDAS: 'Ayudas_Economicas',
  SEGUIMIENTOS_LIQUIDACIONES: 'Seguimientos_Alertas_Liquidaciones',
  HISTORIAL_GESTIONES: 'Historial_Gestiones_Tramites',
  SUBSIDIOS_CONSUMOS: 'Subsidios_Y_Consumos',
  AUDITORIA_IA_LEGAJOS: 'Auditoria_IA_Legajos',
  COMERCIALIZADORES: 'Comercializadores',
  HISTORIAL_COMISIONES: 'Historial_Comisiones_Comercializador',
  CESIONES: 'Cesiones_Carteras',
  LIQUIDACIONES_COMISIONES: 'Liquidaciones_Comisiones',
  LOGS_IA: 'Logs_Integraciones_IA',
  COMERCIOS_B2B: 'Comercios_Alianzas_B2B',
  PROMOCIONES_POOL: 'Promociones_Pool_Reintegros',
  FIDELIDAD_SELLOS: 'Fidelidad_Sellos_Y_Vouchers',
  TRANSACCIONES_BILLETERA: 'Transacciones_QR_Billetera',
  ADELANTOS_LIQUIDACION: 'Adelantos_Liquidaciones_Comercios'
};

// Logotipo oficial en Base64 para incrustación directa
var LOGO_MUTUAL_BASE64 = '';

/**
 * Obtiene la referencia a la hoja de cálculo maestra
 */
function getSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var savedId = SPREADSHEET_ID || props.getProperty('AMMER_CRM_SS_ID');
  
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {
      Logger.log('Error abriendo spreadsheet por ID: ' + e.message);
    }
  }
  
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    props.setProperty('AMMER_CRM_SS_ID', active.getId());
    return active;
  }
  
  var created = SpreadsheetApp.create('AMMER_CRM_BaseDatos_Oficial');
  props.setProperty('AMMER_CRM_SS_ID', created.getId());
  return created;
}

/**
 * Incluye fragmentos HTML multipartes en templates evaluados
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Formateador seguro de fechas para evitar retorno 'null' a google.script.run
 */
function serializarFecha(valor, incluirHora) {
  if (!valor) return '';
  if (valor instanceof Date) {
    var tz = Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires';
    var formato = incluirHora ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
    return Utilities.formatDate(valor, tz, formato);
  }
  return String(valor);
}

/**
 * Asegura la estructura de las 8 hojas corporativas en Google Sheets
 */
function asegurarEstructuraBD(forzarReinicio) {
  var ss = getSpreadsheet();
  var colorCabecera = '#135596';
  
  var definiciones = [
    {
      nombre: HOJAS.PADRON,
      columnas: [
        'DNI', 'Nro_Socio', 'Apellido_Nombre', 'Fecha_Nacimiento', 'Edad', 'Sexo', 'Domicilio', 'Localidad',
        'Telefono_WhatsApp', 'Email', 'CBU_Alias', 'Banco', 'Organismo', 'Sector_Trabajo', 'Dependencia_Funcion',
        'Condicion_Laboral', 'Legajo_Sueldo', 'Sueldo_Bruto', 'Afectaciones_Ley', 'Afectaciones_Particulares',
        'Sueldo_Neto', 'Margen_Cuota_Disponible', 'Monto_Preaprobado', 'Estado_Cuota_Social', 'Deuda_Cuota_Social',
        'En_Tramite_Jubilacion', 'Detalle_Jubilacion', 'Bloqueado_Legales', 'Detalle_Legales', 'Pagos_Duplicados',
        'Detalle_Pagos_Duplicados', 'Alivio_Financiero', 'Mutuales_Alivio', 'Certificacion_Deuda', 'Detalle_Certificacion',
        'Estado_PEP', 'Detalle_PEP', 'Estado_REPET', 'Detalle_REPET', 'Estado_ARCA_Constancia', 'CUIT_ARCA',
        'Estado_Inhibicion_Judicial', 'Condicion_Previsional', 'Fecha_Auditoria_Normativa',
        'Subsidios_JSON', 'Grupo_Familiar_JSON', 'Carpeta_Drive_ID', 'Carpeta_Drive_URL', 'Originacion', 'Fecha_Alta',
        'Ultima_Actualizacion', 'Operador',
        'Clave_Acceso_Hash', 'Estado_Usuario_App', 'Ultimo_Ingreso_Fecha'
      ]
    },
    {
      nombre: HOJAS.AYUDAS,
      columnas: [
        'ID_Ayuda', 'Nro_Mutuo', 'Fecha_Solicitud', 'Fecha_Liquidacion', 'Periodo_Mes', 'DNI', 'Apellido_Nombre',
        'Linea_Ayuda', 'Organismo', 'Originacion', 'ID_Comercializador', 'Nombre_Comercializador', 'Monto_Solicitado',
        'Monto_Depositado', 'Es_Refinanciacion', 'IDs_Ayudas_Canceladas', 'Deudas_Manuales_JSON', 'Monto_Retenido_Refi',
        'Neto_Efectivo_Entregado', 'Capital_Bruto', 'Gastos_Admin', 'Seguro_Total', 'Intereses_Financieros',
        'Total_A_Devolver', 'Cantidad_Cuotas', 'Valor_Cuota', 'Cuotas_Pagadas', 'Cuotas_Restantes',
        'Saldo_Capital_Restante', 'Saldo_Total_Restante', 'Estado_Tramite', 'Estado_Cobranza', 'Estado_Documentacion',
        'Checklist_Doc_JSON', 'Carpeta_Legajo_URL', 'Archivos_Adjuntos_JSON', 'Plan_Cuotas_JSON', 'Cartera_Titular',
        'ID_Lote_Cesion', 'Fecha_Cesion', 'Observaciones', 'Operador'
      ]
    },
    {
      nombre: HOJAS.SEGUIMIENTOS_LIQUIDACIONES,
      columnas: [
        'ID_Registro', 'Tipo_Entrada', 'Fecha_Hora', 'DNI', 'Apellido_Nombre', 'ID_Ayuda_Relacionada',
        'Subtipo_Tramite', 'Prioridad', 'Fecha_Vencimiento_SLA', 'Estado_Registro', 'Monto_Operacion',
        'Monto_Retenido_Refi', 'Neto_Liquidado', 'Detalle_Gestion', 'Resultado_Proximo_Paso',
        'Operador_Asignado', 'Operador_Creador', 'Notificado_WhatsApp'
      ]
    },
    {
      nombre: HOJAS.COMERCIALIZADORES,
      columnas: [
        'ID_Comercializador', 'Nombre_Estudio_Agente', 'DNI_CUIT', 'Telefono', 'Email', 'CBU_Pago',
        'Base_Calculo_Comision', 'Porcentaje_Comision', 'Estado', 'Fecha_Alta', 'Observaciones'
      ]
    },
    {
      nombre: HOJAS.LIQUIDACIONES_COMISIONES,
      columnas: [
        'ID_Liquidacion', 'Fecha_Emision', 'Periodo_Desde', 'Periodo_Hasta', 'ID_Comercializador', 'Nombre_Comercializador',
        'Cantidad_Ayudas', 'Total_Monto_Solicitado', 'Total_Monto_Depositado', 'Total_Neto_Efectivo', 'Base_Aplicada',
        'Porcentaje_Comision', 'Monto_Comision_Bruta', 'Deducciones_Ajustes', 'Neto_A_Pagar_Comision', 'Estado_Pago',
        'Fecha_Pago', 'Comprobante_Pago_URL', 'IDs_Ayudas_Incluidas_JSON', 'Operador'
      ]
    },
    {
      nombre: HOJAS.CESIONES,
      columnas: [
        'ID_Lote_Cesion', 'Fecha_Cesion', 'Cesionario_Entidad_Destino', 'CUIT_Cesionario', 'Lineas_Incluidas',
        'Cantidad_Creditos_Cedidos', 'Total_Monto_Original', 'Total_Cuotas_Restantes', 'Saldo_Nominal_Cedido',
        'Tasa_Descuento_Aplicada_Pct', 'Precio_Venta_Cartera', 'Modalidad_Cobranza', 'Estado_Cesion',
        'IDs_Ayudas_Cedidas_JSON', 'Contrato_Drive_URL', 'Observaciones', 'Operador'
      ]
    },
    {
      nombre: HOJAS.SUBSIDIOS_CONSUMOS,
      columnas: [
        'ID_Consumo', 'DNI', 'Apellido_Nombre', 'Tipo_Registro', 'Categoria', 'Comercio_Proveedor',
        'Fecha', 'Monto', 'Estado', 'Comprobante_Drive_URL', 'Observaciones', 'Operador'
      ]
    },
    {
      nombre: HOJAS.AUDITORIA_IA_LEGAJOS,
      columnas: [
        'ID_Auditoria', 'DNI', 'Apellido_Nombre', 'ID_Documento_Drive', 'Nombre_Archivo', 'Tipo_Doc',
        'Dictamen_IA', 'Score_Riesgo', 'Fecha_Analisis', 'Comentarios_Tecnicos', 'Datos_Extraidos_JSON', 'Operador'
      ]
    },
    {
      nombre: HOJAS.HISTORIAL_COMISIONES,
      columnas: [
        'ID_Log', 'ID_Comercializador', 'Nombre_Comercializador', 'Fecha_Cambio', 'Comision_Anterior',
        'Comision_Nueva', 'Base_Calculo_Anterior', 'Base_Calculo_Nueva', 'Motivo_Modificacion', 'Operador'
      ]
    },
    {
      nombre: HOJAS.LOGS_IA,
      columnas: [
        'ID_Log', 'Fecha_Hora', 'Canal_Agente', 'Evento_Accion', 'DNI_Relacionado', 'ID_Referencia',
        'Payload_Entrada_JSON', 'Respuesta_Salida_JSON', 'Estado_Ejecucion', 'Latencia_Ms'
      ]
    },
    {
      nombre: HOJAS.COMERCIOS_B2B,
      columnas: [
        'ID_Comercio', 'Nombre_Fantasia', 'Razon_Social', 'CUIT_Responsable', 'Rubro', 'Direccion', 'Localidad',
        'Latitud', 'Longitud', 'Horarios_Atencion', 'Descripcion', 'Promos_Activas_JSON',
        'Telefono_WhatsApp', 'Email', 'CBU_Cobro', 'Alias_CBU', 'Comision_Mutual_Pct', 'Dias_Acreditacion_Normal',
        'Admite_Adelanto_Liquidacion', 'Tasa_Descuento_Adelanto_Pct', 'Planes_Cuotas_Permitidos_JSON',
        'PIN_Comercio_Hash', 'Clave_Acceso_B2B_Hash', 'Estado', 'Estado_Comercio', 'Fecha_Adhesion', 'Monto_Total_Vendido_Historico',
        'Monto_Liquidado_Acumulado', 'Saldo_Pendiente_Liquidacion', 'Observaciones'
      ]
    },
    {
      nombre: HOJAS.PROMOCIONES_POOL,
      columnas: [
        'ID_Promocion', 'Nombre_Campania', 'Rubro_Aplicable', 'ID_Comercio_Exclusivo', 'Porcentaje_Reintegro',
        'Tope_Reintegro_Por_Transaccion', 'Tope_Reintegro_Mensual_Por_Socio', 'Presupuesto_Total_Pool',
        'Presupuesto_Consumido_Pool', 'Fecha_Inicio', 'Fecha_Fin', 'Dias_Semana_Activa_JSON', 'Estado',
        'QR_Estatico_URL', 'Reglas_Legales_Terminos'
      ]
    },
    {
      nombre: HOJAS.FIDELIDAD_SELLOS,
      columnas: [
        'DNI', 'Apellido_Nombre', 'Nro_Socio', 'Cantidad_Sellos_Actuales', 'Meta_Sellos',
        'Total_Ciclos_Completados', 'Puntos_Club_Acumulados', 'Vouchers_Disponibles_JSON',
        'Historial_Sellos_JSON', 'Fecha_Ultimo_Sello', 'Estado_Fidelidad'
      ]
    },
    {
      nombre: HOJAS.TRANSACCIONES_BILLETERA,
      columnas: [
        'ID_Transaccion', 'Fecha_Hora', 'DNI_Socio', 'Apellido_Nombre_Socio', 'ID_Comercio', 'Nombre_Comercio',
        'Rubro', 'Monto_Bruto', 'Porcentaje_Descuento_Mutual', 'Monto_Descuento_Reintegro', 'Monto_Neto_Cobrado',
        'Billetera_Origen', 'Cantidad_Cuotas', 'Valor_Cuota', 'Metodo_Pago', 'ID_Promocion_Aplicada',
        'Estado_Transaccion', 'Estado_Liquidacion_Comercio', 'Fecha_Liquidacion_Estimada',
        'ID_Adelanto_Relacionado', 'Motivo_Desconocimiento', 'Operador'
      ]
    },
    {
      nombre: HOJAS.ADELANTOS_LIQUIDACION,
      columnas: [
        'ID_Adelanto', 'Fecha_Solicitud', 'ID_Comercio', 'Nombre_Comercio', 'Monto_Nominal_Adelantado',
        'Tasa_Descuento_Pct', 'Monto_Descuento_Financiero', 'Monto_Neto_Transferido', 'CBU_Destino',
        'Estado_Adelanto', 'Comprobante_Transferencia_URL', 'IDs_Transacciones_JSON', 'Operador'
      ]
    }
  ];
  
  definiciones.forEach(function(def) {
    var sheet = ss.getSheetByName(def.nombre);
    if (!sheet) {
      sheet = ss.insertSheet(def.nombre);
    }
    
    if (forzarReinicio || sheet.getLastRow() === 0) {
      if (forzarReinicio) sheet.clear();
      sheet.getRange(1, 1, 1, def.columnas.length).setValues([def.columnas]);
      sheet.getRange(1, 1, 1, def.columnas.length)
        .setBackground(colorCabecera)
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  
  return { ok: true, mensaje: 'Base de datos asegurada con éxito en Google Sheets.' };
}

/**
 * Lectura optimizada por lotes basada en nombres de cabecera
 */
function leerHojaComoObjetos(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var rows = [];
  
  for (var i = 1; i < values.length; i++) {
    var fila = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      var cellVal = fila[j];
      if (cellVal instanceof Date) {
        cellVal = serializarFecha(cellVal, headerName.indexOf('Hora') !== -1);
      }
      obj[headerName] = cellVal;
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Escritura optimizada por nombres de columna para evitar índices rígidos
 */
function escribirObjetoEnHojaPorClave(sheet, headers, claveColumna, valorClave, objetoDatos) {
  var lastRow = sheet.getLastRow();
  var indexClave = headers.indexOf(claveColumna);
  var rowIndexTarget = -1;
  
  if (lastRow > 1) {
    var colClaveValues = sheet.getRange(2, indexClave + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < colClaveValues.length; i++) {
      if (String(colClaveValues[i][0]).trim() === String(valorClave).trim()) {
        rowIndexTarget = i + 2;
        break;
      }
    }
  }
  
  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var h = headers[j];
    newRow.push(objetoDatos[h] !== undefined ? objetoDatos[h] : '');
  }
  
  if (rowIndexTarget !== -1) {
    sheet.getRange(rowIndexTarget, 1, 1, headers.length).setValues([newRow]);
    return rowIndexTarget;
  } else {
    sheet.appendRow(newRow);
    return sheet.getLastRow();
  }
}

/**
 * MOTOR DE GOOGLE DRIVE: CARPETAS Y LEGAJOS DIGITALES
 */
function obtenerOCrearCarpetaRaizLegajos() {
  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty('AMMER_ROOT_DRIVE_FOLDER_ID');
  
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      Logger.log('Carpeta no encontrada por ID: ' + e.message);
    }
  }
  
  var nombreRaiz = 'CRM_Mutual_Modelo_Legajos';
  var folders = DriveApp.getFoldersByName(nombreRaiz);
  if (folders.hasNext()) {
    var f = folders.next();
    props.setProperty('AMMER_ROOT_DRIVE_FOLDER_ID', f.getId());
    return f;
  }
  
  var newFolder = DriveApp.createFolder(nombreRaiz);
  props.setProperty('AMMER_ROOT_DRIVE_FOLDER_ID', newFolder.getId());
  return newFolder;
}

function asegurarCarpetaLegajoSocioBackend(dni, apellidoNombre) {
  var root = obtenerOCrearCarpetaRaizLegajos();
  var nombreSub = 'Legajo_' + dni + '_' + String(apellidoNombre).replace(/[/\\?%*:|"<>]/g, '_');
  
  var it = root.getFoldersByName(nombreSub);
  var socioFolder;
  if (it.hasNext()) {
    socioFolder = it.next();
  } else {
    socioFolder = root.createFolder(nombreSub);
  }
  
  // Actualizar en hoja de socios
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.PADRON);
  if (sheet) {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colDni = headers.indexOf('DNI');
    var colId = headers.indexOf('Carpeta_Drive_ID');
    var colUrl = headers.indexOf('Carpeta_Drive_URL');
    
    if (sheet.getLastRow() > 1 && colDni !== -1) {
      var dnis = sheet.getRange(2, colDni + 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < dnis.length; i++) {
        if (String(dnis[i][0]).trim() === String(dni).trim()) {
          var row = i + 2;
          if (colId !== -1) sheet.getRange(row, colId + 1).setValue(socioFolder.getId());
          if (colUrl !== -1) sheet.getRange(row, colUrl + 1).setValue(socioFolder.getUrl());
          break;
        }
      }
    }
  }
  
  return { ok: true, folderId: socioFolder.getId(), folderUrl: socioFolder.getUrl() };
}

function asegurarSubcarpetaAyudaDrive(dni, apellidoNombre, idAyuda, lineaAyuda) {
  var socioRes = asegurarCarpetaLegajoSocioBackend(dni, apellidoNombre);
  var socioFolder = DriveApp.getFolderById(socioRes.folderId);
  var nombreSub = 'Ayuda_' + idAyuda + '_' + String(lineaAyuda).replace(/[/\\?%*:|"<>]/g, '_');
  
  var it = socioFolder.getFoldersByName(nombreSub);
  var ayudaFolder;
  if (it.hasNext()) {
    ayudaFolder = it.next();
  } else {
    ayudaFolder = socioFolder.createFolder(nombreSub);
  }
  
  return { folderId: ayudaFolder.getId(), folderUrl: ayudaFolder.getUrl() };
}

function subirDocumentoLegajoBackend(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  
  try {
    var dni = payload.dni;
    var apellidoNombre = payload.apellidoNombre;
    var idAyuda = payload.idAyuda;
    var tipoDoc = payload.tipoDocumento || 'OTRO';
    var nombreArchivo = payload.nombreArchivo || ('Doc_' + tipoDoc + '_' + dni);
    var mimeType = payload.mimeType || 'application/pdf';
    var rawBase64 = payload.base64Data || '';
    var operador = payload.operador || 'Julian';
    
    // Quitar prefijo data:...;base64,
    var cleanBase64 = rawBase64.replace(/^data:.*?;base64,/, '');
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, mimeType, nombreArchivo);
    
    var destinoFolder;
    if (idAyuda) {
      var subRes = asegurarSubcarpetaAyudaDrive(dni, apellidoNombre, idAyuda, payload.lineaAyuda || 'General');
      destinoFolder = DriveApp.getFolderById(subRes.folderId);
    } else {
      var socioRes = asegurarCarpetaLegajoSocioBackend(dni, apellidoNombre);
      destinoFolder = DriveApp.getFolderById(socioRes.folderId);
    }
    
    var file = destinoFolder.createFile(blob);
    var fileUrl = file.getUrl();
    var fileId = file.getId();
    
    // Si corresponde a una ayuda económica, actualizar checklist y archivos
    if (idAyuda) {
      var ss = getSpreadsheet();
      var sheet = ss.getSheetByName(HOJAS.AYUDAS);
      if (sheet) {
        var ayudas = leerHojaComoObjetos(sheet);
        var ayudaObj = null;
        for (var i = 0; i < ayudas.length; i++) {
          if (String(ayudas[i].ID_Ayuda).trim() === String(idAyuda).trim()) {
            ayudaObj = ayudas[i];
            break;
          }
        }
        
        if (ayudaObj) {
          var checklist = {};
          try { checklist = JSON.parse(ayudaObj.Checklist_Doc_JSON || '{}'); } catch(e){}
          if (tipoDoc in checklist) {
            checklist[tipoDoc] = true;
          }
          
          var archivos = [];
          try { archivos = JSON.parse(ayudaObj.Archivos_Adjuntos_JSON || '[]'); } catch(e){}
          archivos.push({
            idArchivo: fileId,
            nombre: nombreArchivo,
            tipoDocumento: tipoDoc,
            url: fileUrl,
            fechaHora: serializarFecha(new Date(), true),
            operador: operador
          });
          
          // Recalcular estado de documentación
          var faltantes = 0;
          var itemsRequeridos = ['DNI', 'RECIBO', 'CBU', 'MUTUO', 'PAGARE', 'LIBRE_DEUDA'];
          itemsRequeridos.forEach(function(k) {
            if (!checklist[k]) faltantes++;
          });
          
          var nuevoEstadoDoc = 'Legajo Completo';
          if (faltantes > 3) nuevoEstadoDoc = 'Incompleto';
          else if (faltantes > 0) nuevoEstadoDoc = 'En Revisión';
          
          ayudaObj.Checklist_Doc_JSON = JSON.stringify(checklist);
          ayudaObj.Archivos_Adjuntos_JSON = JSON.stringify(archivos);
          ayudaObj.Estado_Documentacion = nuevoEstadoDoc;
          ayudaObj.Carpeta_Legajo_URL = destinoFolder.getUrl();
          
          var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Ayuda', idAyuda, ayudaObj);
        }
      }
    }
    
    return {
      ok: true,
      mensaje: 'Archivo guardado en Legajo con éxito.',
      fileId: fileId,
      fileUrl: fileUrl
    };
  } finally {
    lock.releaseLock();
  }
}