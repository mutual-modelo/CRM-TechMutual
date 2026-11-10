/**
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
    var sheet = ss.getSheetByName(HOJAS.LIQUIDACIONES_COMISIONES) || ss.getSheetByName('Liquidaciones_Comisiones');
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
}