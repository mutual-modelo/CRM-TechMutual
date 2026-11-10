import React, { useState } from 'react';
import {
  SocioPadron,
  AyudaEconomica,
  SeguimientoAlerta,
  Comercializador,
  LiquidacionComision,
  CesionCartera,
  LogIntegracionIA,
  ConfiguracionIA,
  OperadorMutual,
  ComercioAlianzaB2B,
  PromocionPoolReintegro,
  FidelidadSellosSocio,
  TransaccionBilletera,
  AdelantoLiquidacionComercio
} from './types/crm';
import {
  INITIAL_SOCIOS,
  INITIAL_AYUDAS,
  INITIAL_SEGUIMIENTOS,
  INITIAL_COMERCIALIZADORES,
  INITIAL_LIQUIDACIONES_COMISIONES,
  INITIAL_CESIONES_CARTERAS,
  INITIAL_LOGS_IA,
  INITIAL_CONFIG_IA,
  INITIAL_COMERCIOS_B2B,
  INITIAL_PROMOCIONES_POOL,
  INITIAL_FIDELIDAD_SELLOS,
  INITIAL_TRANSACCIONES_BILLETERA,
  OPERADORES_MUTUAL
} from './data/seedData';

// Componentes del Socio (App PWA estilo Mercado Pago / MODO)
import { SocioBottomNav, PantallaSocioType } from './components/socio/SocioBottomNav';
import { PantallaInicio } from './components/socio/PantallaInicio';
import { PantallaAyudas } from './components/socio/PantallaAyudas';
import { PantallaServicios } from './components/socio/PantallaServicios';
import { PantallaMapaComercios } from './components/socio/PantallaMapaComercios';
import { ModalCarnetQR } from './components/socio/ModalCarnetQR';
import { ModalFidelidadSellos } from './components/socio/ModalFidelidadSellos';

// Componentes del Comercio Aliado B2B
import { PortalComercioB2BView } from './components/comercio/PortalComercioB2BView';

// Módulos del CRM & Backoffice Financiero
import { CrmPadronYFicha360 } from './components/crm/CrmPadronYFicha360';
import { CrmSimuladorCombinado } from './components/crm/CrmSimuladorCombinado';
import { CrmCentroOperaciones } from './components/crm/CrmCentroOperaciones';
import { CrmComercializadores } from './components/crm/CrmComercializadores';
import { CrmCesionCarterasVPN } from './components/crm/CrmCesionCarterasVPN';
import { CrmAlianzasComercios } from './components/crm/CrmAlianzasComercios';
import { CrmMetricasPowerBI } from './components/crm/CrmMetricasPowerBI';
import { CrmIntegracionesIA } from './components/crm/CrmIntegracionesIA';

// Iconografía
import {
  Building2,
  Smartphone,
  Store,
  Users,
  Calculator,
  Activity,
  Percent,
  PieChart,
  Wallet,
  Bot,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

type PortalType = 'CRM' | 'SOCIO' | 'COMERCIO';

export function App() {
  // Estado del Portal Activo (Multiportal Conmutable)
  const [portalActivo, setPortalActivo] = useState<PortalType>('CRM');

  // Estado del CRM Backoffice
  const [crmModuloActivo, setCrmModuloActivo] = useState<
    | 'PADRON_FICHA'
    | 'SIMULADOR'
    | 'OPERACIONES'
    | 'COMERCIALIZADORES'
    | 'CARTERAS_VPN'
    | 'ALIANZAS'
    | 'METRICAS_BI'
    | 'INTEGRACIONES_IA'
  >('PADRON_FICHA');
  const [sidebarColapsada, setSidebarColapsada] = useState<boolean>(false);
  const [operadorActivo, setOperadorActivo] = useState<OperadorMutual>('Julian');

  // Estado de la App del Socio
  const [pantallaActivaSocio, setPantallaActivaSocio] = useState<PantallaSocioType>('INICIO');
  const [modalCarnetQRAbierto, setModalCarnetQRAbierto] = useState<boolean>(false);
  const [modalFidelidadAbierto, setModalFidelidadAbierto] = useState<boolean>(false);

  // Estados reactivos de datos (con seed inicial)
  const [socios, setSocios] = useState<SocioPadron[]>(INITIAL_SOCIOS);
  const [socioSesion, setSocioSesion] = useState<SocioPadron>(INITIAL_SOCIOS[0]);
  const [ayudas, setAyudas] = useState<AyudaEconomica[]>(INITIAL_AYUDAS);
  const [alertas, setAlertas] = useState<SeguimientoAlerta[]>(INITIAL_SEGUIMIENTOS);
  const [comercializadores, setComercializadores] = useState<Comercializador[]>(INITIAL_COMERCIALIZADORES);
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionComision[]>(INITIAL_LIQUIDACIONES_COMISIONES);
  const [cesiones, setCesiones] = useState<CesionCartera[]>(INITIAL_CESIONES_CARTERAS);
  const [comercios, setComercios] = useState<ComercioAlianzaB2B[]>(INITIAL_COMERCIOS_B2B);
  const [comercioSesion, setComercioSesion] = useState<ComercioAlianzaB2B>(INITIAL_COMERCIOS_B2B[0]);
  const [promociones, setPromociones] = useState<PromocionPoolReintegro[]>(INITIAL_PROMOCIONES_POOL);
  const [transacciones, setTransacciones] = useState<TransaccionBilletera[]>(INITIAL_TRANSACCIONES_BILLETERA);
  const [logsIA, setLogsIA] = useState<LogIntegracionIA[]>(INITIAL_LOGS_IA);
  const [configIA, setConfigIA] = useState<ConfiguracionIA>(INITIAL_CONFIG_IA);

  // ABM Handlers
  const handleGuardarSocio = (actualizado: SocioPadron) => {
    setSocios(socios.map((s) => (s.DNI === actualizado.DNI ? actualizado : s)));
    if (socioSesion.DNI === actualizado.DNI) {
      setSocioSesion(actualizado);
    }
  };

  const handleCrearSocio = (nuevo: SocioPadron) => {
    setSocios([nuevo, ...socios]);
  };

  const handleEliminarSocio = (dni: string) => {
    setSocios(socios.filter((s) => s.DNI !== dni));
  };

  const handleCrearAlerta = (nueva: SeguimientoAlerta) => {
    setAlertas([nueva, ...alertas]);
  };

  const handleActualizarAlerta = (act: SeguimientoAlerta) => {
    setAlertas(alertas.map((a) => (a.ID_Seguimiento === act.ID_Seguimiento ? act : a)));
  };

  const handleResolverAlerta = (id: string) => {
    setAlertas(alertas.map((a) => (a.ID_Seguimiento === id ? { ...a, Estado_Alerta: 'Resuelta' } : a)));
  };

  const handleCrearComercio = (nuevo: ComercioAlianzaB2B) => {
    setComercios([nuevo, ...comercios]);
  };

  const handleActualizarComercio = (act: ComercioAlianzaB2B) => {
    setComercios(comercios.map((c) => (c.ID_Comercio === act.ID_Comercio ? act : c)));
    if (comercioSesion.ID_Comercio === act.ID_Comercio) {
      setComercioSesion(act);
    }
  };

  const handleEliminarComercio = (id: string) => {
    setComercios(comercios.filter((c) => c.ID_Comercio !== id));
  };

  const handleNuevaVentaComercio = (venta: Partial<TransaccionBilletera>) => {
    const nuevaTx: TransaccionBilletera = {
      ID_Transaccion: `TX-${Date.now()}`,
      Fecha_Hora: new Date().toLocaleDateString('es-AR'),
      DNI_Socio: venta.DNI_Socio || socioSesion.DNI,
      Apellido_Nombre_Socio: socioSesion.Apellido_Nombre,
      ID_Comercio: venta.ID_Comercio || comercioSesion.ID_Comercio,
      Nombre_Comercio: venta.Nombre_Comercio || comercioSesion.Nombre_Fantasia,
      Rubro: comercioSesion.Rubro,
      Billetera_Utilizada: 'Disponible 1 - Cuenta Corriente',
      Monto_Total_Compra: venta.Monto_Total_Compra || 10000,
      Monto_Reintegro_Aplicado: 0,
      Monto_Neto_Financiado: venta.Monto_Total_Compra || 10000,
      Cuotas: venta.Cuotas || 3,
      Monto_Cuota: Math.round((venta.Monto_Total_Compra || 10000) / (venta.Cuotas || 3)),
      Metodo_Autorizacion: 'QR Dinámico Billetera',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      Liquidado_Al_Comercio: 'NO'
    };
    setTransacciones([nuevaTx, ...transacciones]);

    setComercios(
      comercios.map((c) =>
        c.ID_Comercio === nuevaTx.ID_Comercio
          ? {
              ...c,
              Saldo_Ventas_Pendientes: (c.Saldo_Ventas_Pendientes || 0) + (nuevaTx.Monto_Total_Compra * (1 - c.Arancel_Mutual_Pct / 100)),
              Total_Facturado_Historico: (c.Total_Facturado_Historico || 0) + nuevaTx.Monto_Total_Compra
            }
          : c
      )
    );
  };

  const handleSolicitarAnticipo = (anticipo: Partial<AdelantoLiquidacionComercio>) => {
    setComercios(
      comercios.map((c) =>
        c.ID_Comercio === anticipo.ID_Comercio
          ? {
              ...c,
              Saldo_Ventas_Pendientes: Math.max(0, (c.Saldo_Ventas_Pendientes || 0) - (anticipo.Monto_Ventas_Adelantadas || 0))
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      {/* BARRA SUPERIOR GLOBAL: CONMUTADOR DE LOS 3 PORTALES INDEPENDIENTES */}
      <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <img src="logo.jpg" alt="Mutual Modelo de Entre Ríos" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-extrabold tracking-tight block">
                Asociación Mutual Modelo de Entre Ríos
              </span>
              <span className="text-[10px] text-slate-400">Plataforma Fintech & CRM Multiportal</span>
            </div>
          </div>

          <div className="inline-flex p-1 bg-slate-800 rounded-2xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setPortalActivo('CRM')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                portalActivo === 'CRM'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>CRM Backoffice</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalActivo('SOCIO')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                portalActivo === 'SOCIO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App del Socio</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalActivo('COMERCIO')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                portalActivo === 'COMERCIO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Portal Comercio B2B</span>
            </button>
          </div>
        </div>
      </div>

      {/* PORTAL 1: CRM & BACKOFFICE FINANCIERO */}
      {portalActivo === 'CRM' && (
        <div className="flex min-h-[calc(100vh-49px)]">
          <aside
            className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shrink-0 z-30 ${
              sidebarColapsada ? 'w-20' : 'w-72'
            } hidden md:flex`}
          >
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                {!sidebarColapsada && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Módulos Operativos
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSidebarColapsada(!sidebarColapsada)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 mx-auto transition-colors"
                  title={sidebarColapsada ? 'Expandir barra' : 'Colapsar barra'}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-2 space-y-1">
                {[
                  { id: 'PADRON_FICHA', label: '1. Padrón General & Ficha 360°', icon: Users },
                  { id: 'SIMULADOR', label: '2. Simulador de Ayudas y WhatsApp', icon: Calculator },
                  { id: 'OPERACIONES', label: '3. Centro de Operaciones (Triple)', icon: Activity },
                  { id: 'COMERCIALIZADORES', label: '4. Comercializadores y Comisiones', icon: Percent },
                  { id: 'CARTERAS_VPN', label: '5. Cesión de Carteras (VPN)', icon: PieChart },
                  { id: 'ALIANZAS', label: '6. Alianzas B2B & Comercios', icon: Store },
                  { id: 'METRICAS_BI', label: '7. Métricas Power BI (Chart.js)', icon: BarChart3 },
                  { id: 'INTEGRACIONES_IA', label: '8. Integraciones IA & Webhooks', icon: Bot }
                ].map((modulo) => {
                  const Icon = modulo.icon;
                  const activo = crmModuloActivo === modulo.id;
                  return (
                    <button
                      key={modulo.id}
                      type="button"
                      onClick={() => setCrmModuloActivo(modulo.id as any)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-xs font-bold transition-all ${
                        activo
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title={modulo.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarColapsada && <span className="truncate">{modulo.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 border-t border-slate-100">
              {!sidebarColapsada ? (
                <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operador Activo</span>
                  <select
                    value={operadorActivo}
                    onChange={(e) => setOperadorActivo(e.target.value as any)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent mt-0.5 focus:outline-hidden"
                  >
                    {OPERADORES_MUTUAL.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mx-auto">
                  {operadorActivo.charAt(0)}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {crmModuloActivo === 'PADRON_FICHA' && (
              <CrmPadronYFicha360
                socios={socios}
                onGuardarSocio={handleGuardarSocio}
                onCrearSocio={handleCrearSocio}
                onEliminarSocio={handleEliminarSocio}
              />
            )}
            {crmModuloActivo === 'SIMULADOR' && <CrmSimuladorCombinado />}
            {crmModuloActivo === 'OPERACIONES' && (
              <CrmCentroOperaciones
                alertas={alertas}
                onCrearAlerta={handleCrearAlerta}
                onActualizarAlerta={handleActualizarAlerta}
                onResolverAlerta={handleResolverAlerta}
              />
            )}
            {crmModuloActivo === 'COMERCIALIZADORES' && (
              <CrmComercializadores
                comercializadores={comercializadores}
                liquidaciones={liquidaciones}
                onCrearComercializador={(c) => setComercializadores([c, ...comercializadores])}
                onActualizarComercializador={(c) =>
                  setComercializadores(comercializadores.map((x) => (x.ID_Comercializador === c.ID_Comercializador ? c : x)))
                }
              />
            )}
            {crmModuloActivo === 'CARTERAS_VPN' && (
              <CrmCesionCarterasVPN
                ayudas={ayudas}
                onEjecutarCesion={(c) => setCesiones([c as any, ...cesiones])}
              />
            )}
            {crmModuloActivo === 'ALIANZAS' && (
              <CrmAlianzasComercios
                comercios={comercios}
                promociones={promociones}
                onCrearComercio={handleCrearComercio}
                onActualizarComercio={handleActualizarComercio}
                onEliminarComercio={handleEliminarComercio}
              />
            )}
            {crmModuloActivo === 'METRICAS_BI' && (
              <CrmMetricasPowerBI
                socios={socios}
                ayudas={ayudas}
                transacciones={transacciones}
                comercializadores={comercializadores}
              />
            )}
            {crmModuloActivo === 'INTEGRACIONES_IA' && (
              <CrmIntegracionesIA
                logsIA={logsIA}
                configIA={configIA}
                onGuardarConfig={(c) => setConfigIA({ ...configIA, ...c })}
                onEjecutarPruebaWebhook={() => {
                  const nuevoLog: LogIntegracionIA = {
                    ID_Log: `LOG-${Date.now()}`,
                    Fecha_Hora: new Date().toLocaleTimeString('es-AR'),
                    Canal_Agente: 'Sistema Interno',
                    Evento_Accion: 'Webhook Cobranza BERSA Recibido',
                    DNI_Relacionado: '30000000',
                    ID_Referencia: 'REF-8491',
                    Payload_Entrada_JSON: '{"origen": "BERSA", "estado": "OK"}',
                    Respuesta_Salida_JSON: '{"status": 200, "procesados": 184}',
                    Estado_Ejecucion: 'SUCCESS',
                    Latencia_Ms: 140
                  };
                  setLogsIA([nuevoLog, ...logsIA]);
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* PORTAL 2: APP PWA DEL SOCIO */}
      {portalActivo === 'SOCIO' && (
        <div className="bg-slate-200/90 min-h-[calc(100vh-49px)] py-4 flex items-center justify-center">
          <div className="w-full max-w-[480px] min-h-[92vh] bg-slate-50 border border-slate-300/80 shadow-2xl rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">Modo Demo Socio:</span>
              <select
                value={socioSesion.DNI}
                onChange={(e) => {
                  const encontrado = socios.find((s) => s.DNI === e.target.value);
                  if (encontrado) setSocioSesion(encontrado);
                }}
                className="text-xs bg-slate-800 text-slate-200 font-bold rounded-lg px-2 py-0.5 border border-slate-700"
              >
                {socios.map((s) => (
                  <option key={s.DNI} value={s.DNI}>
                    {s.Apellido_Nombre} (DNI {s.DNI})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {pantallaActivaSocio === 'INICIO' && (
                <PantallaInicio
                  socio={socioSesion}
                  transacciones={transacciones}
                  onCambiarPantalla={(p) => setPantallaActivaSocio(p)}
                  onAbrirCarnetQR={() => setModalCarnetQRAbierto(true)}
                  onAbrirFidelidad={() => setModalFidelidadAbierto(true)}
                />
              )}

              {pantallaActivaSocio === 'AYUDAS' && (
                <PantallaAyudas
                  socio={socioSesion}
                  ayudas={ayudas}
                  onSolicitarNuevaAyuda={(sol) => {
                    const nueva: AyudaEconomica = {
                      ID_Ayuda: `AYU-${Date.now().toString().slice(-4)}`,
                      Nro_Mutuo: `MUT-${Date.now().toString().slice(-5)}`,
                      Fecha_Solicitud: new Date().toLocaleDateString('es-AR'),
                      Fecha_Liquidacion: new Date().toLocaleDateString('es-AR'),
                      Periodo_Mes: '11/2026',
                      DNI: socioSesion.DNI,
                      Apellido_Nombre: socioSesion.Apellido_Nombre,
                      Linea_Ayuda: 'FEDEM Provincial',
                      Organismo: socioSesion.Organismo,
                      Originacion: 'Orgánica',
                      ID_Comercializador: 'DIR',
                      Nombre_Comercializador: 'Mutual Modelo Directo',
                      Monto_Solicitado: sol.monto,
                      Monto_Depositado: sol.monto,
                      Es_Refinanciacion: 'NO',
                      IDs_Ayudas_Canceladas: '',
                      Deudas_Manuales_JSON: '[]',
                      Monto_Retenido_Refi: 0,
                      Neto_Efectivo_Entregado: sol.monto,
                      Capital_Bruto: sol.monto * 1.34,
                      Gastos_Admin: sol.monto * 0.34,
                      Seguro_Total: sol.monto * 0.005 * sol.cuotas,
                      Intereses_Financieros: sol.monto * 0.5,
                      Total_A_Devolver: sol.monto * 1.832,
                      Cantidad_Cuotas: sol.cuotas,
                      Valor_Cuota: Math.round((sol.monto * 1.832) / sol.cuotas),
                      Cuotas_Pagadas: 0,
                      Cuotas_Restantes: sol.cuotas,
                      Saldo_Capital_Restante: sol.monto * 1.34,
                      Saldo_Total_Restante: sol.monto * 1.832,
                      Estado_Tramite: 'Solicitado',
                      Estado_Cobranza: 'Al Día',
                      Estado_Documentacion: 'Legajo Completo',
                      Checklist_Doc_JSON: '{}',
                      Carpeta_Legajo_URL: 'https://drive.google.com',
                      Archivos_Adjuntos_JSON: '[]',
                      Plan_Cuotas_JSON: '[]',
                      Cartera_Titular: 'Cartera Propia Mutual',
                      ID_Lote_Cesion: '',
                      Fecha_Cesion: '',
                      Observaciones: sol.destino,
                      Operador: 'Julian'
                    };
                    setAyudas([nueva, ...ayudas]);
                  }}
                />
              )}

              {pantallaActivaSocio === 'SERVICIOS' && (
                <PantallaServicios
                  socio={socioSesion}
                  onRegistrarTramite={(tr) => {
                    const nuevaAlerta: SeguimientoAlerta = {
                      ID_Seguimiento: `TR-${Date.now().toString().slice(-4)}`,
                      Fecha_Hora: new Date().toISOString().slice(0, 10),
                      DNI: socioSesion.DNI,
                      Apellido_Nombre: socioSesion.Apellido_Nombre,
                      ID_Ayuda_Relacionada: `AYU-SERV-${Date.now().toString().slice(-4)}`,
                      Tipo_Registro: 'Alerta Trámite',
                      Categoria: 'Alerta SLA',
                      Subtipo_Tramite: tr.tipo,
                      Prioridad: 'Media',
                      Fecha_Vencimiento_Alerta: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
                      Estado_Alerta: 'Pendiente',
                      Detalle_Gestion: `${tr.tipo}: ${tr.detalle}`,
                      Resultado_Proximo_Paso: 'Contacto con el socio',
                      Operador_Asignado: 'Melina',
                      Operador_Creador: 'Melina',
                      Notificado_WhatsApp: 'SI'
                    };
                    setAlertas([nuevaAlerta, ...alertas]);
                  }}
                />
              )}

              {pantallaActivaSocio === 'COMERCIOS' && (
                <PantallaMapaComercios
                  comercios={comercios}
                  promociones={promociones}
                  onSeleccionarParaPagoQR={(c) => {
                    setModalCarnetQRAbierto(true);
                  }}
                />
              )}
            </div>

            <SocioBottomNav
              pantallaActiva={pantallaActivaSocio}
              onCambiarPantalla={(p) => setPantallaActivaSocio(p)}
              onAbrirCarnetQR={() => setModalCarnetQRAbierto(true)}
            />

            {modalCarnetQRAbierto && (
              <ModalCarnetQR
                socio={socioSesion}
                onClose={() => setModalCarnetQRAbierto(false)}
                onQRComercioEscaneado={(codigo) => {
                  handleNuevaVentaComercio({
                    Monto_Total_Compra: 12500,
                    Cuotas: 3,
                    DNI_Socio: socioSesion.DNI
                  });
                }}
              />
            )}

            {modalFidelidadAbierto && (
              <ModalFidelidadSellos
                fidelidad={{
                  ID_Registro: `FID-${socioSesion.DNI}`,
                  DNI_Socio: socioSesion.DNI,
                  Apellido_Nombre: socioSesion.Apellido_Nombre,
                  Sellos_Acumulados: 7,
                  Ciclos_Completados: 2,
                  Puntos_Totales: 350,
                  Vouchers_Emitidos_JSON: '[]',
                  Ultima_Actualizacion: new Date().toLocaleDateString('es-AR'),
                  Historial_Sellos_JSON: '[]'
                }}
                onClose={() => setModalFidelidadAbierto(false)}
                onCanjearPremio={() => {
                  alert('¡Premio Canjeado! Tu orden de compra de $25.000 está acreditada.');
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* PORTAL 3: PORTAL DEL COMERCIO ALIADO B2B */}
      {portalActivo === 'COMERCIO' && (
        <PortalComercioB2BView
          comercioActual={comercioSesion}
          todosLosComercios={comercios}
          promociones={promociones}
          transacciones={transacciones}
          onNuevaVenta={handleNuevaVentaComercio}
          onCrearPromocion={(p) => setPromociones([p as any, ...promociones])}
          onEliminarPromocion={(id) => setPromociones(promociones.filter((p) => p.ID_Promo !== id))}
          onSolicitarAnticipo={handleSolicitarAnticipo}
          onCambiarComercio={(c) => setComercioSesion(c)}
          onCerrarSesion={() => setPortalActivo('CRM')}
        />
      )}
    </div>
  );
}

export default App;
