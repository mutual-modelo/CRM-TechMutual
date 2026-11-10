import React from 'react';
import {
  Users,
  UserCheck,
  Calculator,
  Activity,
  Percent,
  PieChart,
  Bot,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  FilePlus,
  BellPlus,
  Search,
  CheckCircle2,
  HardDrive,
  Wallet,
  Target
} from 'lucide-react';
import { TabKey, OperadorMutual } from '../types/crm';
import { OPERADORES_MUTUAL_LISTA } from '../data/seedData';

interface SidebarProps {
  tabActiva: TabKey;
  onCambiarTab: (tab: TabKey) => void;
  operadorActivo: OperadorMutual;
  onCambiarOperador: (op: OperadorMutual) => void;
  conteoAyudasPendientes: number;
  conteoAlertasCriticas: number;
  onAbrirModalSocio: () => void;
  onAbrirModalAyuda: () => void;
  onAbrirModalAlerta: () => void;
  onBusquedaRapida: (query: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tabActiva,
  onCambiarTab,
  operadorActivo,
  onCambiarOperador,
  conteoAyudasPendientes,
  conteoAlertasCriticas,
  onAbrirModalSocio,
  onAbrirModalAyuda,
  onAbrirModalAlerta,
  onBusquedaRapida,
  isCollapsed,
  onToggleCollapse
}) => {
  const [query, setQuery] = React.useState('');

  const menuItems = [
    {
      id: 'padron-socios' as TabKey,
      numero: '01',
      label: 'Padrón General de Socios',
      shortLabel: 'Padrón General',
      subtext: 'Buscador, filtros y exportación',
      icon: Users,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'ficha-socio-360' as TabKey,
      numero: '02',
      label: 'Ficha 360° del Socio (Perfil Detallado)',
      shortLabel: 'Ficha 360° Socio',
      subtext: 'Auditoría UIF/INAES, Drive, Familia',
      icon: UserCheck,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'simulador-originacion' as TabKey,
      numero: '03',
      label: 'Simulador Financiero & Originación',
      shortLabel: 'Simulador & Refi',
      subtext: 'FEDEM, VIKINGO, Sidecreer',
      icon: Calculator,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'centro-operaciones' as TabKey,
      numero: '04',
      label: 'Centro de Operaciones, Alertas SLA y Liquidaciones',
      shortLabel: 'Operaciones & SLA',
      subtext: 'Alertas multi-etapa y tesorería',
      icon: Activity,
      badge: conteoAyudasPendientes + conteoAlertasCriticas > 0 ? conteoAyudasPendientes + conteoAlertasCriticas : null,
      badgeColor: conteoAlertasCriticas > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
    },
    {
      id: 'comercializadores' as TabKey,
      numero: '05',
      label: 'Padrón y Liquidación de Comercializadores',
      shortLabel: 'Comercializadores',
      subtext: 'CRUD agentes, bases, comisiones',
      icon: Percent,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'carteras-vpn' as TabKey,
      numero: '06',
      label: 'Consola de Cesión y Carteras (VPN)',
      shortLabel: 'Carteras VPN',
      subtext: 'Valuación, lotes y auditoría',
      icon: PieChart,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'alianzas-billetera' as TabKey,
      numero: '07',
      label: 'Ecosistema Alianzas & Billetera Mutual',
      shortLabel: 'Alianzas & Billetera',
      subtext: 'Comercios B2B, QR, Reintegros, Sellos',
      icon: Wallet,
      badge: 'Billetera',
      badgeColor: 'bg-indigo-600 text-white'
    },
    {
      id: 'recibos-ai-webhooks' as TabKey,
      numero: '08',
      label: 'Analizador Recibos IA & Webhooks',
      shortLabel: 'Recibos IA & Bot',
      subtext: 'Gemini OCR, Darwin, WhatsApp',
      icon: Bot,
      badge: 'IA',
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      id: 'marketing-leads' as TabKey,
      numero: '09',
      label: 'Funnel de Leads & Marketing Digital',
      shortLabel: 'Marketing & Leads',
      subtext: 'Meta Ads, TikTok, CPL, CAC, Funnel',
      icon: Target,
      badge: 'Growth',
      badgeColor: 'bg-amber-500 text-slate-950 font-extrabold'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onBusquedaRapida(query.trim());
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Cabecera Institucional con Posicionamiento Flex Independiente (CORRECCIÓN Z-INDEX Y NO-OVERLAP) */}
      <div className="p-3 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0e3b68]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex-shrink-0 shadow-md border border-slate-700 flex items-center justify-center">
                <img
                  src="./logo.jpg"
                  alt="Mutual Modelo"
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase leading-none">
                  Asociación Mutual
                </span>
                <h1 className="text-sm font-extrabold text-white tracking-tight truncate">
                  Modelo Entre Ríos
                </h1>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  CRM & Backoffice
                </span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              title="Colapsar barra lateral"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700 flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Modo Colapsado: Contenedores flex verticales independientes para Isotipo y Botón (Sin superposiciones) */
          <div className="flex flex-col items-center justify-center gap-2.5 py-1">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-700 flex items-center justify-center">
              <img
                src="./logo.jpg"
                alt="Mutual Modelo"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <button
              onClick={onToggleCollapse}
              title="Expandir barra lateral"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700 cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Operador Activo */}
      <div className={`p-3 border-b border-slate-800 bg-slate-950/40 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                Operador en Turno
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Online
              </span>
            </div>
            <select
              value={operadorActivo}
              onChange={(e) => onCambiarOperador(e.target.value as OperadorMutual)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {OPERADORES_MUTUAL_LISTA.map((op) => (
                <option key={op} value={op}>
                  👤 {op} (Oficial de Crédito)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div
            title={`Operador activo: ${operadorActivo}`}
            className="w-9 h-9 mx-auto rounded-full bg-blue-900 border border-blue-500 flex items-center justify-center font-bold text-xs text-blue-200 shadow-sm"
          >
            {operadorActivo.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Búsqueda Rápida (Solo cuando está expandido) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar DNI o Apellido..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>
        </div>
      )}

      {/* Menú de los 7 Módulos Independientes */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className={`px-2 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? 'MÓD' : 'Módulos Operativos (7)'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const esActiva = tabActiva === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onCambiarTab(item.id)}
              title={isCollapsed ? `${item.numero}. ${item.label}` : undefined}
              className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all relative cursor-pointer ${
                esActiva
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg flex-shrink-0 transition ${
                  esActiva
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider opacity-60">
                      {item.numero}
                    </span>
                    {item.badge !== null && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold truncate leading-tight">
                    {item.shortLabel}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate opacity-80 leading-none mt-0.5">
                    {item.subtext}
                  </div>
                </div>
              )}

              {/* Indicador de píldora cuando está colapsado y activo */}
              {isCollapsed && esActiva && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-400 rounded-r" />
              )}
              {isCollapsed && item.badge !== null && (
                <span
                  className={`absolute -top-1 -right-1 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ${item.badgeColor}`}
                >
                  {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Acciones Rápidas */}
        {!isCollapsed && (
          <div className="pt-3 mt-2 border-t border-slate-800 px-1 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Acciones Directas
            </div>
            <button
              onClick={onAbrirModalSocio}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>Nuevo Asociado</span>
            </button>
            <button
              onClick={onAbrirModalAyuda}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60 cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nueva Ayuda / Refi</span>
            </button>
            <button
              onClick={onAbrirModalAlerta}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60 cursor-pointer"
            >
              <BellPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Registrar Alerta SLA</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer del Sidebar: Cumplimiento y Drive Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px]">
        {!isCollapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Auditoría UIF/INAES
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                Activa
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Drive Legajos
              </span>
              <span className="text-[10px] text-blue-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sincronizado
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
              <span>Google Apps Script V8</span>
              <span className="font-mono">v4.0.0</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1 text-slate-400" title="Auditoría UIF/INAES Activa - Drive Sincronizado">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
