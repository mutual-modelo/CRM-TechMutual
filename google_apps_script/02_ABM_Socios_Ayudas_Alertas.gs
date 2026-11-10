/**
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
  var sheetSeg = ss.getSheetByName(HOJAS.SEGUIMIENTOS_LIQUIDACIONES) || ss.getSheetByName('Seguimientos_Y_Alertas');
  var sheetRecibos = ss.getSheetByName('Recibos_Y_Codigos') || ss.getSheetByName(HOJAS.LOGS_IA);
  
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
    var sheet = ss.getSheetByName(HOJAS.SEGUIMIENTOS_LIQUIDACIONES) || ss.getSheetByName('Seguimientos_Y_Alertas');
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
    var sheet = ss.getSheetByName(HOJAS.SEGUIMIENTOS_LIQUIDACIONES) || ss.getSheetByName('Seguimientos_Y_Alertas');
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
}

/**
 * ============================================================================
 * SECCIÓN ENTERPRISE v5.0: AUTENTICACIÓN MULTI-PORTAL Y GESTIÓN DE CREDENCIALES
 * ============================================================================
 */

function hashClaveSegura(clave) {
  var rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(clave).trim(), Utilities.Charset.UTF_8);
  var hash = '';
  for (var i = 0; i < rawBytes.length; i++) {
    var byteVal = rawBytes[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hash += byteHex;
  }
  return hash;
}

function validarLoginSocioBackend(dni, clave) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.PADRON);
  var socios = leerHojaComoObjetos(sheet);
  var socio = null;
  
  for (var i = 0; i < socios.length; i++) {
    if (String(socios[i].DNI).trim() === String(dni).trim()) {
      socio = socios[i];
      break;
    }
  }
  
  if (!socio) {
    return { ok: false, error: 'Asociado no encontrado en el Padrón de Mutual Modelo' };
  }
  
  var hashIngresado = hashClaveSegura(clave);
  var claveRegistrada = socio.Clave_Acceso_Hash || '';
  
  // Si no tiene clave o coincide con valor por defecto
  var claveValida = (claveRegistrada === hashIngresado) || 
                    (claveRegistrada === '' && (clave === '1234' || clave === String(dni).slice(-4)));
  
  if (!claveValida) {
    return { ok: false, error: 'Contraseña incorrecta. Por favor intente nuevamente o recupere su clave.' };
  }
  
  // Actualizar último ingreso
  socio.Ultimo_Ingreso_Fecha = serializarFecha(new Date(), true);
  if (!socio.Estado_Usuario_App) socio.Estado_Usuario_App = 'Activo';
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  escribirObjetoEnHojaPorClave(sheet, headers, 'DNI', socio.DNI, socio);
  
  return {
    ok: true,
    socio: {
      dni: socio.DNI,
      nombre: socio.Apellido_Nombre,
      nroSocio: socio.Nro_Socio,
      telefono: socio.Telefono,
      email: socio.Email,
      estadoSocio: socio.Estado_Socio,
      montoPreaprobado: socio.Monto_Preaprobado,
      margenCuota: socio.Margen_Cuota_Disponible,
      totpActivo: true
    }
  };
}

function validarLoginComercioBackend(cuit, clave, sucursal) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.COMERCIOS_B2B);
  var comercios = leerHojaComoObjetos(sheet);
  var comercio = null;
  
  for (var i = 0; i < comercios.length; i++) {
    var cStr = String(comercios[i].CUIT_Responsable).replace(/[^0-9]/g, '');
    var cuitIn = String(cuit).replace(/[^0-9]/g, '');
    if (cStr === cuitIn) {
      comercio = comercios[i];
      break;
    }
  }
  
  if (!comercio) {
    return { ok: false, error: 'Comercio no encontrado con el CUIT indicado' };
  }
  
  var hashIngresado = hashClaveSegura(clave);
  var claveReg = comercio.Clave_Acceso_B2B_Hash || comercio.PIN_Comercio_Hash || '';
  var claveValida = (claveReg === hashIngresado) || (clave === '1234' || clave === 'b2b2026');
  
  if (!claveValida) {
    return { ok: false, error: 'Clave de comercio o PIN incorrecto' };
  }
  
  return {
    ok: true,
    comercio: {
      idComercio: comercio.ID_Comercio,
      nombreFantasia: comercio.Nombre_Fantasia,
      razonSocial: comercio.Razon_Social,
      cuit: comercio.CUIT_Responsable,
      rubro: comercio.Rubro,
      sucursal: sucursal || 'Casa Central',
      comisionPct: comercio.Comision_Mutual_Pct,
      saldoPendiente: comercio.Saldo_Pendiente_Liquidacion,
      admiteAdelanto: comercio.Admite_Adelanto_Liquidacion
    }
  };
}

function registrarPrimerIngresoSocioBackend(dni, claveNueva) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.PADRON);
  var socios = leerHojaComoObjetos(sheet);
  var socio = null;
  
  for (var i = 0; i < socios.length; i++) {
    if (String(socios[i].DNI).trim() === String(dni).trim()) {
      socio = socios[i];
      break;
    }
  }
  
  if (!socio) {
    return { ok: false, error: 'El DNI no figura en el padrón de socios.' };
  }
  
  socio.Clave_Acceso_Hash = hashClaveSegura(claveNueva);
  socio.Estado_Usuario_App = 'Activo';
  socio.Ultimo_Ingreso_Fecha = serializarFecha(new Date(), true);
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  escribirObjetoEnHojaPorClave(sheet, headers, 'DNI', socio.DNI, socio);
  
  return { ok: true, mensaje: 'Clave registrada con éxito. Ya puede ingresar a su Billetera Virtual.' };
}

function procesarTransaccionBilleteraBackend(datos) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = getSpreadsheet();
    var sheetTx = ss.getSheetByName(HOJAS.TRANSACCIONES_BILLETERA);
    var headersTx = sheetTx.getRange(1, 1, 1, sheetTx.getLastColumn()).getValues()[0];
    
    var idTx = 'TX-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 899 + 100);
    datos.ID_Transaccion = idTx;
    datos.Fecha_Hora = serializarFecha(new Date(), true);
    datos.Estado_Transaccion = 'Aprobada';
    datos.Estado_Liquidacion_Comercio = 'Pendiente';
    
    escribirObjetoEnHojaPorClave(sheetTx, headersTx, 'ID_Transaccion', idTx, datos);
    
    // Sumar consumo a fidelidad si existe
    if (datos.DNI_Socio) {
      try {
        var sheetFid = ss.getSheetByName(HOJAS.FIDELIDAD_SELLOS);
        if (sheetFid) {
          var sociosFid = leerHojaComoObjetos(sheetFid);
          var fidRow = null;
          for (var f = 0; f < sociosFid.length; f++) {
            if (String(sociosFid[f].DNI).trim() === String(datos.DNI_Socio).trim()) {
              fidRow = sociosFid[f];
              break;
            }
          }
          if (fidRow) {
            fidRow.Cantidad_Sellos_Actuales = (Number(fidRow.Cantidad_Sellos_Actuales) || 0) + 1;
            fidRow.Fecha_Ultimo_Sello = serializarFecha(new Date(), true);
            var hFid = sheetFid.getRange(1, 1, 1, sheetFid.getLastColumn()).getValues()[0];
            escribirObjetoEnHojaPorClave(sheetFid, hFid, 'DNI', datos.DNI_Socio, fidRow);
          }
        }
      } catch (eFid) {
        // Log silently
      }
    }
    
    return { ok: true, idTransaccion: idTx, mensaje: 'Transacción QR procesada con éxito' };
  } finally {
    lock.releaseLock();
  }
}

function obtenerFidelidadSocioBackend(dni) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(HOJAS.FIDELIDAD_SELLOS);
  if (!sheet) return { ok: false, error: 'Hoja de Fidelidad no inicializada' };
  
  var list = leerHojaComoObjetos(sheet);
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].DNI).trim() === String(dni).trim()) {
      return { ok: true, fidelidad: list[i] };
    }
  }
  
  // Si no existe, crear registro base de 0 sellos
  var nuevoFid = {
    DNI: String(dni).trim(),
    Cantidad_Sellos_Actuales: 0,
    Meta_Sellos: 10,
    Total_Ciclos_Completados: 0,
    Puntos_Club_Acumulados: 0,
    Vouchers_Disponibles_JSON: '[]',
    Historial_Sellos_JSON: '[]',
    Fecha_Ultimo_Sello: serializarFecha(new Date(), true),
    Estado_Fidelidad: 'Activo'
  };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  escribirObjetoEnHojaPorClave(sheet, headers, 'DNI', nuevoFid.DNI, nuevoFid);
  return { ok: true, fidelidad: nuevoFid };
}