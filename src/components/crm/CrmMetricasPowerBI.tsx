import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { SocioPadron, AyudaEconomica, TransaccionBilletera, Comercializador } from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';

Chart.register(...registerables);

interface CrmMetricasPowerBIProps {
  socios: SocioPadron[];
  ayudas: AyudaEconomica[];
  transacciones: TransaccionBilletera[];
  comercializadores: Comercializador[];
}

export const CrmMetricasPowerBI: React.FC<CrmMetricasPowerBIProps> = ({
  socios,
  ayudas,
  transacciones,
  comercializadores
}) => {
  const chartBarrasRef = useRef<HTMLCanvasElement>(null);
  const chartDonaRef = useRef<HTMLCanvasElement>(null);
  const chartLineasRef = useRef<HTMLCanvasElement>(null);

  const instanceBarras = useRef<Chart | null>(null);
  const instanceDona = useRef<Chart | null>(null);
  const instanceLineas = useRef<Chart | null>(null);

  useEffect(() => {
    // 1. Gráfico de Barras: Colocación Mensual por Línea
    if (chartBarrasRef.current) {
      if (instanceBarras.current) instanceBarras.current.destroy();

      instanceBarras.current = new Chart(chartBarrasRef.current, {
        type: 'bar',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
          datasets: [
            {
              label: 'FEDEM Provincial ($)',
              data: [18500000, 22000000, 24500000, 29000000, 31000000, 34500000],
              backgroundColor: '#135596',
              borderRadius: 8
            },
            {
              label: 'Municipales QUAD ($)',
              data: [8200000, 9500000, 11000000, 12800000, 14200000, 16000000],
              backgroundColor: '#059669',
              borderRadius: 8
            },
            {
              label: 'Sidecreer ($)',
              data: [5400000, 6100000, 7200000, 8100000, 9000000, 9800000],
              backgroundColor: '#6366f1',
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => `$ ${(Number(val) / 1000000).toFixed(0)}M`
              }
            }
          }
        }
      });
    }

    // 2. Gráfico de Dona: Distribución de Cartera por Organismo
    if (chartDonaRef.current) {
      if (instanceDona.current) instanceDona.current.destroy();

      const provinciales = socios.filter((s) => s.Organismo.toLowerCase().includes('provincia')).length || 18;
      const municipales = socios.filter((s) => s.Organismo.toLowerCase().includes('municipal')).length || 12;
      const educacion = socios.filter((s) => s.Organismo.toLowerCase().includes('educación') || s.Organismo.toLowerCase().includes('cge')).length || 8;

      instanceDona.current = new Chart(chartDonaRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Provinciales Ley 8732', 'Municipales Paraná', 'CGE Docentes'],
          datasets: [
            {
              data: [provinciales, municipales, educacion],
              backgroundColor: ['#135596', '#059669', '#d97706'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // 3. Gráfico de Líneas: Consumos Diarios Comercios vs Farmacia
    if (chartLineasRef.current) {
      if (instanceLineas.current) instanceLineas.current.destroy();

      instanceLineas.current = new Chart(chartLineasRef.current, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          datasets: [
            {
              label: 'Farmacias ($)',
              data: [420000, 580000, 610000, 590000, 890000, 920000],
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              fill: true,
              tension: 0.3
            },
            {
              label: 'Comercios B2B ($)',
              data: [310000, 490000, 480000, 680000, 1150000, 1380000],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => `$ ${(Number(val) / 1000).toFixed(0)}k`
              }
            }
          }
        }
      });
    }

    return () => {
      if (instanceBarras.current) instanceBarras.current.destroy();
      if (instanceDona.current) instanceDona.current.destroy();
      if (instanceLineas.current) instanceLineas.current.destroy();
    };
  }, [socios]);

  const totalColocadoMes = 60300000;
  const totalCarteraActiva = 285400000;
  const tasaMoraGlobal = 2.4;
  const totalReintegrosEntregados = 4850000;

  return (
    <div className="space-y-6">
      {/* HEADER DE MÉTRICAS */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
          Módulo 7 • Inteligencia de Negocios
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Tablero Ejecutivo Power BI • Mutual Modelo
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoreo de colocaciones financieras, dispersión de riesgo, cobranza por organismo y ventas con QR.
        </p>
      </div>

      {/* TARJETAS KPI EJECUTIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Colocación del Mes</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatMonedaAR(totalColocadoMes)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">142 ayudas liquidadas</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Cartera Activa Administrada</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
              Vigente
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatMonedaAR(totalCarteraActiva)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Saldo nominal por cobrar</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Mora Temprana Global</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              Bajo Control
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {tasaMoraGlobal}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Retención automática haberes</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Pool Reintegros Entregados</span>
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
              Fidelidad
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatMonedaAR(totalReintegrosEntregados)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">En comercios y farmacia</p>
        </div>
      </div>

      {/* GRILLA DE GRÁFICOS POWER BI (CHART.JS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Colocación Mensual por Línea */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Colocación Mensual por Línea Oficial (Millones ARS)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Últimos 6 meses</span>
          </div>
          <div className="h-64 relative w-full">
            <canvas ref={chartBarrasRef}></canvas>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Organismo */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Distribución por Organismo
            </h3>
            <span className="text-xs text-slate-400">Padrón</span>
          </div>
          <div className="h-64 relative w-full flex items-center justify-center">
            <canvas ref={chartDonaRef}></canvas>
          </div>
        </div>

        {/* Gráfico 3: Consumo Diario en Red B2B */}
        <div className="lg:col-span-12 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Evolución Semanal de Transacciones con QR (Comercios vs. Farmacias)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Monto Operado Diario</span>
          </div>
          <div className="h-64 relative w-full">
            <canvas ref={chartLineasRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};
