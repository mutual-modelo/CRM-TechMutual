import { LineaAyuda, SimulationResultRow } from '../types/crm';

export const MATRIZ_FEDEM = {
  6: { cuotas: 6, tna: 0.48942604, tem: 0.04078550, tea: 0.61560361, gastos: 0.25, seguro: 0.005, coef: 1.57, temCft: 0.14638153 },
  12: { cuotas: 12, tna: 0.53681994, tem: 0.04473499, tea: 0.69072785, gastos: 0.25, seguro: 0.005, coef: 1.832, temCft: 0.10814229 },
  18: { cuotas: 18, tna: 0.44666196, tem: 0.03722183, tea: 0.55045720, gastos: 0.34, seguro: 0.005, coef: 2.242364, temCft: 0.10337010 },
  24: { cuotas: 24, tna: 0.53394403, tem: 0.04449534, tea: 0.68607954, gastos: 0.34, seguro: 0.005, coef: 2.677818, temCft: 0.10032896 },
  36: { cuotas: 36, tna: 0.61456980, tem: 0.05121415, tea: 0.82093472, gastos: 0.34, seguro: 0.005, coef: 3.620727, temCft: 0.09698423 },
  48: { cuotas: 48, tna: 0.64853029, tem: 0.05404419, tea: 0.88064070, gastos: 0.34, seguro: 0.005, coef: 4.635637, temCft: 0.09535618 }
};

export const MATRIZ_MUNICIPALES = {
  factorVikingo: 0.85,
  tnaQuad: 0.39595488,
  temQuad: 0.39595488 / 12, // 0.03299624
  12: { cuotas: 12, cftTea: 2.80, temCft: 0.11767439, coefCuota: 0.15970096, coefTotal: 1.91641149 },
  24: { cuotas: 24, cftTea: 2.20, temCft: 0.10178240, coefCuota: 0.11279781, coefTotal: 2.70714753 }
};

export const MATRIZ_SIDECREER = {
  6: { cuotas: 6, tna: 0.58534514, tem: 0.04877876, tea: 0.77095126, gastos: 0.25, seguro: 0.00, coef: 1.56999, temCft: 0.14637905 },
  12: { cuotas: 12, tna: 0.63154362, tem: 0.05262864, tea: 0.85055570, gastos: 0.25, seguro: 0.00, coef: 1.83207, temCft: 0.10814999 },
  18: { cuotas: 18, tna: 0.53972734, tem: 0.04497728, tea: 0.69543900, gastos: 0.34, seguro: 0.00, coef: 2.24242, temCft: 0.10337396 },
  24: { cuotas: 24, tna: 0.61978356, tem: 0.05164863, tea: 0.82998666, gastos: 0.34, seguro: 0.00, coef: 2.67773, temCft: 0.10032449 },
  36: { cuotas: 36, tna: 0.69009744, tem: 0.05750812, tea: 0.95616070, gastos: 0.34, seguro: 0.00, coef: 3.62048, temCft: 0.09697673 },
  48: { cuotas: 48, tna: 0.71781259, tem: 0.05981772, tea: 1.00804804, gastos: 0.34, seguro: 0.00, coef: 4.63548, temCft: 0.09535278 }
};

export function formatMonedaAR(valor: number, conDecimales = false): string {
  if (isNaN(valor) || !isFinite(valor)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: conDecimales ? 2 : 0,
    maximumFractionDigits: conDecimales ? 2 : 0
  }).format(valor);
}

export function formatNumero(valor: number, decimales = 0): string {
  if (isNaN(valor) || !isFinite(valor)) return '0';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
}

export function simularFEDEM(modo: 'NETO' | 'CUOTA' | 'LINK_SIDECREER', valorIngresado: number): SimulationResultRow[] {
  const plazos = [6, 12, 18, 24, 36, 48];
  return plazos.map((n) => {
    const config = MATRIZ_FEDEM[n as keyof typeof MATRIZ_FEDEM];
    let netoEntregar = 0;
    let montoFinalDevolver = 0;
    let valorCuota = 0;

    if (modo === 'NETO' || modo === 'LINK_SIDECREER') {
      netoEntregar = valorIngresado;
      montoFinalDevolver = netoEntregar * config.coef;
      valorCuota = montoFinalDevolver / n;
    } else {
      valorCuota = valorIngresado;
      montoFinalDevolver = valorCuota * n;
      netoEntregar = montoFinalDevolver / config.coef;
    }

    const capitalBruto = netoEntregar / (1 - config.gastos);
    const comisionesGastos = capitalBruto * config.gastos;
    const seguroMensual = capitalBruto * config.seguro;
    const seguroTotal = seguroMensual * n;
    const cuotaPura = valorCuota - seguroMensual;
    const interesesFinancieros = montoFinalDevolver - capitalBruto - seguroTotal;

    const textoWhatsApp = `💰 $ ${formatNumero(Math.floor(netoEntregar))} en ${n} cuotas fijas de $ ${formatNumero(Math.round(valorCuota))}`;

    return {
      plazo: n,
      valorCuota,
      netoEntregar,
      montoFinalDevolver,
      capitalBruto,
      gastosAdmin: comisionesGastos,
      seguroTotal,
      cuotaPura,
      interesesFinancieros,
      tna: config.tna,
      tem: config.tem,
      tea: config.tea,
      temCft: config.temCft,
      coeficiente: config.coef,
      textoWhatsApp
    };
  });
}

export function simularMunicipales(modo: 'NETO' | 'CUOTA' | 'LINK_SIDECREER', valorIngresado: number): SimulationResultRow[] {
  const plazos = [12, 24];
  const { factorVikingo, temQuad } = MATRIZ_MUNICIPALES;

  return plazos.map((n) => {
    const config = MATRIZ_MUNICIPALES[n as 12 | 24];
    let netoEntregar = 0;
    let valorCuota = 0;

    if (modo === 'NETO' || modo === 'LINK_SIDECREER') {
      netoEntregar = valorIngresado;
      valorCuota = netoEntregar * config.coefCuota;
    } else {
      valorCuota = valorIngresado;
      netoEntregar = valorCuota / config.coefCuota;
    }

    const montoFinalDevolver = valorCuota * n;
    const capitalVikingo = netoEntregar / factorVikingo;
    const gastosOtorgVikingo = capitalVikingo - netoEntregar;
    const capitalSistemaQuad = valorCuota * ((1 - Math.pow(1 + temQuad, -n)) / temQuad);
    const interesesFinancieros = montoFinalDevolver - capitalVikingo;

    const textoWhatsApp = `💰 $ ${formatNumero(Math.floor(netoEntregar))} en ${n} cuotas fijas de $ ${formatNumero(Math.round(valorCuota))}`;

    return {
      plazo: n,
      valorCuota,
      netoEntregar,
      montoFinalDevolver,
      capitalBruto: capitalVikingo,
      gastosAdmin: gastosOtorgVikingo,
      seguroTotal: 0,
      cuotaPura: valorCuota,
      interesesFinancieros,
      tna: MATRIZ_MUNICIPALES.tnaQuad,
      tem: temQuad,
      tea: config.cftTea,
      temCft: config.temCft,
      coeficiente: config.coefTotal,
      capitalVikingo,
      capitalQuad: capitalSistemaQuad,
      textoWhatsApp
    };
  });
}

export function simularSidecreer(modo: 'NETO' | 'CUOTA' | 'LINK_SIDECREER', valorIngresado: number): SimulationResultRow[] {
  const plazos = [6, 12, 18, 24, 36, 48];

  return plazos.map((n) => {
    const config = MATRIZ_SIDECREER[n as keyof typeof MATRIZ_SIDECREER];
    let netoEntregar = 0;
    let importeLinkSidecreer = 0;
    let valorCuota = 0;

    if (modo === 'NETO') {
      netoEntregar = valorIngresado;
      importeLinkSidecreer = netoEntregar * config.coef;
      valorCuota = importeLinkSidecreer / n;
    } else if (modo === 'LINK_SIDECREER') {
      importeLinkSidecreer = valorIngresado;
      valorCuota = importeLinkSidecreer / n;
      netoEntregar = importeLinkSidecreer / config.coef;
    } else {
      valorCuota = valorIngresado;
      importeLinkSidecreer = valorCuota * n;
      netoEntregar = importeLinkSidecreer / config.coef;
    }

    const capitalBruto = netoEntregar / (1 - config.gastos);
    const comisionesGastos = capitalBruto * config.gastos;
    const interesesFinancieros = importeLinkSidecreer - capitalBruto;

    const textoWhatsApp = `💰 $ ${formatNumero(Math.floor(netoEntregar))} en ${n} cuotas fijas de $ ${formatNumero(Math.round(valorCuota))}`;

    return {
      plazo: n,
      valorCuota,
      netoEntregar,
      montoFinalDevolver: importeLinkSidecreer,
      capitalBruto,
      gastosAdmin: comisionesGastos,
      seguroTotal: 0,
      cuotaPura: valorCuota,
      interesesFinancieros,
      tna: config.tna,
      tem: config.tem,
      tea: config.tea,
      temCft: config.temCft,
      coeficiente: config.coef,
      textoWhatsApp
    };
  });
}

/**
 * Cálculo del Valor Presente Neto (VPN / Descontado) de una cartera de créditos
 * Formula: vpn = Valor_Cuota * ((1 - (1 + i)^(-n)) / i)
 */
export function calcularVPN(valorCuota: number, cuotasRestantes: number, tasaMensualDecimal: number): number {
  if (cuotasRestantes <= 0 || valorCuota <= 0) return 0;
  if (tasaMensualDecimal <= 0) return valorCuota * cuotasRestantes;
  return valorCuota * ((1 - Math.pow(1 + tasaMensualDecimal, -cuotasRestantes)) / tasaMensualDecimal);
}

/**
 * Generador del Cuadro de Marcha de Cuotas (Plan de Cuotas JSON)
 */
export function generarPlanCuotas(
  capitalBruto: number,
  totalADevolver: number,
  cantidadCuotas: number,
  valorCuota: number,
  fechaBase: Date = new Date()
) {
  const cuotas = [];
  const cuotaPuraCapital = capitalBruto / cantidadCuotas;
  const cuotaInteresYGastos = valorCuota - cuotaPuraCapital;
  let saldoRestante = capitalBruto;

  for (let i = 1; i <= cantidadCuotas; i++) {
    const fechaVenc = new Date(fechaBase);
    fechaVenc.setMonth(fechaVenc.getMonth() + i);
    fechaVenc.setDate(10); // Vencimiento el día 10

    saldoRestante = Math.max(0, saldoRestante - cuotaPuraCapital);

    cuotas.push({
      numeroCuota: i,
      fechaVencimiento: fechaVenc.toISOString().slice(0, 10),
      cuotaTotal: Math.round(valorCuota),
      amortizacionCapital: Math.round(cuotaPuraCapital),
      interesYGastos: Math.round(cuotaInteresYGastos),
      saldoCapitalRestante: Math.round(saldoRestante),
      estado: 'Pendiente' as const
    });
  }

  return cuotas;
}
