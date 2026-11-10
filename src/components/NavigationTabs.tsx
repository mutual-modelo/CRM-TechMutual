import React from 'react';
import { Users, Calculator, Banknote, BellRing, CalendarDays, Briefcase, Layers, Terminal } from 'lucide-react';

export type TabKey =
  | 'asociados'
  | 'simuladores'
  | 'ayudas'
  | 'alertas'
  | 'liquidaciones'
  | 'comercializadores'
  | 'carteras-ia'
  | 'despliegue-gas';

interface NavigationTabsProps {
  tabActiva: TabKey;
  onCambiarTab: (tab: TabKey) => void;
  conteoAyudasPendientes: number;
  conteoAlertasCriticas: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  tabActiva,
  onCambiarTab,
  conteoAyudasPendientes,
  conteoAlertasCriticas
}) => {
  const tabs = [
    { id: 'asociados' as TabKey, label: '1. Asociados & Ficha 360°', icon: Users },
    { id: 'simuladores' as TabKey, label: '2. Simuladores & Recibos', icon: Calculator },
    {
      id: 'ayudas' as TabKey,
      label: '3. Ayudas Económicas & Legajos',
      icon: Banknote,
      badge: conteoAyudasPendientes > 0 ? conteoAyudasPendientes : null,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'alertas' as TabKey,
      label: '4. Seguimientos & Alertas',
      icon: BellRing,
      badge: conteoAlertasCriticas > 0 ? conteoAlertasCriticas : null,
      badgeColor: 'bg-rose-100 text-rose-700 font-bold'
    },
    { id: 'liquidaciones' as TabKey, label: '5. Liquidaciones por Fechas', icon: CalendarDays },
    { id: 'comercializadores' as TabKey, label: '6. Comercializadores & Comisiones', icon: Briefcase },
    { id: 'carteras-ia' as TabKey, label: '7. Carteras, Cesiones & IA', icon: Layers },
    { id: 'despliegue-gas' as TabKey, label: '8. Despliegue Apps Script (8 Archivos)', icon: Terminal, highlight: true }
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const esActiva = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCambiarTab(tab.id)}
                className={`group inline-flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer rounded-t-md ${
                  esActiva
                    ? 'border-[#135596] text-[#135596] bg-blue-50/50'
                    : tab.highlight
                    ? 'border-transparent text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition ${
                    esActiva
                      ? 'text-[#135596]'
                      : tab.highlight
                      ? 'text-purple-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
