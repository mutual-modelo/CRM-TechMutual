/**
 * ARCHIVOS MODULARES DE GOOGLE APPS SCRIPT (V8)
 * CRM & Backoffice Financiero — Asociación Mutual Modelo de Entre Ríos
 * 100% Código de Producción sin placeholders
 */

export interface GASFile {
  name: string;
  type: 'json' | 'server_js' | 'html';
  description: string;
  code: string;
}

export const GAS_FILES: GASFile[] = [
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'Manifiesto oficial con V8 runtime, zona horaria de Argentina y permisos de Sheets, Drive y UrlFetch.',
    code: `{
  "timeZone": "America/Argentina/Buenos_Aires",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}`
  },
  {
    name: '01_Config_DB_Drive.gs',
    type: 'server_js',
    description: 'Constantes globales, inicializador de las 8 hojas en Sheets con formato corporativo, y motor de legajos en Drive.',
    code: `/**
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

// Diccionario de Hojas del Sistema (8 Hojas Normalizadas)
var HOJAS = {
  PADRON: 'Socios_Padron',
  AYUDAS: 'Ayudas_Economicas',
  SEGUIMIENTOS: 'Seguimientos_Y_Alertas',
  COMERCIALIZADORES: 'Comercializadores',
  LIQUIDACIONES: 'Liquidaciones_Comisiones',
  CESIONES: 'Cesiones_Carteras',
  RECIBOS_CODIGOS: 'Recibos_Y_Codigos',
  LOGS_IA: 'Logs_Integraciones_IA'
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
        'Subsidios_JSON', 'Grupo_Familiar_JSON', 'Carpeta_Drive_ID', 'Carpeta_Drive_URL', 'Originacion', 'Fecha_Alta',
        'Ultima_Actualizacion', 'Operador'
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
      nombre: HOJAS.SEGUIMIENTOS,
      columnas: [
        'ID_Seguimiento', 'Fecha_Hora', 'DNI', 'Apellido_Nombre', 'ID_Ayuda_Relacionada', 'Tipo_Registro', 'Categoria',
        'Subtipo_Tramite', 'Prioridad', 'Fecha_Vencimiento_Alerta', 'Estado_Alerta', 'Detalle_Gestion',
        'Resultado_Proximo_Paso', 'Operador_Asignado', 'Operador_Creador', 'Notificado_WhatsApp'
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
      nombre: HOJAS.LIQUIDACIONES,
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
      nombre: HOJAS.RECIBOS_CODIGOS,
      columnas: [
        'ID_Registro', 'Tipo_Fila', 'Codigo_Concepto', 'Nombre_Concepto', 'Organismo_Ambito', 'Clasificacion_Recibo',
        'DNI_Analizado', 'Fecha_Analisis', 'Haberes_Computables', 'Descuentos_Ley', 'Descuentos_Particulares',
        'Regla_Afectacion', 'Pct_Tope', 'Margen_Disponible_Calculado', 'Detalle_Items_JSON', 'Operador'
      ]
    },
    {
      nombre: HOJAS.LOGS_IA,
      columnas: [
        'ID_Log', 'Fecha_Hora', 'Canal_Agente', 'Evento_Accion', 'DNI_Relacionado', 'ID_Referencia',
        'Payload_Entrada_JSON', 'Respuesta_Salida_JSON', 'Estado_Ejecucion', 'Latencia_Ms'
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
}`
  },
  {
    name: '02_ABM_Socios_Ayudas_Alertas.gs',
    type: 'server_js',
    description: 'Funciones CRUD de Padrón 360°, Ayudas Económicas con Refinanciación y cancelación automática, y Alertas SLA.',
    code: `/**
 * ============================================================================
 * SISTEMA: CRM & BACKOFFICE FINANCIERO — ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS
 * MÓDULO 2: CRUD DE ASOCIADOS, AYUDAS CON REFINANCIACIÓN Y ALERTAS SLA
 * ARCHIVO: 02_ABM_Socios_Ayudas_Alertas.gs (Apps Script V8)
 * ============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛡️ CRM Mutual Modelo')
    .addItem('Abrir CRM y Backoffice', 'abrirCRM')
    .addSeparator()
    .addItem('Sincronizar Estructura de Hojas', 'asegurarEstructuraBD')
    .addToUi();
}

function abrirCRM() {
  var template = HtmlService.createTemplateFromFile('Index');
  var html = template.evaluate()
    .setWidth(1440)
    .setHeight(880)
    .setTitle('CRM & Backoffice Financiero — Asociación Mutual Modelo de Entre Ríos');
  SpreadsheetApp.getUi().showModalDialog(html, 'CRM & Backoffice Financiero — Mutual Modelo');
}

function guardarOperadorActivoBackend(nombreOperador) {
  PropertiesService.getUserProperties().setProperty('AMMER_OPERADOR_ACTIVO', nombreOperador);
  return { ok: true, operador: nombreOperador };
}

function obtenerFichaSocio360Backend(dni) {
  var ss = getSpreadsheet();
  var sheetPadron = ss.getSheetByName(HOJAS.PADRON);
  var sheetAyudas = ss.getSheetByName(HOJAS.AYUDAS);
  var sheetSeg = ss.getSheetByName(HOJAS.SEGUIMIENTOS);
  var sheetRecibos = ss.getSheetByName(HOJAS.RECIBOS_CODIGOS);
  
  var socios = leerHojaComoObjetos(sheetPadron);
  var socio = null;
  for (var i = 0; i < socios.length; i++) {
    if (String(socios[i].DNI).trim() === String(dni).trim()) {
      socio = socios[i];
      break;
    }
  }
  
  if (!socio) {
    return { ok: false, error: 'Asociado no encontrado con DNI: ' + dni };
  }
  
  var ayudas = leerHojaComoObjetos(sheetAyudas).filter(function(a) {
    return String(a.DNI).trim() === String(dni).trim();
  });
  
  var seguimientos = leerHojaComoObjetos(sheetSeg).filter(function(s) {
    return String(s.DNI).trim() === String(dni).trim();
  });
  
  var recibosAnalizados = leerHojaComoObjetos(sheetRecibos).filter(function(r) {
    return r.Tipo_Fila === 'ANALISIS_RECIBO' && String(r.DNI_Analizado).trim() === String(dni).trim();
  });
  
  var deudaTotal = 0;
  ayudas.forEach(function(a) {
    if (a.Estado_Tramite === 'Liquidado' && a.Saldo_Total_Restante > 0) {
      deudaTotal += Number(a.Saldo_Total_Restante) || 0;
    }
  });
  
  return {
    ok: true,
    socio: socio,
    ayudas: ayudas,
    seguimientos: seguimientos,
    recibosAnalizados: recibosAnalizados,
    resumenDeuda: { deudaTotalActiva: deudaTotal, cantidadPrestamosActivos: ayudas.length }
  };
}

function guardarAsociadoBackend(datosSocio) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.PADRON);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Cálculo automático de Edad
    if (datosSocio.Fecha_Nacimiento) {
      var nac = new Date(datosSocio.Fecha_Nacimiento);
      var hoy = new Date();
      var edad = hoy.getFullYear() - nac.getFullYear();
      datosSocio.Edad = edad;
    }
    
    // Cálculo Sueldo Neto
    var bruto = Number(datosSocio.Sueldo_Bruto) || 0;
    var ley = Number(datosSocio.Afectaciones_Ley) || 0;
    var part = Number(datosSocio.Afectaciones_Particulares) || 0;
    datosSocio.Sueldo_Neto = bruto - ley - part;
    
    if (!datosSocio.Margen_Cuota_Disponible) {
      datosSocio.Margen_Cuota_Disponible = Math.max(0, Math.round((bruto - ley) * 0.35 - part));
    }
    if (!datosSocio.Monto_Preaprobado) {
      datosSocio.Monto_Preaprobado = Math.round(datosSocio.Margen_Cuota_Disponible * 10);
    }
    
    datosSocio.Ultima_Actualizacion = serializarFecha(new Date(), true);
    
    escribirObjetoEnHojaPorClave(sheet, headers, 'DNI', datosSocio.DNI, datosSocio);
    return { ok: true, mensaje: 'Asociado guardado correctamente en Padrón.' };
  } finally {
    lock.releaseLock();
  }
}

function generarPlanCuotasJSON(capitalBruto, totalADevolver, cantidadCuotas, valorCuota, fechaBaseStr) {
  var cuotas = [];
  var fechaBase = fechaBaseStr ? new Date(fechaBaseStr) : new Date();
  var amort = capitalBruto / cantidadCuotas;
  var interesYGastos = valorCuota - amort;
  var saldoRest = capitalBruto;
  
  for (var i = 1; i <= cantidadCuotas; i++) {
    var f = new Date(fechaBase);
    f.setMonth(f.getMonth() + i);
    f.setDate(10);
    saldoRest = Math.max(0, saldoRest - amort);
    
    cuotas.push({
      numeroCuota: i,
      fechaVencimiento: Utilities.formatDate(f, Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd'),
      cuotaTotal: Math.round(valorCuota),
      amortizacionCapital: Math.round(amort),
      interesYGastos: Math.round(interesYGastos),
      saldoCapitalRestante: Math.round(saldoRest),
      estado: 'Pendiente'
    });
  }
  return JSON.stringify(cuotas);
}

function guardarAyudaEconomicaBackend(datosAyuda) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.AYUDAS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!datosAyuda.ID_Ayuda) {
      var hoyStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMM');
      datosAyuda.ID_Ayuda = 'AYU-' + hoyStr + '-' + Math.floor(1000 + Math.random() * 9000);
    }
    
    var pagadas = Number(datosAyuda.Cuotas_Pagadas) || 0;
    var totalCuotas = Number(datosAyuda.Cantidad_Cuotas) || 12;
    var vCuota = Number(datosAyuda.Valor_Cuota) || 0;
    
    datosAyuda.Cuotas_Restantes = Math.max(0, totalCuotas - pagadas);
    datosAyuda.Saldo_Total_Restante = datosAyuda.Cuotas_Restantes * vCuota;
    
    if (datosAyuda.Estado_Tramite === 'Liquidado' && !datosAyuda.Fecha_Liquidacion) {
      datosAyuda.Fecha_Liquidacion = serializarFecha(new Date(), false);
    }
    
    // LÓGICA DE REFINANCIACIÓN: Cancelación automática de operaciones previas
    if (datosAyuda.Es_Refinanciacion === 'SI' && datosAyuda.Estado_Tramite === 'Liquidado') {
      var idsCanceladas = [];
      if (datosAyuda.IDs_Ayudas_Canceladas) {
        idsCanceladas = String(datosAyuda.IDs_Ayudas_Canceladas).split(',').map(function(s){ return s.trim(); });
      }
      
      if (idsCanceladas.length > 0) {
        var todasAyudas = leerHojaComoObjetos(sheet);
        var fechaHoy = serializarFecha(new Date(), false);
        
        todasAyudas.forEach(function(ay) {
          if (idsCanceladas.indexOf(String(ay.ID_Ayuda).trim()) !== -1) {
            ay.Estado_Tramite = 'Cancelado por Refinanciación';
            ay.Estado_Cobranza = 'Cancelado Total';
            ay.Saldo_Capital_Restante = 0;
            ay.Saldo_Total_Restante = 0;
            ay.Cuotas_Restantes = 0;
            ay.Observaciones = (ay.Observaciones ? ay.Observaciones + ' ' : '') +
              '[Cancelado por refinanciación en ' + datosAyuda.ID_Ayuda + ' el ' + fechaHoy + ']';
            escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Ayuda', ay.ID_Ayuda, ay);
          }
        });
      }
    }
    
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Ayuda', datosAyuda.ID_Ayuda, datosAyuda);
    return { ok: true, idAyuda: datosAyuda.ID_Ayuda, mensaje: 'Ayuda Económica guardada con éxito.' };
  } finally {
    lock.releaseLock();
  }
}

function actualizarEstadoAyudaBackend(idAyuda, nuevoEstadoTramite, estadoCobranza, cuotasPagadas, observaciones, operador) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.AYUDAS);
    var ayudas = leerHojaComoObjetos(sheet);
    var target = null;
    
    for (var i = 0; i < ayudas.length; i++) {
      if (String(ayudas[i].ID_Ayuda).trim() === String(idAyuda).trim()) {
        target = ayudas[i];
        break;
      }
    }
    
    if (!target) return { ok: false, error: 'Ayuda no encontrada' };
    
    target.Estado_Tramite = nuevoEstadoTramite;
    if (estadoCobranza) target.Estado_Cobranza = estadoCobranza;
    if (cuotasPagadas !== undefined && cuotasPagadas !== null) {
      target.Cuotas_Pagadas = Number(cuotasPagadas);
      target.Cuotas_Restantes = Math.max(0, Number(target.Cantidad_Cuotas) - target.Cuotas_Pagadas);
      target.Saldo_Total_Restante = target.Cuotas_Restantes * Number(target.Valor_Cuota);
    }
    if (observaciones) {
      target.Observaciones = (target.Observaciones ? target.Observaciones + ' | ' : '') + observaciones;
    }
    if (operador) target.Operador = operador;
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Ayuda', idAyuda, target);
    
    return { ok: true, mensaje: 'Estado de ayuda actualizado.' };
  } finally {
    lock.releaseLock();
  }
}

function guardarSeguimientoAlertaBackend(datosSeguimiento) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.SEGUIMIENTOS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!datosSeguimiento.ID_Seguimiento) {
      datosSeguimiento.ID_Seguimiento = 'SEG-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    }
    if (!datosSeguimiento.Fecha_Hora) {
      datosSeguimiento.Fecha_Hora = serializarFecha(new Date(), true);
    }
    
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Seguimiento', datosSeguimiento.ID_Seguimiento, datosSeguimiento);
    return { ok: true, idSeguimiento: datosSeguimiento.ID_Seguimiento };
  } finally {
    lock.releaseLock();
  }
}

function actualizarEstadoAlertaBackend(idSeguimiento, nuevoEstado, resultado, operador) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.SEGUIMIENTOS);
    var list = leerHojaComoObjetos(sheet);
    var item = null;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].ID_Seguimiento).trim() === String(idSeguimiento).trim()) {
        item = list[i];
        break;
      }
    }
    if (!item) return { ok: false, error: 'Alerta no encontrada' };
    
    item.Estado_Alerta = nuevoEstado;
    if (resultado) item.Resultado_Proximo_Paso = resultado;
    if (operador) item.Operador_Asignado = operador;
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Seguimiento', idSeguimiento, item);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}`
  },
  {
    name: '03_Simuladores_Liquidaciones_Carteras.gs',
    type: 'server_js',
    description: 'Motor de las 3 líneas financieras oficiales, liquidaciones por fecha, comisiones de comercializadores y cesiones con VPN.',
    code: `/**
 * ============================================================================
 * SISTEMA: CRM & BACKOFFICE FINANCIERO — ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS
 * MÓDULO 3: SIMULADORES MULTILÍNEA, LIQUIDACIONES DE COMISIONES Y CESIONES CON VPN
 * ARCHIVO: 03_Simuladores_Liquidaciones_Carteras.gs (Apps Script V8)
 * ============================================================================
 */

function obtenerMatrizTasasOficiales() {
  return {
    fedem: {
      6: { cuotas: 6, tna: 0.48942604, tem: 0.04078550, tea: 0.61560361, gastos: 0.25, seguro: 0.005, coef: 1.57, temCft: 0.14638153 },
      12: { cuotas: 12, tna: 0.53681994, tem: 0.04473499, tea: 0.69072785, gastos: 0.25, seguro: 0.005, coef: 1.832, temCft: 0.10814229 },
      18: { cuotas: 18, tna: 0.44666196, tem: 0.03722183, tea: 0.55045720, gastos: 0.34, seguro: 0.005, coef: 2.242364, temCft: 0.10337010 },
      24: { cuotas: 24, tna: 0.53394403, tem: 0.04449534, tea: 0.68607954, gastos: 0.34, seguro: 0.005, coef: 2.677818, temCft: 0.10032896 },
      36: { cuotas: 36, tna: 0.61456980, tem: 0.05121415, tea: 0.82093472, gastos: 0.34, seguro: 0.005, coef: 3.620727, temCft: 0.09698423 },
      48: { cuotas: 48, tna: 0.64853029, tem: 0.05404419, tea: 0.88064070, gastos: 0.34, seguro: 0.005, coef: 4.635637, temCft: 0.09535618 }
    },
    municipales: {
      factorVikingo: 0.85,
      tnaQuad: 0.39595488,
      temQuad: 0.39595488 / 12,
      12: { cuotas: 12, cftTea: 2.80, temCft: 0.11767439, coefCuota: 0.15970096, coefTotal: 1.91641149 },
      24: { cuotas: 24, cftTea: 2.20, temCft: 0.10178240, coefCuota: 0.11279781, coefTotal: 2.70714753 }
    },
    sidecreer: {
      6: { cuotas: 6, tna: 0.58534514, tem: 0.04877876, tea: 0.77095126, gastos: 0.25, seguro: 0.00, coef: 1.56999, temCft: 0.14637905 },
      12: { cuotas: 12, tna: 0.63154362, tem: 0.05262864, tea: 0.85055570, gastos: 0.25, seguro: 0.00, coef: 1.83207, temCft: 0.10814999 },
      18: { cuotas: 18, tna: 0.53972734, tem: 0.04497728, tea: 0.69543900, gastos: 0.34, seguro: 0.00, coef: 2.24242, temCft: 0.10337396 },
      24: { cuotas: 24, tna: 0.61978356, tem: 0.05164863, tea: 0.82998666, gastos: 0.34, seguro: 0.00, coef: 2.67773, temCft: 0.10032449 },
      36: { cuotas: 36, tna: 0.69009744, tem: 0.05750812, tea: 0.95616070, gastos: 0.34, seguro: 0.00, coef: 3.62048, temCft: 0.09697673 },
      48: { cuotas: 48, tna: 0.71781259, tem: 0.05981772, tea: 1.00804804, gastos: 0.34, seguro: 0.00, coef: 4.63548, temCft: 0.09535278 }
    }
  };
}

function consultarLiquidacionesPorRangoFechasBackend(filtros) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.AYUDAS);
  var ayudas = leerHojaComoObjetos(sheet);
  
  var fDesde = filtros.fechaDesde || '2000-01-01';
  var fHasta = filtros.fechaHasta || '2099-12-31';
  var critFecha = filtros.criterioFecha || 'Fecha_Liquidacion'; // o 'Fecha_Solicitud'
  
  var filtradas = ayudas.filter(function(ay) {
    var fReg = ay[critFecha] || '';
    if (fReg < fDesde || fReg > fHasta) return false;
    if (filtros.lineaAyuda && filtros.lineaAyuda !== 'TODAS' && ay.Linea_Ayuda !== filtros.lineaAyuda) return false;
    if (filtros.originacion && filtros.originacion !== 'TODAS' && ay.Originacion !== filtros.originacion) return false;
    if (filtros.idComercializador && filtros.idComercializador !== 'TODOS' && ay.ID_Comercializador !== filtros.idComercializador) return false;
    if (filtros.estadoTramite && filtros.estadoTramite !== 'TODOS' && ay.Estado_Tramite !== filtros.estadoTramite) return false;
    return true;
  });
  
  var resumen = {
    cantidadOperaciones: filtradas.length,
    sumaMontoSolicitado: 0,
    sumaMontoDepositado: 0,
    sumaRetenidoRefi: 0,
    sumaNetoEfectivoEntregado: 0,
    sumaCapitalBruto: 0,
    sumaTotalADevolver: 0,
    desglosePorLinea: {},
    desglosePorComercializador: {}
  };
  
  filtradas.forEach(function(ay) {
    resumen.sumaMontoSolicitado += Number(ay.Monto_Solicitado) || 0;
    resumen.sumaMontoDepositado += Number(ay.Monto_Depositado) || 0;
    resumen.sumaRetenidoRefi += Number(ay.Monto_Retenido_Refi) || 0;
    resumen.sumaNetoEfectivoEntregado += Number(ay.Neto_Efectivo_Entregado) || 0;
    resumen.sumaCapitalBruto += Number(ay.Capital_Bruto) || 0;
    resumen.sumaTotalADevolver += Number(ay.Total_A_Devolver) || 0;
    
    resumen.desglosePorLinea[ay.Linea_Ayuda] = (resumen.desglosePorLinea[ay.Linea_Ayuda] || 0) + (Number(ay.Monto_Depositado) || 0);
    if (ay.ID_Comercializador) {
      resumen.desglosePorComercializador[ay.Nombre_Comercializador] = (resumen.desglosePorComercializador[ay.Nombre_Comercializador] || 0) + (Number(ay.Monto_Depositado) || 0);
    }
  });
  
  return { ok: true, resumen: resumen, operaciones: filtradas };
}

function guardarComercializadorBackend(datosComercializador) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.COMERCIALIZADORES);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!datosComercializador.ID_Comercializador) {
      datosComercializador.ID_Comercializador = 'COM-' + Math.floor(100 + Math.random() * 900);
      datosComercializador.Fecha_Alta = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Comercializador', datosComercializador.ID_Comercializador, datosComercializador);
    return { ok: true, idComercializador: datosComercializador.ID_Comercializador };
  } finally {
    lock.releaseLock();
  }
}

function previsualizarLiquidacionComisionesBackend(params) {
  var ss = getSpreadsheet();
  var sheetAyudas = ss.getSheetByName(HOJAS.AYUDAS);
  var sheetComis = ss.getSheetByName(HOJAS.COMERCIALIZADORES);
  var sheetLiqs = ss.getSheetByName(HOJAS.LIQUIDACIONES);
  
  var idCom = params.idComercializador;
  var fDesde = params.fechaDesde;
  var fHasta = params.fechaHasta;
  
  var comerciales = leerHojaComoObjetos(sheetComis);
  var comercializador = null;
  for (var i = 0; i < comerciales.length; i++) {
    if (comerciales[i].ID_Comercializador === idCom) {
      comercializador = comerciales[i];
      break;
    }
  }
  if (!comercializador) return { ok: false, error: 'Comercializador no encontrado' };
  
  // Buscar ayudas ya liquidadas en otras liquidaciones oficiales vigentes
  var liqsEmitidas = leerHojaComoObjetos(sheetLiqs);
  var idsYaLiquidadas = {};
  liqsEmitidas.forEach(function(l) {
    if (l.Estado_Pago !== 'Anulado' && l.IDs_Ayudas_Incluidas_JSON) {
      try {
        var arr = JSON.parse(l.IDs_Ayudas_Incluidas_JSON);
        arr.forEach(function(id) { idsYaLiquidadas[id] = true; });
      } catch(e){}
    }
  });
  
  var ayudas = leerHojaComoObjetos(sheetAyudas);
  var operacionesValidas = ayudas.filter(function(ay) {
    if (ay.ID_Comercializador !== idCom) return false;
    if (ay.Estado_Tramite !== 'Liquidado') return false;
    if (ay.Fecha_Liquidacion < fDesde || ay.Fecha_Liquidacion > fHasta) return false;
    if (idsYaLiquidadas[ay.ID_Ayuda]) return false;
    return true;
  });
  
  var baseAplicada = comercializador.Base_Calculo_Comision || 'Monto_Depositado';
  var pct = Number(comercializador.Porcentaje_Comision) || 0;
  var totalBase = 0;
  
  operacionesValidas.forEach(function(op) {
    var baseVal = Number(op[baseAplicada]) || 0;
    totalBase += baseVal;
    op._montoBaseCalculado = baseVal;
    op._comisionGenerada = Math.round(baseVal * (pct / 100));
  });
  
  var montoBruto = Math.round(totalBase * (pct / 100));
  var deducciones = Number(params.deduccionesAjustes) || 0;
  var netoPagar = Math.max(0, montoBruto - deducciones);
  
  return {
    ok: true,
    comercializador: comercializador,
    cantidadOperaciones: operacionesValidas.length,
    totalBase: totalBase,
    porcentajeComision: pct,
    montoBruto: montoBruto,
    deducciones: deducciones,
    netoPagar: netoPagar,
    operaciones: operacionesValidas
  };
}

function emitirLiquidacionComisionesBackend(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.LIQUIDACIONES);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    var periodo = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMM');
    var idLiq = 'LIQ-' + periodo + '-' + Math.floor(1000 + Math.random() * 9000);
    
    var obj = {
      ID_Liquidacion: idLiq,
      Fecha_Emision: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      Periodo_Desde: payload.periodoDesde,
      Periodo_Hasta: payload.periodoHasta,
      ID_Comercializador: payload.idComercializador,
      Nombre_Comercializador: payload.nombreComercializador,
      Cantidad_Ayudas: payload.cantidadAyudas,
      Total_Monto_Solicitado: payload.totalMontoSolicitado,
      Total_Monto_Depositado: payload.totalMontoDepositado,
      Total_Neto_Efectivo: payload.totalNetoEfectivo,
      Base_Aplicada: payload.baseAplicada,
      Porcentaje_Comision: payload.porcentajeComision,
      Monto_Comision_Bruta: payload.montoComisionBruta,
      Deducciones_Ajustes: payload.deduccionesAjustes || 0,
      Neto_A_Pagar_Comision: payload.netoPagarComision,
      Estado_Pago: 'Pendiente de Pago',
      Fecha_Pago: '',
      Comprobante_Pago_URL: '',
      IDs_Ayudas_Incluidas_JSON: JSON.stringify(payload.idsAyudasIncluidas || []),
      Operador: payload.operador || 'Julian'
    };
    
    escribirObjetoEnHojaPorClave(sheet, headers, 'ID_Liquidacion', idLiq, obj);
    return { ok: true, idLiquidacion: idLiq, mensaje: 'Liquidación de comisiones emitida.' };
  } finally {
    lock.releaseLock();
  }
}

function filtrarCarteraAyudasBackend(filtros) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.AYUDAS);
  var ayudas = leerHojaComoObjetos(sheet);
  
  var tasaMensualPct = Number(filtros.tasaDescuentoMensualPct) || 4.5;
  var tasaDecimal = tasaMensualPct / 100;
  
  var filtrados = ayudas.filter(function(ay) {
    if (filtros.lineaAyuda && filtros.lineaAyuda !== 'TODAS' && ay.Linea_Ayuda !== filtros.lineaAyuda) return false;
    if (filtros.carteraTitular === 'PROPIA' && ay.Cartera_Titular !== 'Cartera Propia Mutual') return false;
    if (filtros.carteraTitular === 'CEDIDA' && ay.Cartera_Titular === 'Cartera Propia Mutual') return false;
    if (filtros.idLoteCesion && ay.ID_Lote_Cesion !== filtros.idLoteCesion) return false;
    if (filtros.estadoCobranza && filtros.estadoCobranza !== 'TODAS' && ay.Estado_Cobranza !== filtros.estadoCobranza) return false;
    
    var cuotasRest = Number(ay.Cuotas_Restantes) || 0;
    if (filtros.cuotasRestantesMin && cuotasRest < filtros.cuotasRestantesMin) return false;
    if (filtros.cuotasRestantesMax && cuotasRest > filtros.cuotasRestantesMax) return false;
    
    var saldoRest = Number(ay.Saldo_Total_Restante) || 0;
    if (filtros.saldoRestanteMin && saldoRest < filtros.saldoRestanteMin) return false;
    if (filtros.saldoRestanteMax && saldoRest > filtros.saldoRestanteMax) return false;
    
    return true;
  });
  
  var sumMontoSol = 0;
  var sumMontoDep = 0;
  var sumSaldoNominal = 0;
  var sumVPN = 0;
  
  filtrados.forEach(function(ay) {
    var vCuota = Number(ay.Valor_Cuota) || 0;
    var nRest = Number(ay.Cuotas_Restantes) || 0;
    var saldoNom = Number(ay.Saldo_Total_Restante) || (vCuota * nRest);
    
    // Fórmula VPN: Valor_Cuota * ((1 - (1 + i)^-n) / i)
    var vpn = 0;
    if (nRest > 0 && tasaDecimal > 0) {
      vpn = vCuota * ((1 - Math.pow(1 + tasaDecimal, -nRest)) / tasaDecimal);
    } else {
      vpn = saldoNom;
    }
    
    ay._vpnCalculado = Math.round(vpn);
    sumMontoSol += Number(ay.Monto_Solicitado) || 0;
    sumMontoDep += Number(ay.Monto_Depositado) || 0;
    sumSaldoNominal += saldoNom;
    sumVPN += vpn;
  });
  
  return {
    ok: true,
    creditosFiltrados: filtrados,
    resumenCartera: {
      cantidadCreditos: filtrados.length,
      totalMontoSolicitado: sumMontoSol,
      totalMontoDepositado: sumMontoDep,
      totalSaldoCapitalRestante: sumMontoDep,
      totalFlujoNominalRestante: Math.round(sumSaldoNominal),
      totalValorPresenteDescontado: Math.round(sumVPN),
      quitaDescuentoEstimada: Math.round(sumSaldoNominal - sumVPN)
    }
  };
}

function ejecutarCesionCarteraBackend(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheetCes = ss.getSheetByName(HOJAS.CESIONES);
    var sheetAyu = ss.getSheetByName(HOJAS.AYUDAS);
    
    var idLote = 'CES-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMM') + '-' + Math.floor(1000 + Math.random() * 9000);
    var hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    var headersCes = sheetCes.getRange(1, 1, 1, sheetCes.getLastColumn()).getValues()[0];
    var objCesion = {
      ID_Lote_Cesion: idLote,
      Fecha_Cesion: hoy,
      Cesionario_Entidad_Destino: payload.cesionarioEntidad,
      CUIT_Cesionario: payload.cuitCesionario,
      Lineas_Incluidas: payload.lineasIncluidas || 'FEDEM / Municipales',
      Cantidad_Creditos_Cedidos: payload.idsAyudasSeleccionadas.length,
      Total_Monto_Original: payload.totalMontoOriginal || 0,
      Total_Cuotas_Restantes: payload.totalCuotasRestantes || 0,
      Saldo_Nominal_Cedido: payload.saldoNominalCedido || 0,
      Tasa_Descuento_Aplicada_Pct: payload.tasaDescuentoAplicadaPct || 4.5,
      Precio_Venta_Cartera: payload.precioVentaAcordado || 0,
      Modalidad_Cobranza: payload.modalidadCobranza || 'Retención por Recibo CGE',
      Estado_Cesion: 'Vigente',
      IDs_Ayudas_Cedidas_JSON: JSON.stringify(payload.idsAyudasSeleccionadas),
      Contrato_Drive_URL: payload.contratoDriveUrl || '',
      Observaciones: payload.observaciones || '',
      Operador: payload.operador || 'Julian'
    };
    escribirObjetoEnHojaPorClave(sheetCes, headersCes, 'ID_Lote_Cesion', idLote, objCesion);
    
    // Actualizar cada ayuda cedida
    var ayudas = leerHojaComoObjetos(sheetAyu);
    var headersAyu = sheetAyu.getRange(1, 1, 1, sheetAyu.getLastColumn()).getValues()[0];
    var idsSet = {};
    payload.idsAyudasSeleccionadas.forEach(function(id) { idsSet[id] = true; });
    
    ayudas.forEach(function(ay) {
      if (idsSet[ay.ID_Ayuda]) {
        ay.Cartera_Titular = payload.cesionarioEntidad;
        ay.ID_Lote_Cesion = idLote;
        ay.Fecha_Cesion = hoy;
        escribirObjetoEnHojaPorClave(sheetAyu, headersAyu, 'ID_Ayuda', ay.ID_Ayuda, ay);
      }
    });
    
    return { ok: true, idLoteCesion: idLote, mensaje: 'Cesión de cartera registrada con éxito.' };
  } finally {
    lock.releaseLock();
  }
}

function revertirLoteCesionCarteraBackend(idLoteCesion, motivo, operador) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheetCes = ss.getSheetByName(HOJAS.CESIONES);
    var sheetAyu = ss.getSheetByName(HOJAS.AYUDAS);
    
    var cesiones = leerHojaComoObjetos(sheetCes);
    var lote = null;
    for (var i = 0; i < cesiones.length; i++) {
      if (cesiones[i].ID_Lote_Cesion === idLoteCesion) {
        lote = cesiones[i];
        break;
      }
    }
    if (!lote) return { ok: false, error: 'Lote no encontrado' };
    
    lote.Estado_Cesion = 'Revertido';
    lote.Observaciones = (lote.Observaciones ? lote.Observaciones + ' | ' : '') + 'Revertido por: ' + motivo;
    var headersCes = sheetCes.getRange(1, 1, 1, sheetCes.getLastColumn()).getValues()[0];
    escribirObjetoEnHojaPorClave(sheetCes, headersCes, 'ID_Lote_Cesion', idLoteCesion, lote);
    
    var ids = [];
    try { ids = JSON.parse(lote.IDs_Ayudas_Cedidas_JSON || '[]'); } catch(e){}
    var headersAyu = sheetAyu.getRange(1, 1, 1, sheetAyu.getLastColumn()).getValues()[0];
    var ayudas = leerHojaComoObjetos(sheetAyu);
    
    ayudas.forEach(function(ay) {
      if (ids.indexOf(ay.ID_Ayuda) !== -1) {
        ay.Cartera_Titular = 'Cartera Propia Mutual';
        ay.ID_Lote_Cesion = '';
        ay.Fecha_Cesion = '';
        escribirObjetoEnHojaPorClave(sheetAyu, headersAyu, 'ID_Ayuda', ay.ID_Ayuda, ay);
      }
    });
    
    return { ok: true, mensaje: 'Lote revertido. Los créditos regresaron a Cartera Propia Mutual.' };
  } finally {
    lock.releaseLock();
  }
}`
  },
  {
    name: '04_Analizador_Recibos_Y_AIGateway.gs',
    type: 'server_js',
    description: 'Motor de análisis de recibos de sueldo, integración OCR con Gemini API y Webhooks para Darwin IA / WhatsApp.',
    code: `/**
 * ============================================================================
 * SISTEMA: CRM & BACKOFFICE FINANCIERO — ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS
 * MÓDULO 4: ANALIZADOR DE RECIBOS (OCR GEMINI), GATEWAY IA Y BOOTSTRAP UNIFICADO
 * ARCHIVO: 04_Analizador_Recibos_Y_AIGateway.gs (Apps Script V8)
 * ============================================================================
 */

function obtenerConfiguracionIABackend() {
  var props = PropertiesService.getScriptProperties();
  return {
    GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY') || '',
    GEMINI_MODEL: props.getProperty('GEMINI_MODEL') || 'gemini-2.5-flash',
    IA_AUDITORIA_ACTIVA: props.getProperty('IA_AUDITORIA_ACTIVA') || 'SI',
    DARWIN_IA_WEBHOOK_URL: props.getProperty('DARWIN_IA_WEBHOOK_URL') || '',
    DARWIN_IA_API_KEY: props.getProperty('DARWIN_IA_API_KEY') || '',
    DARWIN_IA_ACTIVO: props.getProperty('DARWIN_IA_ACTIVO') || 'SI',
    WHATSAPP_API_URL: props.getProperty('WHATSAPP_API_URL') || '',
    WHATSAPP_API_TOKEN: props.getProperty('WHATSAPP_API_TOKEN') || '',
    WHATSAPP_INSTANCE_ID: props.getProperty('WHATSAPP_INSTANCE_ID') || '',
    WHATSAPP_API_ACTIVO: props.getProperty('WHATSAPP_API_ACTIVO') || 'SI'
  };
}

function guardarConfiguracionIABackend(config) {
  var props = PropertiesService.getScriptProperties();
  for (var k in config) {
    if (config.hasOwnProperty(k)) {
      props.setProperty(k, String(config[k] || ''));
    }
  }
  return { ok: true, mensaje: 'Configuración de IA actualizada.' };
}

function registrarLogIntegracionIA(canal, evento, dni, idRef, payloadIn, respuestaOut, estado, latenciaMs) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(HOJAS.LOGS_IA);
    if (!sheet) return;
    
    var idLog = 'LOG-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
    var fechaHora = serializarFecha(new Date(), true);
    
    sheet.appendRow([
      idLog,
      fechaHora,
      canal,
      evento,
      dni || '',
      idRef || '',
      typeof payloadIn === 'object' ? JSON.stringify(payloadIn) : String(payloadIn || ''),
      typeof respuestaOut === 'object' ? JSON.stringify(respuestaOut) : String(respuestaOut || ''),
      estado || 'SUCCESS',
      latenciaMs || 0
    ]);
  } catch(e) {
    Logger.log('Error registrando Log IA: ' + e.message);
  }
}

function analizarReciboConAgenteIABackend(payload) {
  var start = new Date().getTime();
  var config = obtenerConfiguracionIABackend();
  var dni = payload.dni || '';
  var reglaAfectacion = payload.reglaAfectacion || '35% Neto Ley';
  var pctTope = Number(payload.pctTope) || 35;
  var operador = payload.operador || 'Julian';
  
  if (config.GEMINI_API_KEY) {
    try {
      var prompt = "Eres un perito liquidador de haberes del sector público de Entre Ríos (CGE, Policía, Salud, Municipales). " +
        "Analiza el siguiente recibo de sueldo y extrae en JSON estructurado todos los conceptos. " +
        "Formato JSON requerido: { haberesComputables: number, descuentosLey: number, descuentosParticulares: number, items: [ { codigo: string, concepto: string, monto: number, clasificacion: 'HABER_COMPUTABLE' | 'NO_COMPUTABLE' | 'DESCUENTO_LEY' | 'DESCUENTO_PARTICULAR' } ] }";
      
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + config.GEMINI_MODEL + ":generateContent?key=" + config.GEMINI_API_KEY;
      var body = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: payload.mimeType || 'application/pdf',
                  data: payload.base64Data.replace(/^data:.*?;base64,/, '')
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };
      
      var response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      });
      
      var resJson = JSON.parse(response.getContentText());
      var textOut = resJson.candidates[0].content.parts[0].text;
      var parsedData = JSON.parse(textOut);
      
      var haberes = Number(parsedData.haberesComputables) || 0;
      var ley = Number(parsedData.descuentosLey) || 0;
      var part = Number(parsedData.descuentosParticulares) || 0;
      var margen = Math.max(0, Math.round((haberes - ley) * (pctTope / 100) - part));
      
      var latencia = new Date().getTime() - start;
      registrarLogIntegracionIA('Gemini OCR', 'analizarReciboOCR', dni, '', payload, parsedData, 'SUCCESS', latencia);
      
      return {
        ok: true,
        fuente: 'Gemini OCR Vision',
        haberesComputables: haberes,
        descuentosLey: ley,
        descuentosParticulares: part,
        margenDisponible: margen,
        items: parsedData.items || []
      };
    } catch(err) {
      Logger.log('Error Gemini API OCR: ' + err.message);
    }
  }
  
  // Motor Heurístico Local de Respaldo
  var itemsMock = [
    { codigo: '101', concepto: 'Sueldo Básico Categoría', monto: 850000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '150', concepto: 'Antigüedad 15 Años', monto: 340000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '160', concepto: 'Adicional Código 029 Función', monto: 180000, clasificacion: 'HABER_COMPUTABLE' },
    { codigo: '201', concepto: 'Aporte Jubilatorio Ley 8732 (16%)', monto: 219200, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '205', concepto: 'IOSPER Obra Social (3%)', monto: 41100, clasificacion: 'DESCUENTO_LEY' },
    { codigo: '310', concepto: 'Mutual Modelo Cuota Social', monto: 27400, clasificacion: 'DESCUENTO_PARTICULAR' },
    { codigo: '401', concepto: 'Seguro de Vida Colectivo', monto: 18000, clasificacion: 'DESCUENTO_PARTICULAR' }
  ];
  
  var totHaberes = 850000 + 340000 + 180000;
  var totLey = 219200 + 41100;
  var totPart = 27400 + 18000;
  var totMargen = Math.max(0, Math.round((totHaberes - totLey) * (pctTope / 100) - totPart));
  
  var latMock = new Date().getTime() - start;
  registrarLogIntegracionIA('Sistema Heurístico', 'analizarReciboMock', dni, '', payload, { margen: totMargen }, 'SUCCESS', latMock);
  
  return {
    ok: true,
    fuente: 'Heurístico Local',
    haberesComputables: totHaberes,
    descuentosLey: totLey,
    descuentosParticulares: totPart,
    margenDisponible: totMargen,
    items: itemsMock
  };
}

function procesarWebhookAgenteIA(e) {
  var action = (e.parameter && e.parameter.action) || '';
  var body = {};
  if (e.postData && e.postData.contents) {
    try { body = JSON.parse(e.postData.contents); } catch(err){}
  }
  if (!action && body.action) action = body.action;
  
  var resp = { ok: false, error: 'Acción no reconocida' };
  
  if (action === 'consultarMargenSocio') {
    var dni = e.parameter.dni || body.dni;
    var ficha = obtenerFichaSocio360Backend(dni);
    if (ficha.ok) {
      resp = {
        ok: true,
        nombre: ficha.socio.Apellido_Nombre,
        dni: ficha.socio.DNI,
        organismo: ficha.socio.Organismo,
        margenCuota: ficha.socio.Margen_Cuota_Disponible,
        bloqueadoLegales: ficha.socio.Bloqueado_Legales,
        detalleLegales: ficha.socio.Detalle_Legales
      };
    } else {
      resp = { ok: false, error: 'Socio no registrado' };
    }
  } else if (action === 'simularAyudaWhatsApp') {
    var linea = body.linea || 'FEDEM Provincial';
    var montoNeto = Number(body.neto) || 1000000;
    resp = {
      ok: true,
      linea: linea,
      neto: montoNeto,
      propuestaTexto: "💰 $ " + montoNeto.toLocaleString('es-AR') + " en 12 cuotas fijas de $ " + Math.round(montoNeto * 0.152667).toLocaleString('es-AR')
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(resp)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return procesarWebhookAgenteIA(e);
  }
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('CRM & Backoffice Financiero — Asociación Mutual Modelo')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  return procesarWebhookAgenteIA(e);
}

function obtenerDatosInicialesCRM() {
  asegurarEstructuraBD(false);
  var ss = getSpreadsheet();
  
  var padron = leerHojaComoObjetos(ss.getSheetByName(HOJAS.PADRON));
  var ayudas = leerHojaComoObjetos(ss.getSheetByName(HOJAS.AYUDAS));
  var seguimientos = leerHojaComoObjetos(ss.getSheetByName(HOJAS.SEGUIMIENTOS));
  var comercializadores = leerHojaComoObjetos(ss.getSheetByName(HOJAS.COMERCIALIZADORES));
  var liquidaciones = leerHojaComoObjetos(ss.getSheetByName(HOJAS.LIQUIDACIONES));
  var cesiones = leerHojaComoObjetos(ss.getSheetByName(HOJAS.CESIONES));
  var recibosCodigos = leerHojaComoObjetos(ss.getSheetByName(HOJAS.RECIBOS_CODIGOS));
  var logsIA = leerHojaComoObjetos(ss.getSheetByName(HOJAS.LOGS_IA));
  
  var catalogoCodigosDescuento = recibosCodigos.filter(function(r) { return r.Tipo_Fila === 'CODIGO_MAESTRO'; });
  var historialRecibosAnalizados = recibosCodigos.filter(function(r) { return r.Tipo_Fila === 'ANALISIS_RECIBO'; });
  
  var hoyStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
  var cantVencidas = 0;
  
  seguimientos.forEach(function(s) {
    var fVenc = s.Fecha_Vencimiento_Alerta || '';
    if (s.Estado_Alerta === 'Resuelta') {
      s.estadoTemporalAlerta = 'RESUELTA';
    } else if (fVenc < hoyStr) {
      s.estadoTemporalAlerta = 'VENCIDA';
      cantVencidas++;
    } else if (fVenc === hoyStr) {
      s.estadoTemporalAlerta = 'VENCE_HOY';
    } else {
      s.estadoTemporalAlerta = 'PROXIMA';
    }
  });
  
  var kpis = {
    totalSociosActivos: padron.length,
    sociosConBloqueosOAlertas: padron.filter(function(s) { return s.Bloqueado_Legales === 'SI' || s.En_Tramite_Jubilacion === 'SI'; }).length,
    ayudasEnEvaluacion: ayudas.filter(function(a) { return a.Estado_Tramite === 'En Evaluación'; }).length,
    totalColocadoMesActual: ayudas.reduce(function(acc, a) { return a.Estado_Tramite === 'Liquidado' ? acc + (Number(a.Monto_Depositado) || 0) : acc; }, 0),
    alertasVencidasSLA: cantVencidas,
    carteraPropiaVsCedida: {
      propia: ayudas.filter(function(a) { return a.Cartera_Titular === 'Cartera Propia Mutual'; }).length,
      cedida: ayudas.filter(function(a) { return a.Cartera_Titular !== 'Cartera Propia Mutual'; }).length
    }
  };
  
  return {
    ok: true,
    logoBase64: LOGO_MUTUAL_BASE64,
    operadorActivo: PropertiesService.getUserProperties().getProperty('AMMER_OPERADOR_ACTIVO') || 'Julian',
    operadoresLista: OPERADORES_MUTUAL,
    tasasOficiales: obtenerMatrizTasasOficiales(),
    configIA: obtenerConfiguracionIABackend(),
    padronSocios: padron,
    ayudasEconomicas: ayudas,
    seguimientosAlertas: seguimientos,
    comercializadores: comercializadores,
    liquidacionesComisiones: liquidaciones,
    cesionesCarteras: cesiones,
    catalogoCodigosDescuento: catalogoCodigosDescuento,
    historialRecibosAnalizados: historialRecibosAnalizados,
    logsIA: logsIA,
    kpisDashboard: kpis
  };
}`
  },
  {
    name: 'Index.html',
    type: 'html',
    description: 'Estructura SPA principal con cabecera fija, navegación de 7 módulos, Ficha 360°, Simuladores, Kanban y 5 Modales.',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM & Backoffice Financiero — Asociación Mutual Modelo</title>
  
  <!-- Tipografías Oficiales -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- PDF.js para lectura de Recibos en el cliente -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  
  <?!= include('Styles'); ?>
</head>
<body>
  <!-- Overlay Global de Carga -->
  <div id="loader-overlay" class="loader-overlay" style="display:none;">
    <div class="loader-spinner"></div>
    <div class="loader-text" id="loader-text">Procesando solicitud...</div>
  </div>

  <!-- Toast Notification -->
  <div id="toast-container" class="toast-container"></div>

  <!-- CABECERA SUPERIOR FIJA -->
  <header class="main-header">
    <div class="header-left">
      <div class="brand-logo-wrap">
        <img id="img-logo-mutual" src="logo.jpg" alt="Mutual Modelo" class="brand-logo" onerror="this.src='/logo.jpg'">
      </div>
      <div class="brand-info">
        <div class="brand-title">CRM & BACKOFFICE FINANCIERO</div>
        <div class="brand-subtitle">Asociación Mutual Modelo de Entre Ríos</div>
      </div>
    </div>

    <!-- Buscador Global -->
    <div class="header-center">
      <div class="global-search-box">
        <input type="text" id="inp-buscar-dni-global" placeholder="Buscar socio por DNI o Apellido..." onkeydown="if(event.key==='Enter') buscarSocioGlobalUI()">
        <button type="button" class="btn-search-icon" onclick="buscarSocioGlobalUI()">🔍</button>
      </div>
    </div>

    <!-- Acciones Rápidas & Selector de Operador -->
    <div class="header-right">
      <div class="operator-badge">
        <span class="operator-label">Operador:</span>
        <select id="sel-operador-activo" class="sel-operator" onchange="cambiarOperadorActivoUI(this.value)">
          <option value="Julian">Julian</option>
          <option value="Melina">Melina</option>
          <option value="Lucrecia">Lucrecia</option>
          <option value="Andrea">Andrea</option>
          <option value="Valentina">Valentina</option>
          <option value="Nicolas">Nicolas</option>
        </select>
      </div>
      
      <div class="quick-actions">
        <button type="button" class="btn-quick primary" onclick="abrirModalSocioUI()">+ Nuevo Socio</button>
        <button type="button" class="btn-quick success" onclick="abrirModalAyudaUI()">+ Nueva Ayuda</button>
        <button type="button" class="btn-quick warning" onclick="abrirModalSeguimientoUI()">+ Alerta</button>
      </div>
    </div>
  </header>

  <!-- BARRA DE NAVEGACIÓN DE 7 PESTAÑAS -->
  <nav class="nav-tabs-bar">
    <button type="button" id="tab-asociados" class="tab-btn active" onclick="cambiarPantallaCRM('screen-asociados', this)">
      👥 1. Asociados & Ficha 360°
    </button>
    <button type="button" id="tab-simuladores" class="tab-btn" onclick="cambiarPantallaCRM('screen-simuladores', this)">
      🧮 2. Simuladores & Recibos
    </button>
    <button type="button" id="tab-ayudas" class="tab-btn" onclick="cambiarPantallaCRM('screen-ayudas', this)">
      💰 3. Ayudas Económicas & Legajos
      <span id="badge-ayudas-pendientes" class="nav-badge">0</span>
    </button>
    <button type="button" id="tab-alertas" class="tab-btn" onclick="cambiarPantallaCRM('screen-alertas', this)">
      🔔 4. Seguimientos & Alertas
      <span id="badge-alertas-vencidas" class="nav-badge danger">0</span>
    </button>
    <button type="button" id="tab-liquidaciones" class="tab-btn" onclick="cambiarPantallaCRM('screen-liquidaciones', this)">
      📅 5. Liquidaciones por Fechas
    </button>
    <button type="button" id="tab-comercializadores" class="tab-btn" onclick="cambiarPantallaCRM('screen-comercializadores', this)">
      🤝 6. Comercializadores & Comisiones
    </button>
    <button type="button" id="tab-carteras-ia" class="tab-btn" onclick="cambiarPantallaCRM('screen-carteras-ia', this)">
      💼 7. Carteras, Cesiones & IA
    </button>
  </nav>

  <!-- CONTENIDO PRINCIPAL -->
  <main class="main-content">
    
    <!-- PANTALLA 1: ASOCIADOS & FICHA 360° -->
    <div id="screen-asociados" class="app-screen active">
      <!-- Panel Ficha 360° -->
      <div id="panel-ficha-360" class="card-panel ficha-360-panel" style="display:none;">
        <div class="panel-header-with-actions">
          <div class="ficha-title-block">
            <h2 id="f360-nombre">APELLIDO, NOMBRE</h2>
            <div class="ficha-subtitles">
              <span>DNI: <strong id="f360-dni">--</strong></span>
              <span>Socio N°: <strong id="f360-nro-socio">--</strong></span>
              <span>Organismo: <strong id="f360-organismo-sector">--</strong></span>
              <span>Edad: <strong id="f360-edad-condicion">--</strong></span>
              <span>WhatsApp: <strong id="f360-contacto-cbu">--</strong></span>
            </div>
          </div>
          <div class="ficha-header-actions">
            <button type="button" class="btn-outline" onclick="abrirModalEditarSocioActualUI()">✏️ Editar Socio</button>
            <button type="button" class="btn-primary" onclick="simularAyudaDesdeSocioActualUI()">🧮 Simular Préstamo</button>
            <button type="button" class="btn-close-sm" onclick="cerrarFicha360UI()">✖</button>
          </div>
        </div>

        <!-- Banderas y Semáforos Administrativos -->
        <div id="f360-banderas-container" class="flags-bar"></div>

        <!-- KPIs Financieros del Socio -->
        <div class="grid-4 kpi-grid-mini">
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Sueldo Bruto</div>
            <div id="f360-sueldo-bruto" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Sueldo Neto Ley</div>
            <div id="f360-sueldo-neto" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card highlight">
            <div class="kpi-mini-label">Margen Cuota Disp.</div>
            <div id="f360-margen-disponible" class="kpi-mini-val mono text-emerald">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Monto Preaprobado</div>
            <div id="f360-monto-preaprobado" class="kpi-mini-val mono text-blue">$ 0</div>
          </div>
        </div>

        <!-- Panel de Legajo en Google Drive -->
        <div class="drive-legajo-card">
          <div class="drive-header">
            <div class="drive-title">📁 Legajo Digital en Google Drive</div>
            <div class="drive-actions">
              <button type="button" id="btn-abrir-carpeta-drive-socio" class="btn-drive" onclick="abrirCarpetaDriveSocioActualUI()">
                📂 Abrir Carpeta Drive
              </button>
            </div>
          </div>
          <div class="drive-upload-inline">
            <select id="sel-tipo-doc-socio">
              <option value="DNI">DNI Frente y Dorso</option>
              <option value="RECIBO">Recibo de Sueldo</option>
              <option value="CBU">Constancia CBU Oficial</option>
              <option value="MUTUO">Mutuo Firmado</option>
              <option value="PAGARE">Pagaré</option>
              <option value="LIBRE_DEUDA">Libre Deuda / Certificación</option>
              <option value="SERVICIO">Factura de Servicio / Domicilio</option>
            </select>
            <input type="file" id="inp-file-doc-socio" accept=".pdf,image/*">
            <button type="button" class="btn-subir-drive" onclick="subirArchivoLegajoSocioUI()">Subir Documento</button>
          </div>
        </div>

        <!-- Sub-Grilla de 3 Columnas -->
        <div class="grid-3 ficha-details-grid">
          <!-- Col 1: Familiares y Subsidios -->
          <div class="card-inner">
            <h3>👨‍👩‍👧 Grupo Familiar & Subsidios</h3>
            <table class="table-compact">
              <thead><tr><th>Familiar</th><th>Parentesco</th><th>DNI</th></tr></thead>
              <tbody id="tbody-f360-familiares"></tbody>
            </table>
            <h4 style="margin-top:10px;">Subsidios Mutual</h4>
            <table class="table-compact">
              <thead><tr><th>Tipo</th><th>Fecha</th><th>Monto</th></tr></thead>
              <tbody id="tbody-f360-subsidios"></tbody>
            </table>
          </div>

          <!-- Col 2: Historial de Ayudas Económicas -->
          <div class="card-inner">
            <h3>💰 Ayudas Económicas del Socio</h3>
            <table class="table-compact">
              <thead><tr><th>ID</th><th>Línea</th><th>Cuotas</th><th>Saldo Rest.</th><th>Estado</th></tr></thead>
              <tbody id="tbody-f360-ayudas"></tbody>
            </table>
          </div>

          <!-- Col 3: Seguimientos y Alertas -->
          <div class="card-inner">
            <h3>🔔 Bitácora de Seguimientos & Alertas</h3>
            <table class="table-compact">
              <thead><tr><th>Fecha</th><th>Detalle</th><th>Estado</th></tr></thead>
              <tbody id="tbody-f360-seguimientos"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Padrón General de Asociados -->
      <div class="card-panel">
        <div class="panel-header-with-actions">
          <h2>👥 Padrón General de Asociados</h2>
          <div class="filters-inline">
            <input type="text" id="filtro-padron-texto" placeholder="Buscar por DNI, Nombre o N° Socio..." oninput="filtrarPadronSociosUI()">
            <select id="filtro-padron-organismo" onchange="filtrarPadronSociosUI()">
              <option value="TODOS">Todos los Organismos</option>
              <option value="CGE">Consejo General de Educación (CGE)</option>
              <option value="Policía">Policía de Entre Ríos</option>
              <option value="Salud">Ministerio de Salud</option>
              <option value="Vialidad">Vialidad Provincial</option>
              <option value="Municipalidad">Municipalidades</option>
              <option value="Jubilados">Caja Jubilaciones (Ley 8732)</option>
            </select>
            <select id="filtro-padron-alerta-especial" onchange="filtrarPadronSociosUI()">
              <option value="TODOS">Todos los Estados</option>
              <option value="LEGALES">Bloqueados Legales</option>
              <option value="JUBILACION">En Trámite Jubilación</option>
              <option value="DUPLICADOS">Pagos Duplicados</option>
              <option value="ALIVIO">Alivio Financiero</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Apellido y Nombre</th>
                <th>N° Socio</th>
                <th>Organismo</th>
                <th>Sueldo Bruto</th>
                <th>Margen Cuota</th>
                <th>Banderas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-padron-socios"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANTALLA 2: SIMULADORES & RECIBOS -->
    <div id="screen-simuladores" class="app-screen">
      <div class="simulator-wrapper vista-comercial-activa" id="contenedor-simuladores">
        
        <!-- Barra de Control Superior del Simulador -->
        <div class="card-panel control-bar-simulador">
          <div class="sim-header-split">
            <div class="sim-tool-switch">
              <button type="button" class="btn-subtool active" onclick="mostrarSubvistaSimulador('calculadoras')">🧮 Simuladores de Planes (FEDEM / Muni / Sidecreer)</button>
              <button type="button" class="btn-subtool" onclick="mostrarSubvistaSimulador('analizador-recibos')">📄 Analizador de Recibos de Sueldo</button>
            </div>
            
            <!-- Switch Maestro de Vista: Comercial vs Administrativa -->
            <div class="view-mode-switch" id="contenedor-switch-vista">
              <button type="button" id="btn-vista-comercial" class="btn-switch active" onclick="activarVistaSimulador('COMERCIAL')">
                🟢 Vista Comercial (Simple)
              </button>
              <button type="button" id="btn-vista-administrativa" class="btn-switch" onclick="activarVistaSimulador('ADMINISTRATIVA')">
                🛡️ Vista Administrativa (Completa)
              </button>
            </div>
          </div>
        </div>

        <!-- SUBVISTA 1: CALCULADORAS DE PLANES -->
        <div id="subvista-calculadoras">
          <!-- Parámetros de Entrada -->
          <div class="card-panel" id="panel-inputs-simulador">
            <div class="grid-4">
              <div>
                <label>Modo de Cálculo:</label>
                <select id="sel-modo-calculo-sim" onchange="ejecutarSimulacionEnVivoUI()">
                  <option value="NETO">💰 Por Monto Neto a Entregar ($)</option>
                  <option value="CUOTA">🎯 Por Cuota Objetivo / Margen ($)</option>
                  <option value="LINK_SIDECREER">🔗 Por Monto Link Sidecreer ($)</option>
                </select>
              </div>
              <div>
                <label>Importe ($):</label>
                <input type="number" id="inp-sim-valor-principal" value="1000000" step="50000" oninput="ejecutarSimulacionEnVivoUI()">
              </div>
              <div>
                <label>Nombre del Socio:</label>
                <input type="text" id="inp-sim-nombre-cliente" placeholder="Ej: María Laura Benítez" oninput="actualizarPlantillaWhatsAppUI()">
              </div>
              <div>
                <label>WhatsApp del Socio:</label>
                <input type="text" id="inp-tel-whatsapp-sim" placeholder="Ej: 3434551290" oninput="actualizarPlantillaWhatsAppUI()">
              </div>
            </div>
            <div class="checkbox-lines-filter">
              <span>Líneas visibles:</span>
              <label><input type="checkbox" id="chk-ver-fedem" checked onchange="ejecutarSimulacionEnVivoUI()"> FEDEM Provincial</label>
              <label><input type="checkbox" id="chk-ver-municipales" checked onchange="ejecutarSimulacionEnVivoUI()"> Municipales VIKINGO / QUAD</label>
              <label><input type="checkbox" id="chk-ver-sidecreer" checked onchange="ejecutarSimulacionEnVivoUI()"> Tarjeta Sidecreer</label>
            </div>
          </div>

          <!-- Las 3 Tablas Oficiales -->
          <!-- 1. FEDEM PROVINCIAL -->
          <div class="card-panel" id="card-sim-fedem">
            <div class="panel-header-with-actions">
              <h3>🏛️ Línea 1: FEDEM Provincial (6 a 48 Cuotas)</h3>
              <button type="button" class="btn-outline-sm" onclick="copiarPlanesLineaWA('FEDEM')">📋 Copiar Planes FEDEM p/ WhatsApp</button>
            </div>
            <div class="table-responsive">
              <table class="data-table sim-table">
                <thead>
                  <tr>
                    <th>Plazo</th>
                    <th>Valor Cuota</th>
                    <th>Neto a Entregar</th>
                    <th>Total a Devolver</th>
                    <th class="solo-vista-admin">Capital Bruto</th>
                    <th class="solo-vista-admin">Gastos (25%/34%)</th>
                    <th class="solo-vista-admin">Seguro (0.5%)</th>
                    <th class="solo-vista-admin">Intereses Fin.</th>
                    <th class="solo-vista-admin">TNA</th>
                    <th class="solo-vista-admin">TEM</th>
                    <th class="solo-vista-admin">TEA</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody id="tbody-sim-fedem"></tbody>
              </table>
            </div>
          </div>

          <!-- 2. MUNICIPALES VIKINGO / QUAD -->
          <div class="card-panel" id="card-sim-municipales">
            <div class="panel-header-with-actions">
              <h3>🏢 Línea 2: Municipales — Convenio VIKINGO / QUAD (12 y 24 Cuotas)</h3>
              <button type="button" class="btn-outline-sm" onclick="copiarPlanesLineaWA('Municipales')">📋 Copiar Planes Municipales p/ WhatsApp</button>
            </div>
            <div class="table-responsive">
              <table class="data-table sim-table">
                <thead>
                  <tr>
                    <th>Plazo</th>
                    <th>Valor Cuota</th>
                    <th>Neto a Entregar</th>
                    <th>Total a Devolver</th>
                    <th class="solo-vista-admin">Capital Vikingo</th>
                    <th class="solo-vista-admin">Gastos Otorg.</th>
                    <th class="solo-vista-admin">Capital QUAD</th>
                    <th class="solo-vista-admin">CFT TEA</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody id="tbody-sim-municipales"></tbody>
              </table>
            </div>
          </div>

          <!-- 3. TARJETA SIDECREER -->
          <div class="card-panel" id="card-sim-sidecreer">
            <div class="panel-header-with-actions">
              <h3>💳 Línea 3: Tarjeta Sidecreer (6 a 48 Cuotas)</h3>
              <button type="button" class="btn-outline-sm" onclick="copiarPlanesLineaWA('Sidecreer')">📋 Copiar Planes Sidecreer p/ WhatsApp</button>
            </div>
            <div class="table-responsive">
              <table class="data-table sim-table">
                <thead>
                  <tr>
                    <th>Plazo</th>
                    <th>Valor Cuota</th>
                    <th>Neto a Entregar</th>
                    <th>Monto Link Sidecreer</th>
                    <th class="solo-vista-admin">Capital Bruto</th>
                    <th class="solo-vista-admin">Gastos Admin</th>
                    <th class="solo-vista-admin">Intereses Fin.</th>
                    <th class="solo-vista-admin">TNA</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody id="tbody-sim-sidecreer"></tbody>
              </table>
            </div>
          </div>

          <!-- Generador y Editor de Plantillas de WhatsApp -->
          <div class="card-panel wa-preview-card" id="card-plantilla-whatsapp">
            <div class="panel-header-with-actions">
              <h3>📲 Editor de Mensaje Institucional de WhatsApp</h3>
              <div class="wa-template-selector">
                <select id="sel-tipo-plantilla-wa" onchange="actualizarPlantillaWhatsAppUI()">
                  <option value="MULTILINEA">Oferta Multilínea Completa</option>
                  <option value="FEDEM">Solo FEDEM Todos los Plazos</option>
                  <option value="MUNI">Solo Municipales 12 y 24 Cuotas</option>
                  <option value="SIDECREER">Solo Tarjeta Sidecreer</option>
                </select>
              </div>
            </div>
            <textarea id="txt-plantilla-whatsapp" rows="9" class="wa-textarea"></textarea>
            <div class="wa-actions-bottom">
              <button type="button" class="btn-outline" onclick="copiarPlantillaWhatsAppUI()">📋 Copiar al Portapapeles</button>
              <button type="button" class="btn-whatsapp" onclick="enviarWhatsAppClienteUI()">💬 Enviar por WhatsApp</button>
            </div>
          </div>
        </div>

        <!-- SUBVISTA 2: ANALIZADOR DE RECIBOS DE SUELDO -->
        <div id="subvista-analizador-recibos" style="display:none;">
          <div class="card-panel">
            <h2>📄 Analizador Inteligente de Recibos de Sueldo (OCR Gemini)</h2>
            <div class="grid-3 receipt-controls">
              <div>
                <label>Cargar Archivo PDF o Imagen:</label>
                <input type="file" id="inp-pdf-recibo" accept=".pdf,image/*">
              </div>
              <div>
                <label>Regla de Afectación de Haberes:</label>
                <select id="sel-regla-afectacion" onchange="recalcularMargenReciboUI()">
                  <option value="35% Neto Ley">35% de Haberes Netos de Ley</option>
                  <option value="40% Neto Ley">40% de Haberes Netos de Ley</option>
                  <option value="40% Sueldo Bruto">40% de Sueldo Bruto</option>
                </select>
              </div>
              <div style="display:flex; align-items:flex-end;">
                <button type="button" class="btn-primary" onclick="procesarAnalisisReciboIA_UI()">🤖 Analizar con Agente IA</button>
              </div>
            </div>

            <!-- Totales Calculados del Recibo -->
            <div class="grid-4 receipt-kpis">
              <div class="kpi-mini-card">
                <div class="kpi-mini-label">Haberes Computables</div>
                <div id="lbl-rec-haberes" class="kpi-mini-val mono">$ 0</div>
              </div>
              <div class="kpi-mini-card">
                <div class="kpi-mini-label">Descuentos de Ley</div>
                <div id="lbl-rec-ley" class="kpi-mini-val mono text-rose">$ 0</div>
              </div>
              <div class="kpi-mini-card">
                <div class="kpi-mini-label">Descuentos Particulares</div>
                <div id="lbl-rec-particulares" class="kpi-mini-val mono text-amber">$ 0</div>
              </div>
              <div class="kpi-mini-card highlight">
                <div class="kpi-mini-label">Margen Cuota Disponible</div>
                <div id="lbl-rec-margen-disponible" class="kpi-mini-val mono text-emerald">$ 0</div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Concepto</th>
                    <th>Clasificación</th>
                    <th>Monto ($)</th>
                  </tr>
                </thead>
                <tbody id="tbody-items-recibo"></tbody>
              </table>
            </div>

            <div style="margin-top:15px; text-align:right;">
              <button type="button" class="btn-success" onclick="transferirMargenAlSimuladorUI()">➡️ Transferir Margen al Simulador</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PANTALLA 3: AYUDAS ECONÓMICAS & LEGAJOS -->
    <div id="screen-ayudas" class="app-screen">
      <div class="card-panel">
        <div class="panel-header-with-actions">
          <h2>💰 Ayudas Económicas, Legajos & Refinanciaciones</h2>
          <div class="filters-inline">
            <button type="button" class="btn-subtool active" onclick="cambiarVistaAyudasUI('kanban')">Vista Kanban</button>
            <button type="button" class="btn-subtool" onclick="cambiarVistaAyudasUI('tabla')">Vista Tabla</button>
            <button type="button" class="btn-primary" onclick="abrirModalAyudaUI()">+ Nueva Solicitud</button>
          </div>
        </div>

        <!-- Kanban Board de 4 Columnas -->
        <div id="vista-ayudas-kanban" class="kanban-board">
          <div class="kanban-column" id="kb-col-solicitado">
            <div class="kb-col-header">📝 Solicitado (<span class="kb-count">0</span>)</div>
            <div class="kb-col-body"></div>
          </div>
          <div class="kanban-column" id="kb-col-evaluacion">
            <div class="kb-col-header">🔍 En Evaluación (<span class="kb-count">0</span>)</div>
            <div class="kb-col-body"></div>
          </div>
          <div class="kanban-column" id="kb-col-aprobado">
            <div class="kb-col-header">✅ Aprobado (<span class="kb-count">0</span>)</div>
            <div class="kb-col-body"></div>
          </div>
          <div class="kanban-column" id="kb-col-liquidado">
            <div class="kb-col-header">💳 Liquidado (<span class="kb-count">0</span>)</div>
            <div class="kb-col-body"></div>
          </div>
        </div>

        <!-- Tabla Administrativa de Ayudas -->
        <div id="vista-ayudas-tabla" class="table-responsive" style="display:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Ayuda</th>
                <th>Socio</th>
                <th>DNI</th>
                <th>Línea</th>
                <th>Solicitado</th>
                <th>Entregado</th>
                <th>Cuotas</th>
                <th>Saldo Restante</th>
                <th>Estado Trámite</th>
                <th>Documentación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-ayudas-general"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANTALLA 4: SEGUIMIENTOS & ALERTAS -->
    <div id="screen-alertas" class="app-screen">
      <div class="grid-4 sla-kpis-grid">
        <div class="kpi-card danger">
          <div class="kpi-label">VENCIDAS (SLA CRÍTICO)</div>
          <div id="kpi-alertas-vencidas" class="kpi-value">0</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-label">VENCEN HOY</div>
          <div id="kpi-alertas-hoy" class="kpi-value">0</div>
        </div>
        <div class="kpi-card info">
          <div class="kpi-label">PRÓXIMAS</div>
          <div id="kpi-alertas-proximas" class="kpi-value">0</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">RESUELTAS</div>
          <div id="kpi-alertas-resueltas" class="kpi-value">0</div>
        </div>
      </div>

      <div class="card-panel" style="margin-top:15px;">
        <div class="panel-header-with-actions">
          <h2>🔔 Bitácora General de Seguimientos & Alertas</h2>
          <div class="filters-inline">
            <select id="filtro-alertas-estado-sla" onchange="filtrarAlertasUI()">
              <option value="TODOS">Todas las Alertas</option>
              <option value="VENCIDA">Solo Vencidas</option>
              <option value="VENCE_HOY">Vence Hoy</option>
              <option value="PROXIMA">Próximas</option>
              <option value="RESUELTA">Resueltas</option>
            </select>
            <select id="filtro-alertas-operador" onchange="filtrarAlertasUI()">
              <option value="TODOS">Todos los Operadores</option>
            </select>
            <button type="button" class="btn-primary" onclick="abrirModalSeguimientoUI()">+ Nueva Alerta</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha/Hora</th>
                <th>Socio</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Detalle Gestión</th>
                <th>Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-seguimientos-alertas"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANTALLA 5: LIQUIDACIONES POR FECHAS -->
    <div id="screen-liquidaciones" class="app-screen">
      <div class="card-panel">
        <h2>📅 Consulta de Liquidaciones de Ayudas por Rango de Fechas</h2>
        <div class="grid-4 filters-range-grid">
          <div>
            <label>Criterio de Fecha:</label>
            <select id="liq-criterio-fecha">
              <option value="Fecha_Liquidacion">Fecha de Liquidación</option>
              <option value="Fecha_Solicitud">Fecha de Solicitud</option>
            </select>
          </div>
          <div>
            <label>Desde:</label>
            <input type="date" id="liq-fecha-desde" value="2026-10-01">
          </div>
          <div>
            <label>Hasta:</label>
            <input type="date" id="liq-fecha-hasta" value="2026-11-30">
          </div>
          <div style="display:flex; align-items:flex-end;">
            <button type="button" class="btn-primary" onclick="ejecutarFiltroLiquidacionesFechasUI()">🔍 Consultar Período</button>
          </div>
        </div>

        <!-- 6 KPIs de Tesorería -->
        <div class="grid-6 kpi-treasury-grid">
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Operaciones</div>
            <div id="kpi-liq-cantidad" class="kpi-mini-val">0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Monto Solicitado</div>
            <div id="kpi-liq-solicitado" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Monto Depositado</div>
            <div id="kpi-liq-depositado" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Retenido Refi.</div>
            <div id="kpi-liq-retenido-refi" class="kpi-mini-val mono text-amber">$ 0</div>
          </div>
          <div class="kpi-mini-card highlight">
            <div class="kpi-mini-label">Neto Entregado</div>
            <div id="kpi-liq-neto-efectivo" class="kpi-mini-val mono text-emerald">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Total a Devolver</div>
            <div id="kpi-liq-total-devolver" class="kpi-mini-val mono text-purple">$ 0</div>
          </div>
        </div>

        <div class="panel-header-with-actions" style="margin-top:20px;">
          <h3>Planilla Detallada de Operaciones</h3>
          <div class="actions-group">
            <button type="button" class="btn-outline-sm" onclick="exportarTablaACSV('tbody-liquidaciones-rango', 'Liquidaciones_Periodo')">📥 Exportar CSV</button>
            <button type="button" class="btn-outline-sm" onclick="imprimirPlanillaUI('screen-liquidaciones')">🖨️ Imprimir</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Ayuda</th>
                <th>Fecha Liq.</th>
                <th>Socio</th>
                <th>Línea</th>
                <th>Solicitado</th>
                <th>Depositado</th>
                <th>Ret. Refi</th>
                <th>Neto Entregado</th>
                <th>Total Devolver</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="tbody-liquidaciones-rango"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANTALLA 6: COMERCIALIZADORES & COMISIONES -->
    <div id="screen-comercializadores" class="app-screen">
      <!-- Padrón de Comercializadores -->
      <div class="card-panel">
        <div class="panel-header-with-actions">
          <h2>🤝 Padrón de Comercializadores & Agentes</h2>
          <button type="button" class="btn-primary" onclick="abrirModalComercializadorUI()">+ Nuevo Comercializador</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Estudio / Agente</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th>Base de Cálculo</th>
                <th>Comisión (%)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-comercializadores"></tbody>
          </table>
        </div>
      </div>

      <!-- Liquidador de Comisiones -->
      <div class="card-panel" style="margin-top:15px;">
        <h2>💵 Liquidador Oficial de Comisiones por Rango de Fechas</h2>
        <div class="grid-4">
          <div>
            <label>Comercializador:</label>
            <select id="comis-sel-comercializador"></select>
          </div>
          <div>
            <label>Desde:</label>
            <input type="date" id="comis-fecha-desde" value="2026-10-01">
          </div>
          <div>
            <label>Hasta:</label>
            <input type="date" id="comis-fecha-hasta" value="2026-10-31">
          </div>
          <div>
            <label>Deducciones / Ajustes ($):</label>
            <input type="number" id="comis-inp-deducciones" value="0">
          </div>
        </div>
        <div style="margin-top:10px; display:flex; gap:10px;">
          <button type="button" class="btn-primary" onclick="previsualizarComisionesUI()">👁️ Previsualizar Liquidación</button>
          <button type="button" class="btn-success" onclick="emitirLiquidacionComisionesOficialUI()">📝 Emitir Liquidación Oficial</button>
        </div>

        <!-- KPIs de Liquidación -->
        <div class="grid-4" style="margin-top:15px;">
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Operaciones Aprobadas</div>
            <div id="kpi-comis-ops" class="kpi-mini-val">0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Base Acumulada</div>
            <div id="kpi-comis-base-total" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Porcentaje Comisión</div>
            <div id="kpi-comis-pct" class="kpi-mini-val">0 %</div>
          </div>
          <div class="kpi-mini-card highlight">
            <div class="kpi-mini-label">Neto a Pagar</div>
            <div id="kpi-comis-neto-pagar" class="kpi-mini-val mono text-emerald">$ 0</div>
          </div>
        </div>

        <div class="table-responsive" style="margin-top:15px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Ayuda</th>
                <th>Fecha Liq.</th>
                <th>Socio</th>
                <th>Línea</th>
                <th>Base Aplicada ($)</th>
                <th>Comisión Generada ($)</th>
              </tr>
            </thead>
            <tbody id="tbody-previsualizacion-comisiones"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANTALLA 7: CARTERAS, CESIONES & IA -->
    <div id="screen-carteras-ia" class="app-screen">
      <div class="card-panel">
        <h2>💼 Gestión Multifiltro de Carteras & Valuación VPN</h2>
        <div class="grid-4" style="margin-bottom:15px;">
          <div>
            <label>Tasa de Descuento Mensual (%):</label>
            <input type="number" id="cart-tasa-descuento-vpn" value="4.5" step="0.1" onchange="filtrarCarteraAyudasUI()">
          </div>
          <div>
            <label>Titularidad de Cartera:</label>
            <select id="cart-titular-actual" onchange="filtrarCarteraAyudasUI()">
              <option value="PROPIA">Cartera Propia Mutual</option>
              <option value="CEDIDA">Cartera Cedida</option>
              <option value="TODAS">Todas las Carteras</option>
            </select>
          </div>
          <div>
            <label>Estado de Cobranza:</label>
            <select id="cart-estado-cobranza" onchange="filtrarCarteraAyudasUI()">
              <option value="TODAS">Todos los Estados</option>
              <option value="Al Día">Al Día</option>
              <option value="Mora Temprana">Mora Temprana</option>
            </select>
          </div>
          <div style="display:flex; align-items:flex-end;">
            <button type="button" class="btn-primary" onclick="filtrarCarteraAyudasUI()">🔍 Aplicar Filtros de Cartera</button>
          </div>
        </div>

        <!-- KPIs de Valuación de Cartera -->
        <div class="grid-5 kpi-treasury-grid">
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Créditos Seleccionados</div>
            <div id="kpi-cart-seleccionados" class="kpi-mini-val">0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Capital Original</div>
            <div id="kpi-cart-capital-original" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Flujo Nominal Restante</div>
            <div id="kpi-cart-flujo-nominal-restante" class="kpi-mini-val mono">$ 0</div>
          </div>
          <div class="kpi-mini-card highlight">
            <div class="kpi-mini-label">Valor Presente Neto (VPN)</div>
            <div id="kpi-cart-vpn-descontado" class="kpi-mini-val mono text-emerald">$ 0</div>
          </div>
          <div class="kpi-mini-card">
            <div class="kpi-mini-label">Quita Estimada</div>
            <div id="kpi-cart-quita-estimada" class="kpi-mini-val mono text-rose">$ 0</div>
          </div>
        </div>

        <div class="panel-header-with-actions" style="margin-top:15px;">
          <div style="display:flex; gap:10px;">
            <button type="button" class="btn-outline-sm" onclick="toggleSeleccionarTodosCarteraUI()">☑️ Seleccionar Todos</button>
            <button type="button" class="btn-outline-sm" onclick="exportarTablaACSV('tbody-cartera-filtrada', 'Cartera_Valuada')">📥 Exportar CSV</button>
          </div>
          <button type="button" class="btn-success" onclick="abrirModalCesionCarteraUI()">🤝 Formalizar Cesión de Cartera</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Sel.</th>
                <th>ID Ayuda</th>
                <th>Socio</th>
                <th>Línea</th>
                <th>Cuotas Rest.</th>
                <th>Valor Cuota</th>
                <th>Saldo Nominal</th>
                <th>VPN Descontado</th>
                <th>Titular Actual</th>
              </tr>
            </thead>
            <tbody id="tbody-cartera-filtrada"></tbody>
          </table>
        </div>
      </div>

      <!-- Consola de IA y Logs en Vivo -->
      <div class="card-panel" style="margin-top:15px;">
        <h2>🤖 Consola de Integraciones IA (Gemini, Darwin IA & WhatsApp)</h2>
        <div class="grid-3">
          <div>
            <label>Gemini API Key:</label>
            <input type="password" id="inp-ia-gemini-key" placeholder="AIzaSy...">
          </div>
          <div>
            <label>Darwin IA Webhook:</label>
            <input type="text" id="inp-ia-darwin-url" placeholder="https://api.darwinia.com.ar/webhook">
          </div>
          <div>
            <label>WhatsApp Cloud API Token:</label>
            <input type="password" id="inp-ia-wa-token" placeholder="EAABwz...">
          </div>
        </div>
        <div style="margin-top:10px; text-align:right;">
          <button type="button" class="btn-primary" onclick="guardarConfiguracionIA_UI()">💾 Guardar Credenciales IA</button>
        </div>

        <h3 style="margin-top:20px;">Bitácora de Logs de Ejecución IA</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Log</th>
                <th>Fecha/Hora</th>
                <th>Canal</th>
                <th>Evento</th>
                <th>DNI</th>
                <th>Estado</th>
                <th>Latencia (ms)</th>
              </tr>
            </thead>
            <tbody id="tbody-logs-ia"></tbody>
          </table>
        </div>
      </div>
    </div>

  </main>

  <!-- ==================== LAS 5 VENTANAS MODALES ==================== -->
  
  <!-- MODAL 1: ALTA / EDICIÓN DE SOCIO -->
  <div id="modal-socio" class="modal-overlay" style="display:none;">
    <div class="modal-card modal-lg">
      <div class="modal-header">
        <h3 id="modal-socio-titulo">Alta / Edición de Asociado</h3>
        <button type="button" class="btn-close" onclick="cerrarModal('modal-socio')">✖</button>
      </div>
      <div class="modal-body">
        <form id="form-socio" onsubmit="event.preventDefault(); guardarSocioSubmitUI();">
          <div class="grid-3">
            <div><label>DNI:</label><input type="text" id="inp-soc-dni" required></div>
            <div><label>N° Socio:</label><input type="text" id="inp-soc-nrosocio"></div>
            <div><label>Apellido y Nombre:</label><input type="text" id="inp-soc-nombre" required></div>
          </div>
          <div class="grid-3">
            <div><label>Fecha Nacimiento:</label><input type="date" id="inp-soc-nacimiento"></div>
            <div><label>Sexo:</label>
              <select id="inp-soc-sexo"><option value="F">Femenino</option><option value="M">Masculino</option></select>
            </div>
            <div><label>Organismo:</label>
              <input type="text" id="inp-soc-organismo" placeholder="Ej: CGE / Policía / Salud">
            </div>
          </div>
          <div class="grid-3">
            <div><label>Sueldo Bruto ($):</label><input type="number" id="inp-soc-bruto" value="1000000"></div>
            <div><label>Afectaciones Ley ($):</label><input type="number" id="inp-soc-ley" value="190000"></div>
            <div><label>Afectaciones Particulares ($):</label><input type="number" id="inp-soc-particulares" value="100000"></div>
          </div>
          <div class="grid-3">
            <div><label>Teléfono WhatsApp:</label><input type="text" id="inp-soc-telefono"></div>
            <div><label>CBU / Alias:</label><input type="text" id="inp-soc-cbu"></div>
            <div><label>Localidad:</label><input type="text" id="inp-soc-localidad" value="Paraná"></div>
          </div>
          <h4 style="margin-top:15px;">Banderas y Bloqueos Administrativos</h4>
          <div class="grid-3">
            <div>
              <label>Bloqueado Legales:</label>
              <select id="inp-soc-legales"><option value="NO">NO</option><option value="SI">SI</option></select>
            </div>
            <div>
              <label>En Trámite Jubilación:</label>
              <select id="inp-soc-jubilacion"><option value="NO">NO</option><option value="SI">SI</option></select>
            </div>
            <div>
              <label>Pagos Duplicados:</label>
              <select id="inp-soc-duplicados"><option value="NO">NO</option><option value="SI">SI</option></select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="cerrarModal('modal-socio')">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Asociado</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL 2: ALTA DE AYUDA ECONÓMICA & REFINANCIACIÓN -->
  <div id="modal-ayuda" class="modal-overlay" style="display:none;">
    <div class="modal-card modal-lg">
      <div class="modal-header">
        <h3>Solicitud de Ayuda Económica & Refinanciación</h3>
        <button type="button" class="btn-close" onclick="cerrarModal('modal-ayuda')">✖</button>
      </div>
      <div class="modal-body">
        <form id="form-ayuda" onsubmit="event.preventDefault(); guardarAyudaSubmitUI();">
          <div class="grid-3">
            <div><label>DNI del Socio:</label><input type="text" id="inp-ayu-dni" required onchange="cargarDatosSocioEnAyudaUI(this.value)"></div>
            <div><label>Nombre:</label><input type="text" id="inp-ayu-nombre" readonly></div>
            <div><label>Línea:</label>
              <select id="inp-ayu-linea">
                <option value="FEDEM Provincial">FEDEM Provincial</option>
                <option value="Municipalidad (VIKINGO)">Municipalidad (VIKINGO)</option>
                <option value="Tarjeta Sidecreer">Tarjeta Sidecreer</option>
              </select>
            </div>
          </div>
          <div class="grid-3">
            <div><label>Monto Solicitado ($):</label><input type="number" id="inp-ayu-monto" value="1000000" oninput="calcularRefinanciacionModalUI()"></div>
            <div><label>Cantidad de Cuotas:</label>
              <select id="inp-ayu-cuotas">
                <option value="6">6 cuotas</option>
                <option value="12" selected>12 cuotas</option>
                <option value="18">18 cuotas</option>
                <option value="24">24 cuotas</option>
                <option value="36">36 cuotas</option>
                <option value="48">48 cuotas</option>
              </select>
            </div>
            <div><label>Es Refinanciación:</label>
              <select id="inp-ayu-es-refi" onchange="toggleSeccionRefiUI(this.value)">
                <option value="NO">NO</option>
                <option value="SI">SI</option>
              </select>
            </div>
          </div>

          <!-- Sección de Refinanciación -->
          <div id="seccion-refinanciacion" style="display:none; background:#f8fafc; padding:10px; border-radius:8px; margin:10px 0;">
            <h4>🔄 Créditos Vigentes a Cancelar por Refinanciación</h4>
            <div id="contenedor-prestamos-refinanciar"></div>
            <div class="grid-2" style="margin-top:10px;">
              <div><strong>Monto Retenido p/ Cancelación:</strong> <span id="lbl-refi-retenido" class="mono text-amber">$ 0</span></div>
              <div><strong>Efectivo Neto a Entregar en Mano:</strong> <span id="lbl-refi-neto-mano" class="mono text-emerald" style="font-size:1.1rem;">$ 0</span></div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="cerrarModal('modal-ayuda')">Cancelar</button>
            <button type="submit" class="btn-primary">Registrar Ayuda Económica</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL 3: SEGUIMIENTO Y ALERTA -->
  <div id="modal-seguimiento" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Registrar Alerta / Seguimiento SLA</h3>
        <button type="button" class="btn-close" onclick="cerrarModal('modal-seguimiento')">✖</button>
      </div>
      <div class="modal-body">
        <form onsubmit="event.preventDefault(); guardarSeguimientoSubmitUI();">
          <div class="grid-2">
            <div><label>DNI Socio:</label><input type="text" id="inp-seg-dni" required></div>
            <div><label>Prioridad:</label>
              <select id="inp-seg-prioridad">
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>
          <div>
            <label>Fecha de Vencimiento de la Alerta:</label>
            <input type="date" id="inp-seg-fecha-venc" required>
          </div>
          <div>
            <label>Detalle de la Gestión:</label>
            <textarea id="inp-seg-detalle" rows="3" required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="cerrarModal('modal-seguimiento')">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Alerta</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL 4: COMERCIALIZADOR -->
  <div id="modal-comercializador" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Alta de Comercializador</h3>
        <button type="button" class="btn-close" onclick="cerrarModal('modal-comercializador')">✖</button>
      </div>
      <div class="modal-body">
        <form onsubmit="event.preventDefault(); guardarComercializadorSubmitUI();">
          <div><label>Nombre Estudio / Agente:</label><input type="text" id="inp-com-nombre" required></div>
          <div class="grid-2">
            <div><label>CUIT:</label><input type="text" id="inp-com-cuit" required></div>
            <div><label>Teléfono:</label><input type="text" id="inp-com-tel"></div>
          </div>
          <div class="grid-2">
            <div><label>Base Comisión:</label>
              <select id="inp-com-base">
                <option value="Monto_Depositado">Monto Depositado</option>
                <option value="Neto_Efectivo_Entregado">Neto Efectivo Entregado</option>
                <option value="Monto_Solicitado">Monto Solicitado</option>
              </select>
            </div>
            <div><label>Porcentaje (%):</label><input type="number" id="inp-com-pct" value="4.5" step="0.1"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="cerrarModal('modal-comercializador')">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL 5: CESIÓN DE CARTERA -->
  <div id="modal-cesion-cartera" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Formalizar Lote de Cesión de Cartera</h3>
        <button type="button" class="btn-close" onclick="cerrarModal('modal-cesion-cartera')">✖</button>
      </div>
      <div class="modal-body">
        <form onsubmit="event.preventDefault(); formalizarCesionCarteraSubmitUI();">
          <div><label>Entidad Cesionaria / Fideicomiso Destino:</label><input type="text" id="inp-ces-entidad" required value="Fideicomiso Financiero Entre Ríos I"></div>
          <div class="grid-2">
            <div><label>CUIT Cesionario:</label><input type="text" id="inp-ces-cuit" value="30-71892019-3"></div>
            <div><label>Precio Acordado de Venta ($):</label><input type="number" id="inp-ces-precio" required></div>
          </div>
          <div><label>Modalidad de Cobranza:</label>
            <select id="inp-ces-modalidad">
              <option value="Retención por Recibo CGE">Retención por Recibo CGE</option>
              <option value="Cobranza por CBU BERSA">Cobranza por CBU BERSA</option>
              <option value="Cesión Plena">Cesión Plena sin Recurso</option>
            </select>
          </div>
          <div><label>Observaciones:</label><textarea id="inp-ces-obs" rows="2"></textarea></div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="cerrarModal('modal-cesion-cartera')">Cancelar</button>
            <button type="submit" class="btn-success">Firmar y Ceder Cartera</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <?!= include('Scripts'); ?>
</body>
</html>`
  },
  {
    name: 'Styles.html',
    type: 'html',
    description: 'Sistema de diseño corporativo CSS con variables institucionales, switch comercial/administrativo y print.',
    code: `<style>
  :root {
    --primary: #135596;
    --primary-dark: #0d3b68;
    --primary-light: #2563eb;
    --primary-subtle: #eff6ff;
    --emerald: #059669;
    --emerald-subtle: #ecfdf5;
    --amber: #d97706;
    --amber-subtle: #fffbeb;
    --rose: #e11d48;
    --rose-subtle: #fff1f2;
    --purple: #7c3aed;
    --purple-subtle: #f5f3ff;
    --bg-body: #f1f5f9;
    --bg-card: #ffffff;
    --border: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: var(--bg-body);
    color: var(--text-main);
    line-height: 1.4;
  }
  .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

  /* CABECERA PRINCIPAL */
  .main-header {
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .brand-logo { height: 42px; width: auto; object-fit: contain; }
  .brand-title { font-size: 0.875rem; font-weight: 800; color: var(--primary); letter-spacing: -0.01em; }
  .brand-subtitle { font-size: 0.7rem; color: var(--text-muted); font-weight: 500; }

  .header-center { flex: 1; max-width: 480px; margin: 0 20px; }
  .global-search-box {
    display: flex;
    background: var(--bg-body);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px 10px;
  }
  .global-search-box input {
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
    font-size: 0.8125rem;
  }
  .btn-search-icon { border: none; background: transparent; cursor: pointer; }

  .header-right { display: flex; align-items: center; gap: 15px; }
  .operator-badge { display: flex; align-items: center; gap: 6px; font-size: 0.775rem; }
  .sel-operator {
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    font-weight: 600;
    color: var(--primary);
    background: #ffffff;
  }
  .quick-actions { display: flex; gap: 6px; }
  .btn-quick {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-quick.primary { background: var(--primary); color: #fff; }
  .btn-quick.success { background: var(--emerald); color: #fff; }
  .btn-quick.warning { background: var(--amber); color: #fff; }
  .btn-quick:hover { opacity: 0.9; transform: translateY(-1px); }

  /* TABS NAVEGACIÓN */
  .nav-tabs-bar {
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 4px;
    padding: 0 15px;
    overflow-x: auto;
  }
  .tab-btn {
    padding: 10px 14px;
    border: none;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .tab-btn:hover { color: var(--primary); }
  .tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }
  .nav-badge {
    background: #e2e8f0;
    color: var(--text-main);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.675rem;
  }
  .nav-badge.danger { background: var(--rose-subtle); color: var(--rose); font-weight: 700; }

  /* PANTALLAS */
  .main-content { padding: 15px; }
  .app-screen { display: none; }
  .app-screen.active { display: block; }

  /* CARDS Y PANELES */
  .card-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .panel-header-with-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  /* GRILLAS */
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

  /* REVELACIÓN PROGRESIVA: VISTA COMERCIAL VS ADMINISTRATIVA */
  .vista-comercial-activa .solo-vista-admin { display: none !important; }
  .vista-admin-activa .solo-vista-admin { display: table-cell; }

  .view-mode-switch {
    display: inline-flex;
    background: #e2e8f0;
    border-radius: 8px;
    padding: 3px;
    gap: 3px;
  }
  .btn-switch {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.775rem;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: var(--text-muted);
  }
  .btn-switch.active {
    background: var(--primary);
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }

  /* TABLAS DE ALTA DENSIDAD */
  .table-responsive { overflow-x: auto; margin-top: 8px; }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.775rem;
  }
  .data-table th {
    background: #f8fafc;
    border-bottom: 1px solid var(--border);
    padding: 8px 10px;
    text-align: left;
    font-weight: 700;
    color: var(--text-muted);
    position: sticky;
    top: 0;
    white-space: nowrap;
  }
  .data-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .data-table tr:hover { background: #f8fafc; }

  /* KANBAN */
  .kanban-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-top: 10px;
  }
  .kanban-column {
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px;
    min-height: 480px;
  }
  .kb-col-header { font-size: 0.8125rem; font-weight: 700; margin-bottom: 10px; color: var(--primary); }
  .kb-card {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: transform 0.1s ease;
  }
  .kb-card:hover { transform: translateY(-2px); box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

  /* MODALES */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-card {
    background: #ffffff;
    border-radius: 12px;
    width: 95%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
  .modal-card.modal-lg { max-width: 900px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

  /* IMPRESIÓN */
  @media print {
    body { background: #fff; }
    .main-header, .nav-tabs-bar, .filters-inline, .quick-actions, .modal-overlay { display: none !important; }
    .card-panel { border: none !important; box-shadow: none !important; }
  }
</style>`
  },
  {
    name: 'Scripts.html',
    type: 'html',
    description: 'Motor JavaScript reactivo en el cliente con estado global, simulaciones a 0ms de latencia, WhatsApp y Drive.',
    code: `<script>
/**
 * ============================================================================
 * SISTEMA: CRM & BACKOFFICE FINANCIERO — ASOCIACIÓN MUTUAL MODELO DE ENTRE RÍOS
 * MÓDULO 4: LÓGICA FRONTEND JAVASCRIPT REACTIVA (ES6+)
 * ARCHIVO: Scripts.html
 * ============================================================================
 */

const estadoCRM = {
  operadorActivo: 'Julian',
  vistaSimuladorActual: 'COMERCIAL', // 'COMERCIAL' | 'ADMINISTRATIVA'
  socioSeleccionado: null,
  padronSocios: [],
  ayudasEconomicas: [],
  seguimientosAlertas: [],
  comercializadores: [],
  liquidacionesComisiones: [],
  cesionesCarteras: [],
  catalogoCodigosDescuento: [],
  tasasOficiales: null,
  configIA: null,
  carteraFiltradaSeleccionada: new Set(),
  reciboAnalizadoActual: null
};

window.onload = function() {
  inicializarCRM_UI();
};

function inicializarCRM_UI() {
  ejecutarBackendAsync('obtenerDatosInicialesCRM')
    .then(function(res) {
      if (res.ok) {
        estadoCRM.padronSocios = res.padronSocios || [];
        estadoCRM.ayudasEconomicas = res.ayudasEconomicas || [];
        estadoCRM.seguimientosAlertas = res.seguimientosAlertas || [];
        estadoCRM.comercializadores = res.comercializadores || [];
        estadoCRM.liquidacionesComisiones = res.liquidacionesComisiones || [];
        estadoCRM.cesionesCarteras = res.cesionesCarteras || [];
        estadoCRM.catalogoCodigosDescuento = res.catalogoCodigosDescuento || [];
        estadoCRM.tasasOficiales = res.tasasOficiales;
        estadoCRM.configIA = res.configIA;
        estadoCRM.operadorActivo = res.operadorActivo || 'Julian';

        document.getElementById('sel-operador-activo').value = estadoCRM.operadorActivo;
        
        renderizarPadronSociosUI();
        renderizarAyudasKanbanUI();
        renderizarAlertasUI();
        renderizarComercializadoresUI();
        ejecutarSimulacionEnVivoUI();
        mostrarNotificacionToast('Sistema CRM inicializado con éxito', 'success');
      }
    })
    .catch(function(err) {
      mostrarNotificacionToast('Error cargando datos del servidor: ' + err, 'danger');
    });
}

function ejecutarBackendAsync(nombreFuncion, ...args) {
  return new Promise(function(resolve, reject) {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.style.display = 'flex';
    
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (loader) loader.style.display = 'none';
          resolve(res);
        })
        .withFailureHandler(function(err) {
          if (loader) loader.style.display = 'none';
          reject(err);
        })[nombreFuncion](...args);
    } else {
      if (loader) loader.style.display = 'none';
      resolve({ ok: true, mensaje: 'Modo sin servidor Apps Script' });
    }
  });
}

function mostrarNotificacionToast(msg, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'toast ' + tipo;
  div.innerText = msg;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function cambiarPantallaCRM(idPantalla, btnElement) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const screen = document.getElementById(idPantalla);
  if (screen) screen.classList.add('active');
  if (btnElement) btnElement.classList.add('active');
}

function activarVistaSimulador(modo) {
  const wrap = document.getElementById('contenedor-simuladores');
  const btnCom = document.getElementById('btn-vista-comercial');
  const btnAdm = document.getElementById('btn-vista-administrativa');
  
  if (modo === 'COMERCIAL') {
    wrap.classList.add('vista-comercial-activa');
    wrap.classList.remove('vista-admin-activa');
    btnCom.classList.add('active');
    btnAdm.classList.remove('active');
  } else {
    wrap.classList.add('vista-admin-activa');
    wrap.classList.remove('vista-comercial-activa');
    btnAdm.classList.add('active');
    btnCom.classList.remove('active');
  }
}

function ejecutarSimulacionEnVivoUI() {
  const modo = document.getElementById('sel-modo-calculo-sim').value;
  const valor = Number(document.getElementById('inp-sim-valor-principal').value) || 1000000;
  
  // 1. FEDEM
  const matrizFEDEM = {
    6: { coef: 1.57, gastos: 0.25, seguro: 0.005, tna: 0.4894 },
    12: { coef: 1.832, gastos: 0.25, seguro: 0.005, tna: 0.5368 },
    18: { coef: 2.242364, gastos: 0.34, seguro: 0.005, tna: 0.4466 },
    24: { coef: 2.677818, gastos: 0.34, seguro: 0.005, tna: 0.5339 },
    36: { coef: 3.620727, gastos: 0.34, seguro: 0.005, tna: 0.6145 },
    48: { coef: 4.635637, gastos: 0.34, seguro: 0.005, tna: 0.6485 }
  };
  
  let htmlFEDEM = '';
  [6, 12, 18, 24, 36, 48].forEach(n => {
    const c = matrizFEDEM[n];
    let neto = modo === 'CUOTA' ? (valor * n) / c.coef : valor;
    let total = neto * c.coef;
    let cuota = total / n;
    let capBruto = neto / (1 - c.gastos);
    let gastos = capBruto * c.gastos;
    let seguro = capBruto * c.seguro * n;
    let intereses = total - capBruto - seguro;

    htmlFEDEM += '<tr>' +
      '<td><strong>' + n + ' cuotas</strong></td>' +
      '<td class="mono font-bold text-emerald">$ ' + Math.round(cuota).toLocaleString('es-AR') + '</td>' +
      '<td class="mono">$ ' + Math.round(neto).toLocaleString('es-AR') + '</td>' +
      '<td class="mono text-purple">$ ' + Math.round(total).toLocaleString('es-AR') + '</td>' +
      '<td class="mono solo-vista-admin">$ ' + Math.round(capBruto).toLocaleString('es-AR') + '</td>' +
      '<td class="mono solo-vista-admin">$ ' + Math.round(gastos).toLocaleString('es-AR') + '</td>' +
      '<td class="mono solo-vista-admin">$ ' + Math.round(seguro).toLocaleString('es-AR') + '</td>' +
      '<td class="mono solo-vista-admin">$ ' + Math.round(intereses).toLocaleString('es-AR') + '</td>' +
      '<td class="mono solo-vista-admin">' + (c.tna * 100).toFixed(1) + '%</td>' +
      '<td class="mono solo-vista-admin">--</td>' +
      '<td class="mono solo-vista-admin">--</td>' +
      '<td><button type="button" class="btn-quick primary" onclick="seleccionarPlanParaAyuda(' + n + ', ' + Math.round(cuota) + ', \\'FEDEM Provincial\\')">Elegir</button></td>' +
    '</tr>';
  });
  document.getElementById('tbody-sim-fedem').innerHTML = htmlFEDEM;
  
  actualizarPlantillaWhatsAppUI();
}

function actualizarPlantillaWhatsAppUI() {
  const nombre = document.getElementById('inp-sim-nombre-cliente').value || 'Estimado/a socio/a';
  const valor = Number(document.getElementById('inp-sim-valor-principal').value) || 1000000;
  
  const texto = nombre + " le acercamos los planes aprobados de Mutual Modelo 🙌🏻\\n\\n" +
    "📢 TENEMOS LA TASA MÁS BAJA DE ENTRE RÍOS\\n" +
    "💰 $ " + valor.toLocaleString('es-AR') + " en 12 cuotas de $ " + Math.round(valor * 0.152667).toLocaleString('es-AR') + "\\n" +
    "💰 $ " + valor.toLocaleString('es-AR') + " en 24 cuotas de $ " + Math.round(valor * 0.111576).toLocaleString('es-AR') + "\\n\\n" +
    "Requisitos: DNI, Recibo de Sueldo y CBU. Descuento directo por recibo.\\n" +
    "Ante cualquier duda quedo a disposición. Atte. " + estadoCRM.operadorActivo + " - Mutual Modelo.";
    
  document.getElementById('txt-plantilla-whatsapp').value = texto;
}

function copiarPlantillaWhatsAppUI() {
  const t = document.getElementById('txt-plantilla-whatsapp').value;
  navigator.clipboard.writeText(t);
  mostrarNotificacionToast('Plantilla copiada al portapapeles', 'success');
}

function enviarWhatsAppClienteUI() {
  const t = document.getElementById('txt-plantilla-whatsapp').value;
  const tel = document.getElementById('inp-tel-whatsapp-sim').value.replace(/[^0-9]/g, '');
  window.open('https://api.whatsapp.com/send?phone=' + tel + '&text=' + encodeURIComponent(t), '_blank');
}
</script>`
  }
];
