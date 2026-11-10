import React from 'react';
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
  EstadoTramite,
  EstadoAlerta,
  TabKey,
  ComercioAlianzaB2B,
  PromocionPoolReintegro,
  FidelidadSellosSocio,
  TransaccionBilletera,
  AdelantoLiquidacionComercio,
  PortalType,
  SesionUsuario
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
  INITIAL_SUBSIDIOS_CONSUMOS,
  INITIAL_AUDITORIA_IA_LEGAJOS,
  INITIAL_HISTORIAL_COMISIONES,
  INITIAL_COMERCIOS_B2B,
  INITIAL_PROMOCIONES_POOL,
  INITIAL_FIDELIDAD_SELLOS,
  INITIAL_TRANSACCIONES_BILLETERA,
  INITIAL_ADELANTOS_LIQUIDACION,
  OPERADORES_MUTUAL
} from './data/seedData';
import {
  SubsidioYConsumo,
  AuditoriaIALegajo,
  HistorialComisionComercializador,
  FamiliarSocio
} from './types/crm';
import { Sidebar } from './components/Sidebar';
import { ScreenPadronSocios } from './components/screens/ScreenPadronSocios';
import { ScreenFichaSocio360 } from './components/screens/ScreenFichaSocio360';
import { ScreenSimuladorOriginacion } from './components/screens/ScreenSimuladorOriginacion';
import { ScreenCentroOperaciones } from './components/screens/ScreenCentroOperaciones';
import { ScreenComercializadores } from './components/screens/ScreenComercializadores';
import { ScreenCarterasVPN } from './components/screens/ScreenCarterasVPN';
import { ScreenAlianzasBilletera } from './components/screens/ScreenAlianzasBilletera';
import { ScreenRecibosAIWebhooks } from './components/screens/ScreenRecibosAIWebhooks';
import { ScreenMarketingLeads } from './components/screens/ScreenMarketingLeads';
import { PortalSwitcherHeader } from './components/portals/PortalSwitcherHeader';
import { PortalLoginModal } from './components/portals/PortalLoginModal';
import { PortalSocioApp } from './components/portals/PortalSocioApp';
import { PortalComercioB2B } from './components/portals/PortalComercioB2B';
import { ModalSocio } from './components/modals/ModalSocio';
import { ModalAyuda } from './components/modals/ModalAyuda';
import { ModalSeguimiento } from './components/modals/ModalSeguimiento';
import { ModalComercializador } from './components/modals/ModalComercializador';
import { ModalCesionCartera } from './components/modals/ModalCesionCartera';
import {
  Menu,
  Search,
  UserPlus,
  FilePlus,
  BellPlus,
  Users,
  Calculator,
  Activity,
  Percent,
  PieChart,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Target
} from 'lucide-react';

export default function App() {
  const [tabActiva, setTabActiva] = React.useState<TabKey>('padron-socios');
  const [operadorActivo, setOperadorActivo] = React.useState<OperadorMutual>('Julian');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Estados de Base de Datos
  const [socios, setSocios] = React.useState<SocioPadron[]>(INITIAL_SOCIOS);
  const [ayudas, setAyudas] = React.useState<AyudaEconomica[]>(INITIAL_AYUDAS);
  const [seguimientos, setSeguimientos] = React.useState<SeguimientoAlerta[]>(INITIAL_SEGUIMIENTOS);
  const [comercializadores, setComercializadores] = React.useState<Comercializador[]>(INITIAL_COMERCIALIZADORES);
  const [liquidaciones, setLiquidaciones] = React.useState<LiquidacionComision[]>(INITIAL_LIQUIDACIONES_COMISIONES);
  const [cesiones, setCesiones] = React.useState<CesionCartera[]>(INITIAL_CESIONES_CARTERAS);
  const [subsidiosYConsumos, setSubsidiosYConsumos] = React.useState<SubsidioYConsumo[]>(INITIAL_SUBSIDIOS_CONSUMOS);
  const [auditoriasIALegajos, setAuditoriasIALegajos] = React.useState<AuditoriaIALegajo[]>(INITIAL_AUDITORIA_IA_LEGAJOS);
  const [historialComisiones, setHistorialComisiones] = React.useState<HistorialComisionComercializador[]>(INITIAL_HISTORIAL_COMISIONES);
  const [logsIA, setLogsIA] = React.useState<LogIntegracionIA[]>(INITIAL_LOGS_IA);
  const [configIA, setConfigIA] = React.useState<ConfiguracionIA>(INITIAL_CONFIG_IA);
  const [comerciosB2B, setComerciosB2B] = React.useState<ComercioAlianzaB2B[]>(INITIAL_COMERCIOS_B2B);
  const [promocionesPool, setPromocionesPool] = React.useState<PromocionPoolReintegro[]>(INITIAL_PROMOCIONES_POOL);
  const [fidelidadSellos, setFidelidadSellos] = React.useState<FidelidadSellosSocio[]>(INITIAL_FIDELIDAD_SELLOS);
  const [transaccionesBilletera, setTransaccionesBilletera] = React.useState<TransaccionBilletera[]>(INITIAL_TRANSACCIONES_BILLETERA);
  const [adelantosLiquidacion, setAdelantosLiquidacion] = React.useState<AdelantoLiquidacionComercio[]>(INITIAL_ADELANTOS_LIQUIDACION);

  // Estados de Portales y Sesión (Edición Enterprise v5.0)
  const [portalActivo, setPortalActivo] = React.useState<PortalType>('portal-crm-admin');
  const [sesionActual, setSesionActual] = React.useState<SesionUsuario | null>({
    tipo: 'OPERADOR_CRM',
    idUsuario: 'Julian',
    nombre: 'Operador Julian',
    rol: 'Backoffice & Tesorería Mutual',
    fechaIngreso: new Date().toISOString()
  });
  const [modalLoginAbierto, setModalLoginAbierto] = React.useState(false);
  const [portalLoginDestino, setPortalLoginDestino] = React.useState<PortalType>('portal-socio-app');

  // Estados de selección y modales
  const [socioSeleccionado, setSocioSeleccionado] = React.useState<SocioPadron | null>(INITIAL_SOCIOS[0]);
  const [modalAbierto, setModalAbierto] = React.useState<
    'socio' | 'ayuda' | 'seguimiento' | 'comercializador' | 'cesion' | null
  >(null);
  const [socioAEditar, setSocioAEditar] = React.useState<SocioPadron | null>(null);
  const [planPreseleccionado, setPlanPreseleccionado] = React.useState<{
    linea: string;
    monto: number;
    cuotas: number;
    valorCuota: number;
    esRefi?: boolean;
    idsCancelados?: string[];
    montoRetenido?: number;
  } | null>(null);
  const [cesionDataTemp, setCesionDataTemp] = React.useState<{
    ids: string[];
    resumen: any;
  } | null>(null);

  // Notificaciones Toast
  const [toastMsg, setToastMsg] = React.useState<{ text: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const mostrarToast = (text: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Badges computados
  const conteoAyudasPendientes = React.useMemo(() => {
    return ayudas.filter((a) => a.Estado_Tramite === 'Solicitado' || a.Estado_Tramite === 'En Evaluación').length;
  }, [ayudas]);

  const conteoAlertasCriticas = React.useMemo(() => {
    return seguimientos.filter(
      (s) => s.Estado_Alerta !== 'Resuelta' && (s.estadoTemporalAlerta === 'VENCIDA' || s.Prioridad === 'Urgente')
    ).length;
  }, [seguimientos]);

  // Manejadores de acciones
  const handleGuardarSocio = (datos: Partial<SocioPadron>) => {
    const existe = socios.find((s) => s.DNI === datos.DNI);
    let updated: SocioPadron[];

    if (existe) {
      updated = socios.map((s) => (s.DNI === datos.DNI ? ({ ...s, ...datos } as SocioPadron) : s));
      mostrarToast(`Socio ${datos.Apellido_Nombre} actualizado con éxito.`);
    } else {
      const nuevo: SocioPadron = {
        DNI: datos.DNI || '',
        Nro_Socio: datos.Nro_Socio || `SOC-${Math.floor(10000 + Math.random() * 90000)}`,
        Apellido_Nombre: datos.Apellido_Nombre || '',
        Fecha_Nacimiento: datos.Fecha_Nacimiento || '1985-01-01',
        Edad: datos.Edad || 40,
        Sexo: datos.Sexo || 'F',
        Domicilio: datos.Domicilio || '',
        Localidad: datos.Localidad || 'Paraná',
        Telefono_WhatsApp: datos.Telefono_WhatsApp || '',
        Email: datos.Email || '',
        CBU_Alias: datos.CBU_Alias || '',
        Banco: datos.Banco || 'Banco de Entre Ríos (BERSA)',
        Organismo: datos.Organismo || 'Consejo General de Educación (CGE)',
        Sector_Trabajo: datos.Sector_Trabajo || '',
        Dependencia_Funcion: datos.Dependencia_Funcion || '',
        Condicion_Laboral: datos.Condicion_Laboral || 'Planta Permanente',
        Legajo_Sueldo: `L-${Math.floor(100000 + Math.random() * 900000)}`,
        Sueldo_Bruto: datos.Sueldo_Bruto || 1000000,
        Afectaciones_Ley: datos.Afectaciones_Ley || 190000,
        Afectaciones_Particulares: datos.Afectaciones_Particulares || 100000,
        Sueldo_Neto: datos.Sueldo_Neto || 710000,
        Margen_Cuota_Disponible: datos.Margen_Cuota_Disponible || 183500,
        Monto_Preaprobado: (datos.Margen_Cuota_Disponible || 183500) * 10,
        Estado_Cuota_Social: datos.Estado_Cuota_Social || 'Al Día',
        Deuda_Cuota_Social: 0,
        En_Tramite_Jubilacion: datos.En_Tramite_Jubilacion || 'NO',
        Detalle_Jubilacion: datos.Detalle_Jubilacion || '',
        Bloqueado_Legales: datos.Bloqueado_Legales || 'NO',
        Detalle_Legales: datos.Detalle_Legales || '',
        Pagos_Duplicados: datos.Pagos_Duplicados || 'NO',
        Detalle_Pagos_Duplicados: datos.Detalle_Pagos_Duplicados || '',
        Alivio_Financiero: datos.Alivio_Financiero || 'NO',
        Mutuales_Alivio: datos.Mutuales_Alivio || '',
        Certificacion_Deuda: datos.Certificacion_Deuda || 'NO',
        Detalle_Certificacion: datos.Detalle_Certificacion || '',
        Estado_PEP: datos.Estado_PEP || 'NO_PEP',
        Detalle_PEP: datos.Detalle_PEP || 'Sin vinculación con personas expuestas políticamente.',
        Estado_REPET: datos.Estado_REPET || 'LIMPIO',
        Detalle_REPET: datos.Detalle_REPET || 'Sin coincidencias.',
        Estado_ARCA_Constancia: datos.Estado_ARCA_Constancia || 'ACTIVO_REGULAR',
        CUIT_ARCA: datos.CUIT_ARCA || `CUIT ${datos.DNI}`,
        Estado_Inhibicion_Judicial: datos.Estado_Inhibicion_Judicial || 'HABILITADO',
        Condicion_Previsional: datos.Condicion_Previsional || 'ACTIVO_APORTANTE',
        Fecha_Auditoria_Normativa: new Date().toISOString().slice(0, 10),
        Subsidios_JSON: '[]',
        Grupo_Familiar_JSON: '[]',
        Carpeta_Drive_ID: `DRIVE_FLD_${datos.DNI}`,
        Carpeta_Drive_URL: `https://drive.google.com/drive/folders/DRIVE_FLD_${datos.DNI}`,
        Originacion: datos.Originacion || 'Orgánica',
        Fecha_Alta: new Date().toISOString().slice(0, 10),
        Ultima_Actualizacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
        Operador: operadorActivo
      };
      updated = [nuevo, ...socios];
      mostrarToast(`Nuevo socio ${datos.Apellido_Nombre} dado de alta con legajo en Drive.`);
    }

    setSocios(updated);
    if (socioSeleccionado?.DNI === datos.DNI) {
      setSocioSeleccionado(updated.find((s) => s.DNI === datos.DNI) || null);
    }
    setModalAbierto(null);
    setSocioAEditar(null);
  };

  const handleGuardarAyuda = (datos: Partial<AyudaEconomica>) => {
    let nuevasAyudas = [...ayudas];

    // LÓGICA DE REFINANCIACIÓN: Cancelación automática de préstamos vigentes asociados
    if (datos.Es_Refinanciacion === 'SI' && datos.IDs_Ayudas_Canceladas) {
      const idsCanceladas = datos.IDs_Ayudas_Canceladas.split(',').map((s) => s.trim());
      const hoy = new Date().toISOString().slice(0, 10);

      nuevasAyudas = nuevasAyudas.map((ay) => {
        if (idsCanceladas.includes(ay.ID_Ayuda)) {
          return {
            ...ay,
            Estado_Tramite: 'Cancelado por Refinanciación',
            Estado_Cobranza: 'Cancelado Total',
            Saldo_Capital_Restante: 0,
            Saldo_Total_Restante: 0,
            Cuotas_Restantes: 0,
            Observaciones: `${ay.Observaciones ? ay.Observaciones + ' ' : ''}[Cancelado por refinanciación en ${datos.ID_Ayuda} el ${hoy}]`
          };
        }
        return ay;
      });
    }

    nuevasAyudas = [datos as AyudaEconomica, ...nuevasAyudas];
    setAyudas(nuevasAyudas);
    setModalAbierto(null);
    setPlanPreseleccionado(null);
    mostrarToast(`Solicitud ${datos.ID_Ayuda} registrada exitosamente.`);
  };

  const handleCambiarEstadoAyuda = (idAyuda: string, nuevoEstado: EstadoTramite) => {
    setAyudas((prev) =>
      prev.map((a) => {
        if (a.ID_Ayuda === idAyuda) {
          return {
            ...a,
            Estado_Tramite: nuevoEstado,
            Fecha_Liquidacion: nuevoEstado === 'Liquidado' ? new Date().toISOString().slice(0, 10) : a.Fecha_Liquidacion
          };
        }
        return a;
      })
    );
    mostrarToast(`Estado de la ayuda ${idAyuda} actualizado a ${nuevoEstado}.`);
  };

  const handleSubirArchivoDrive = (socio: SocioPadron, tipoDoc: string, file: File) => {
    const ahora = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const idAudit = `AUD-IA-${Date.now().toString().slice(-4)}`;

    // Generar dictamen automático de IA según el tipo de documento
    let dictamen: 'Aprobado 🟢' | 'Observado 🟡' | 'Legibilidad Baja 🔴' = 'Aprobado 🟢';
    let score = 96;
    let comentarios = `Auditoría Gemini OCR completada con éxito. Documento tipo ${tipoDoc} auténtico y legible para ${socio.Apellido_Nombre}.`;
    let datosJSON = JSON.stringify({
      archivo: file.name,
      tipo: tipoDoc,
      dniSocio: socio.DNI,
      nombreSocio: socio.Apellido_Nombre,
      fechaAnalisis: ahora,
      autenticidad: '100% Coincidente con Padrón'
    });

    if (tipoDoc === 'DNI') {
      score = 98;
      comentarios = `DNI ${socio.DNI} verificado. Nombre: ${socio.Apellido_Nombre}. CUIT ${socio.CUIT_ARCA || '20-' + socio.DNI + '-9'} activo. Sin alertas REPET.`;
      datosJSON = JSON.stringify({
        dni: socio.DNI,
        nombre: socio.Apellido_Nombre,
        cuit: socio.CUIT_ARCA,
        domicilio: socio.Domicilio,
        validez: 'Vigente'
      });
    } else if (tipoDoc === 'RECIBO') {
      score = 95;
      comentarios = `Recibo oficial de sueldo de ${socio.Organismo}. Haberes computables $${socio.Sueldo_Bruto.toLocaleString('es-AR')}, Neto $${socio.Sueldo_Neto.toLocaleString('es-AR')}. Margen 35% disponible validado.`;
      datosJSON = JSON.stringify({
        organismo: socio.Organismo,
        bruto: socio.Sueldo_Bruto,
        neto: socio.Sueldo_Neto,
        margenAfectacion: socio.Margen_Cuota_Disponible
      });
    } else if (tipoDoc === 'CBU') {
      score = 99;
      comentarios = `Constancia de CBU / Alias ${socio.CBU_Alias} de ${socio.Banco} verificada. Titularidad única coincidente.`;
      datosJSON = JSON.stringify({
        banco: socio.Banco,
        cbuAlias: socio.CBU_Alias,
        titular: socio.Apellido_Nombre
      });
    } else if (tipoDoc === 'SERVICIO') {
      score = 90;
      comentarios = `Factura de servicio con antigüedad menor a 60 días. Domicilio coincidente con ${socio.Domicilio}, ${socio.Localidad}.`;
      datosJSON = JSON.stringify({
        domicilioDetectado: socio.Domicilio,
        antiguedadDias: 24,
        titular: socio.Apellido_Nombre
      });
    }

    const nuevaAuditoria: AuditoriaIALegajo = {
      ID_Auditoria: idAudit,
      DNI: socio.DNI,
      Apellido_Nombre: socio.Apellido_Nombre,
      ID_Documento_Drive: `DRV_${Date.now().toString().slice(-6)}`,
      Nombre_Archivo: file.name,
      Tipo_Doc: tipoDoc as any,
      Version_Num: 1,
      Es_Version_Actual: true,
      Dictamen_IA: dictamen,
      Score_Riesgo: score,
      Fecha_Analisis: ahora,
      Comentarios_Tecnicos: comentarios,
      Datos_Extraidos_JSON: datosJSON,
      Operador: operadorActivo
    };

    setAuditoriasIALegajos([nuevaAuditoria, ...auditoriasIALegajos]);
    mostrarToast(`Comprobante ${file.name} analizado por IA y guardado en Drive.`);
  };

  const handleReemplazarDocumentoLegajo = (
    socio: SocioPadron,
    idDocAnterior: string,
    tipoDoc: string,
    file: File,
    motivo: string
  ) => {
    const ahora = new Date().toISOString().slice(0, 10);
    const anterior = auditoriasIALegajos.find((a) => a.ID_Auditoria === idDocAnterior);
    const nuevaVersion = anterior ? (anterior.Version_Num || 1) + 1 : 2;

    const idAudit = `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let dictamen: 'Aprobado 🟢' | 'Observado 🟡' | 'Ilegible 🔴' = 'Aprobado 🟢';
    let score = 97;
    let comentarios = `Reemplazo exitoso v${nuevaVersion} de ${tipoDoc}. Documento verificado por Gemini OCR sin observaciones. Motivo: ${motivo}.`;
    let datosJSON = JSON.stringify({
      archivo: file.name,
      tipo: tipoDoc,
      version: nuevaVersion,
      motivoReemplazo: motivo,
      dniSocio: socio.DNI,
      nombreSocio: socio.Apellido_Nombre,
      fechaAnalisis: ahora,
      estadoVersion: 'Vigente'
    });

    if (tipoDoc === 'RECIBO') {
      score = 98;
      comentarios = `Recibo de sueldo actualizado v${nuevaVersion}. Haberes computables $${socio.Sueldo_Bruto.toLocaleString('es-AR')}, Neto $${socio.Sueldo_Neto.toLocaleString('es-AR')}. Motivo: ${motivo}.`;
    }

    const nuevaAuditoria: AuditoriaIALegajo = {
      ID_Auditoria: idAudit,
      DNI: socio.DNI,
      Apellido_Nombre: socio.Apellido_Nombre,
      ID_Documento_Drive: `DRV_${Date.now().toString().slice(-6)}`,
      Nombre_Archivo: file.name,
      Tipo_Doc: tipoDoc as any,
      Version_Num: nuevaVersion,
      Es_Version_Actual: true,
      Fecha_Reemplazo: ahora,
      Motivo_Reemplazo: motivo,
      Dictamen_IA: dictamen,
      Score_Riesgo: score,
      Fecha_Analisis: ahora,
      Comentarios_Tecnicos: comentarios,
      Datos_Extraidos_JSON: datosJSON,
      Operador: operadorActivo
    };

    setAuditoriasIALegajos((prev) => [
      nuevaAuditoria,
      ...prev.map((a) => {
        if (a.DNI === socio.DNI && (a.ID_Auditoria === idDocAnterior || (a.Tipo_Doc === tipoDoc && a.Es_Version_Actual))) {
          return {
            ...a,
            Es_Version_Actual: false,
            Fecha_Reemplazo: ahora,
            Motivo_Reemplazo: motivo
          };
        }
        return a;
      })
    ]);

    mostrarToast(`Documento ${file.name} (v${nuevaVersion}) reemplazado y auditado por IA.`);
  };

  const handleActualizarAyuda = (idAyuda: string, cambios: Partial<AyudaEconomica>) => {
    setAyudas((prev) =>
      prev.map((a) => (a.ID_Ayuda === idAyuda ? { ...a, ...cambios } : a))
    );
    mostrarToast(`Ayuda Económica ${idAyuda} actualizada con éxito.`);
  };

  const handleActualizarConsumoSubsidio = (idConsumo: string, cambios: Partial<SubsidioYConsumo>) => {
    setSubsidiosYConsumos((prev) =>
      prev.map((c) => (c.ID_Consumo === idConsumo ? { ...c, ...cambios } : c))
    );
    mostrarToast(`Registro de consumo/subsidio actualizado.`);
  };

  const handleActualizarGrupoFamiliar = (dni: string, nuevoGrupo: FamiliarSocio[]) => {
    setSocios((prev) =>
      prev.map((s) => (s.DNI === dni ? { ...s, Grupo_Familiar_JSON: JSON.stringify(nuevoGrupo) } : s))
    );
    if (socioSeleccionado && socioSeleccionado.DNI === dni) {
      setSocioSeleccionado({
        ...socioSeleccionado,
        Grupo_Familiar_JSON: JSON.stringify(nuevoGrupo)
      });
    }
    mostrarToast('Padrón de grupo familiar actualizado.');
  };

  const handleNuevoConsumoSubsidio = (item: Partial<SubsidioYConsumo>) => {
    const id = `CSM-${new Date().toISOString().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
    const nuevo: SubsidioYConsumo = {
      ID_Consumo: id,
      DNI: item.DNI || '',
      Apellido_Nombre: item.Apellido_Nombre || '',
      Tipo_Registro: item.Tipo_Registro || 'CONSUMO_SERVICIO',
      Categoria: item.Categoria || 'Farmacia',
      Comercio_Proveedor: item.Comercio_Proveedor || '',
      Fecha: item.Fecha || new Date().toISOString().slice(0, 10),
      Monto: item.Monto || 0,
      Estado: item.Estado || 'Entregado / Aprobado',
      Observaciones: item.Observaciones || '',
      Operador: operadorActivo
    };
    setSubsidiosYConsumos([nuevo, ...subsidiosYConsumos]);
    mostrarToast(`Registro de ${nuevo.Categoria} por $${nuevo.Monto.toLocaleString('es-AR')} guardado.`);
  };

  const handleActualizarComercializador = (c: Comercializador, motivoCambio?: string) => {
    const anterior = comercializadores.find((x) => x.ID_Comercializador === c.ID_Comercializador);

    // Si cambió el porcentaje de comisión o la base de cálculo, registrar en historial
    if (anterior && (anterior.Porcentaje_Comision !== c.Porcentaje_Comision || anterior.Base_Calculo_Comision !== c.Base_Calculo_Comision)) {
      const nuevoLog: HistorialComisionComercializador = {
        ID_Log: `LOG-COM-${Date.now().toString().slice(-4)}`,
        ID_Comercializador: c.ID_Comercializador,
        Nombre_Comercializador: c.Nombre_Estudio_Agente,
        Fecha_Cambio: new Date().toISOString().slice(0, 10),
        Comision_Anterior: anterior.Porcentaje_Comision,
        Comision_Nueva: c.Porcentaje_Comision,
        Base_Calculo_Anterior: anterior.Base_Calculo_Comision,
        Base_Calculo_Nueva: c.Base_Calculo_Comision,
        Motivo_Modificacion: motivoCambio || 'Modificación general de ficha y condiciones',
        Operador: operadorActivo
      };
      setHistorialComisiones([nuevoLog, ...historialComisiones]);
    }

    setComercializadores((prev) =>
      prev.map((x) => (x.ID_Comercializador === c.ID_Comercializador ? c : x))
    );
    mostrarToast(`Ficha de ${c.Nombre_Estudio_Agente} actualizada con éxito.`);
  };

  const handleGuardarSeguimiento = (datos: Partial<SeguimientoAlerta>) => {
    setSeguimientos([datos as SeguimientoAlerta, ...seguimientos]);
    setModalAbierto(null);
    mostrarToast('Alerta de seguimiento registrada con éxito.');
  };

  const handleActualizarEstadoAlerta = (id: string, nuevoEstado: EstadoAlerta, resultado?: string) => {
    setSeguimientos((prev) =>
      prev.map((s) => {
        if (s.ID_Seguimiento === id) {
          return {
            ...s,
            Estado_Alerta: nuevoEstado,
            Resultado_Proximo_Paso: resultado || s.Resultado_Proximo_Paso
          };
        }
        return s;
      })
    );
    mostrarToast(`Alerta ${id} marcada como ${nuevoEstado}.`);
  };

  const handleAgregarEtapaGestion = (
    id: string,
    etapa: { accion: string; detalle: string; resultado?: string; nuevoEstado: EstadoAlerta }
  ) => {
    const ahora = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const nuevaEtapa = {
      idEtapa: `ETP-${Date.now().toString().slice(-6)}`,
      fechaHora: ahora,
      operador: operadorActivo,
      accion: etapa.accion,
      detalle: etapa.detalle,
      resultado: etapa.resultado,
      nuevoEstado: etapa.nuevoEstado
    };

    setSeguimientos((prev) =>
      prev.map((s) => {
        if (s.ID_Seguimiento === id) {
          let historial = [];
          if (s.Historial_Gestiones_JSON) {
            try {
              historial = JSON.parse(s.Historial_Gestiones_JSON);
            } catch {
              historial = [];
            }
          }
          historial.push(nuevaEtapa);

          return {
            ...s,
            Estado_Alerta: etapa.nuevoEstado,
            Resultado_Proximo_Paso: etapa.resultado || s.Resultado_Proximo_Paso,
            Historial_Gestiones_JSON: JSON.stringify(historial)
          };
        }
        return s;
      })
    );
    mostrarToast(`Nueva etapa de gestión registrada para la alerta ${id}.`);
  };

  const handleCancelarAlerta = (id: string) => {
    setSeguimientos((prev) =>
      prev.map((s) =>
        s.ID_Seguimiento === id
          ? {
              ...s,
              Estado_Alerta: 'Cancelada' as EstadoAlerta,
              Resultado_Proximo_Paso: 'Alerta cancelada por el operador.'
            }
          : s
      )
    );
    mostrarToast(`Alerta ${id} cancelada con éxito.`, 'info');
  };

  const handleGuardarComercializador = (datos: Partial<Comercializador>) => {
    setComercializadores([...comercializadores, datos as Comercializador]);
    setModalAbierto(null);
    mostrarToast(`Comercializador ${datos.Nombre_Estudio_Agente} registrado.`);
  };

  const handleEmitirLiquidacionComisiones = (payload: any) => {
    const idLiq = `LIQ-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nuevaLiq: LiquidacionComision = {
      ID_Liquidacion: idLiq,
      Fecha_Emision: new Date().toISOString().slice(0, 10),
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
      Deducciones_Ajustes: 0,
      Neto_A_Pagar_Comision: payload.netoAPagarComision,
      Estado_Pago: 'Pendiente de Pago',
      Fecha_Pago: '',
      Comprobante_Pago_URL: '',
      IDs_Ayudas_Incluidas_JSON: JSON.stringify(payload.idsAyudas),
      Operador: operadorActivo
    };

    setLiquidaciones([nuevaLiq, ...liquidaciones]);
    mostrarToast(`Liquidación ${idLiq} generada con éxito.`);
  };

  const handleCambiarEstadoPagoLiq = (
    idLiq: string,
    nuevoEstado: 'Pendiente de Pago' | 'Pagado' | 'Anulado'
  ) => {
    setLiquidaciones((prev) =>
      prev.map((l) =>
        l.ID_Liquidacion === idLiq
          ? {
              ...l,
              Estado_Pago: nuevoEstado,
              Fecha_Pago: nuevoEstado === 'Pagado' ? new Date().toISOString().slice(0, 10) : ''
            }
          : l
      )
    );
    mostrarToast(`Liquidación ${idLiq} marcada como ${nuevoEstado}.`);
  };

  const handleConfirmarCesion = (payload: any) => {
    const idLote = `CES-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hoy = new Date().toISOString().slice(0, 10);

    const nuevaCesion: CesionCartera = {
      ID_Lote_Cesion: idLote,
      Fecha_Cesion: hoy,
      Cesionario_Entidad_Destino: payload.cesionarioEntidad,
      CUIT_Cesionario: payload.cuitCesionario,
      Lineas_Incluidas: payload.lineasIncluidas,
      Cantidad_Creditos_Cedidos: payload.idsCreditos.length,
      Total_Monto_Original: payload.totalMontoOriginal,
      Total_Cuotas_Restantes: payload.totalCuotasRestantes,
      Saldo_Nominal_Cedido: payload.saldoNominalCedido,
      Tasa_Descuento_Aplicada_Pct: payload.tasaDescuentoPct,
      Precio_Venta_Cartera: payload.precioVentaVPN,
      Modalidad_Cobranza: payload.modalidadCobranza,
      Estado_Cesion: 'Vigente',
      IDs_Ayudas_Cedidas_JSON: JSON.stringify(payload.idsCreditos),
      Contrato_Drive_URL: `https://drive.google.com/drive/folders/CESION_${idLote}`,
      Observaciones: payload.observaciones,
      Operador: operadorActivo
    };

    const idsSet = new Set(payload.idsCreditos);
    setAyudas((prev) =>
      prev.map((a) => {
        if (idsSet.has(a.ID_Ayuda)) {
          return {
            ...a,
            Cartera_Titular: payload.cesionarioEntidad,
            ID_Lote_Cesion: idLote,
            Fecha_Cesion: hoy
          };
        }
        return a;
      })
    );

    setCesiones([nuevaCesion, ...cesiones]);
    setModalAbierto(null);
    setCesionDataTemp(null);
    mostrarToast(`Lote de cesión ${idLote} ejecutado con éxito.`);
  };

  const handleRevertirCesion = (idLote: string) => {
    setCesiones((prev) =>
      prev.map((c) => (c.ID_Lote_Cesion === idLote ? { ...c, Estado_Cesion: 'Revertido' as const } : c))
    );
    setAyudas((prev) =>
      prev.map((a) => {
        if (a.ID_Lote_Cesion === idLote) {
          return {
            ...a,
            Cartera_Titular: 'Cartera Propia Mutual',
            ID_Lote_Cesion: '',
            Fecha_Cesion: ''
          };
        }
        return a;
      })
    );
    mostrarToast(`Lote ${idLote} revertido. Créditos restituidos a Cartera Propia Mutual.`);
  };

  const handleSimularParaSocio = (socio: SocioPadron) => {
    setSocioSeleccionado(socio);
    setTabActiva('simulador-originacion');
  };

  const handleGuardarComercio = (c: Partial<ComercioAlianzaB2B>) => {
    if (c.ID_Comercio && comerciosB2B.some((x) => x.ID_Comercio === c.ID_Comercio)) {
      setComerciosB2B((prev) => prev.map((x) => (x.ID_Comercio === c.ID_Comercio ? ({ ...x, ...c } as ComercioAlianzaB2B) : x)));
      mostrarToast(`Comercio ${c.Nombre_Fantasia || ''} actualizado.`);
    } else {
      const nuevo: ComercioAlianzaB2B = {
        ID_Comercio: c.ID_Comercio || `COM-B2B-${Math.floor(100 + Math.random() * 900)}`,
        Nombre_Fantasia: c.Nombre_Fantasia || 'Comercio Adherido',
        Razon_Social: c.Razon_Social || c.Nombre_Fantasia || 'Comercio S.A.',
        Rubro: c.Rubro || 'Proveeduría',
        CUIT_Responsable: c.CUIT_Responsable || '30-71000000-9',
        Direccion: c.Direccion || 'Paraná, Entre Ríos',
        Localidad: c.Localidad || 'Paraná',
        Telefono_WhatsApp: c.Telefono_WhatsApp || '3434000000',
        Email: c.Email || 'contacto@comercio.com',
        Arancel_Mutual_Pct: c.Arancel_Mutual_Pct ?? 3.5,
        Planes_Cuotas_JSON: c.Planes_Cuotas_JSON || JSON.stringify([1, 3, 6, 12]),
        Acepta_Cuenta_Corriente: c.Acepta_Cuenta_Corriente || 'SI',
        Permite_Adelanto_Liquidacion: c.Permite_Adelanto_Liquidacion || 'SI',
        Tasa_Descuento_Adelanto_Pct: c.Tasa_Descuento_Adelanto_Pct ?? 3.0,
        PIN_Token_Acceso: c.PIN_Token_Acceso || '1234',
        Estado: c.Estado || 'Activo',
        Saldo_Ventas_Pendientes: c.Saldo_Ventas_Pendientes ?? 0,
        Total_Facturado_Historico: c.Total_Facturado_Historico ?? 0,
        Fecha_Alta: c.Fecha_Alta || new Date().toISOString().slice(0, 10),
        Observaciones: c.Observaciones || 'Comercio adherido al Ecosistema Alianzas B2B'
      };
      setComerciosB2B([nuevo, ...comerciosB2B]);
      mostrarToast(`Nuevo comercio ${nuevo.Nombre_Fantasia} registrado con éxito.`);
    }
  };

  const handleEditarComercio = (c: ComercioAlianzaB2B) => {
    setComerciosB2B((prev) => prev.map((x) => (x.ID_Comercio === c.ID_Comercio ? c : x)));
    mostrarToast(`Comercio ${c.Nombre_Fantasia} actualizado.`);
  };

  const handleCrearPromo = (promo: Partial<PromocionPoolReintegro>) => {
    const nueva: PromocionPoolReintegro = {
      ID_Promo: promo.ID_Promo || `PRM-${Math.floor(100 + Math.random() * 900)}`,
      ID_Comercio: promo.ID_Comercio || '',
      Nombre_Comercio: promo.Nombre_Comercio || '',
      Rubro: promo.Rubro || 'Proveeduría',
      Titulo: promo.Titulo || 'Campaña Reintegro Mutual',
      Pct_Descuento: promo.Pct_Descuento ?? 15,
      Tope_Mensual_Socio: promo.Tope_Mensual_Socio ?? 15000,
      Presupuesto_Pool_Total: promo.Presupuesto_Pool_Total ?? 1000000,
      Presupuesto_Consumido: 0,
      Dias_Semana_JSON: promo.Dias_Semana_JSON || JSON.stringify(['Lunes', 'Miércoles', 'Viernes']),
      Fecha_Inicio: promo.Fecha_Inicio || new Date().toISOString().slice(0, 10),
      Fecha_Fin: promo.Fecha_Fin || '2026-12-31',
      Estado: 'Vigente',
      Codigo_QR_Vidriera: promo.Codigo_QR_Vidriera || `QR-PROMO-${Date.now().toString().slice(-4)}`,
      Cupos_Totales: promo.Cupos_Totales ?? 100,
      Cupos_Utilizados: 0
    };
    setPromocionesPool([nueva, ...promocionesPool]);
    mostrarToast(`Campaña "${nueva.Titulo}" lanzada con éxito.`);
  };

  const handleNuevaTransaccionBilletera = (tx: Partial<TransaccionBilletera>) => {
    const idTx = tx.ID_Transaccion || `TX-BIL-${Date.now().toString().slice(-5)}`;
    const nuevaTx: TransaccionBilletera = {
      ID_Transaccion: idTx,
      Fecha_Hora: tx.Fecha_Hora || new Date().toISOString().replace('T', ' ').slice(0, 16),
      DNI_Socio: tx.DNI_Socio || '',
      Apellido_Nombre_Socio: tx.Apellido_Nombre_Socio || '',
      ID_Comercio: tx.ID_Comercio || '',
      Nombre_Comercio: tx.Nombre_Comercio || '',
      Rubro: tx.Rubro || 'Proveeduría',
      Billetera_Utilizada: tx.Billetera_Utilizada || 'Disponible 1 - Cuenta Corriente',
      Monto_Total_Compra: tx.Monto_Total_Compra || 0,
      Monto_Reintegro_Aplicado: tx.Monto_Reintegro_Aplicado || 0,
      Monto_Neto_Financiado: tx.Monto_Neto_Financiado || 0,
      Cuotas: tx.Cuotas || 1,
      Monto_Cuota: tx.Monto_Cuota || 0,
      Metodo_Autorizacion: tx.Metodo_Autorizacion || 'QR Dinámico Billetera',
      Estado_Transaccion: 'Aprobada',
      Token_Autorizacion: tx.Token_Autorizacion || 'AUTH-999',
      Liquidado_Al_Comercio: 'NO',
      ID_Promo_Aplicada: tx.ID_Promo_Aplicada
    };

    setTransaccionesBilletera([nuevaTx, ...transaccionesBilletera]);

    setComerciosB2B((prev) =>
      prev.map((c) => {
        if (c.ID_Comercio === nuevaTx.ID_Comercio) {
          return {
            ...c,
            Total_Facturado_Historico: c.Total_Facturado_Historico + nuevaTx.Monto_Total_Compra,
            Saldo_Ventas_Pendientes: c.Saldo_Ventas_Pendientes + nuevaTx.Monto_Neto_Financiado
          };
        }
        return c;
      })
    );

    if (nuevaTx.ID_Promo_Aplicada && nuevaTx.Monto_Reintegro_Aplicado > 0) {
      setPromocionesPool((prev) =>
        prev.map((p) => {
          if (p.ID_Promo === nuevaTx.ID_Promo_Aplicada) {
            return {
              ...p,
              Presupuesto_Consumido: p.Presupuesto_Consumido + nuevaTx.Monto_Reintegro_Aplicado,
              Cupos_Utilizados: p.Cupos_Utilizados + 1
            };
          }
          return p;
        })
      );
    }

    handleActualizarSellos(nuevaTx.DNI_Socio, 1, `Consumo en ${nuevaTx.Nombre_Comercio}`);
    mostrarToast(`Transacción ${nuevaTx.ID_Transaccion} aprobada por $${nuevaTx.Monto_Neto_Financiado.toLocaleString('es-AR')}.`);
  };

  const handleDesconocerTransaccion = (idTx: string, motivo: string) => {
    setTransaccionesBilletera((prev) =>
      prev.map((tx) =>
        tx.ID_Transaccion === idTx
          ? {
              ...tx,
              Estado_Transaccion: 'Desconocida por Socio' as const
            }
          : tx
      )
    );
    mostrarToast(`Transacción ${idTx} desconocida (${motivo}). Auditoría preventiva iniciada.`, 'danger');
  };

  const handleSolicitarAdelanto = (adelanto: Partial<AdelantoLiquidacionComercio>) => {
    const idAdelanto = adelanto.ID_Adelanto || `ADL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nuevo: AdelantoLiquidacionComercio = {
      ID_Adelanto: idAdelanto,
      Fecha_Solicitud: adelanto.Fecha_Solicitud || new Date().toISOString().slice(0, 10),
      ID_Comercio: adelanto.ID_Comercio || '',
      Nombre_Comercio: adelanto.Nombre_Comercio || '',
      Monto_Ventas_Adelantadas: adelanto.Monto_Ventas_Adelantadas || 0,
      Tasa_Descuento_Pct: adelanto.Tasa_Descuento_Pct || 3.0,
      Monto_Descuento_Financiero: adelanto.Monto_Descuento_Financiero || 0,
      Neto_Transferido: adelanto.Neto_Transferido || 0,
      CBU_Destino: adelanto.CBU_Destino || '',
      Estado: 'Liquidado',
      Operador: operadorActivo
    };

    setAdelantosLiquidacion([nuevo, ...adelantosLiquidacion]);

    setComerciosB2B((prev) =>
      prev.map((c) => {
        if (c.ID_Comercio === nuevo.ID_Comercio) {
          return {
            ...c,
            Saldo_Ventas_Pendientes: Math.max(0, c.Saldo_Ventas_Pendientes - nuevo.Monto_Ventas_Adelantadas)
          };
        }
        return c;
      })
    );

    mostrarToast(`Adelanto ${nuevo.ID_Adelanto} liquidado por $${nuevo.Neto_Transferido.toLocaleString('es-AR')}.`);
  };

  const handleActualizarSellos = (dni: string, sellosSumar: number, motivo: string) => {
    const socio = socios.find((s) => s.DNI === dni);
    const hoy = new Date().toISOString().slice(0, 10);

    setFidelidadSellos((prev) => {
      const index = prev.findIndex((f) => f.DNI_Socio === dni);
      if (index >= 0) {
        const actual = prev[index];
        const nuevosSellos = actual.Sellos_Acumulados + sellosSumar;
        let completadoCiclo = false;
        let sellosFinales = nuevosSellos;
        let ciclos = actual.Ciclos_Completados;
        let vouchers: any[] = [];
        try {
          vouchers = JSON.parse(actual.Vouchers_Emitidos_JSON || '[]');
        } catch {
          vouchers = [];
        }

        if (nuevosSellos >= 10) {
          completadoCiclo = true;
          ciclos += 1;
          sellosFinales = nuevosSellos % 10;
          vouchers.push({
            id: `VOU-${Date.now().toString().slice(-5)}`,
            titulo: 'Voucher $15.000 Premio 10 Sellos',
            monto: 15000,
            vencimiento: '2026-12-31',
            estado: 'Disponible'
          });
        }

        let historial: any[] = [];
        try {
          historial = JSON.parse(actual.Historial_Sellos_JSON || '[]');
        } catch {
          historial = [];
        }
        historial.push({
          fecha: hoy,
          sellosSumados: sellosSumar,
          motivo: motivo,
          operador: operadorActivo
        });

        const itemActualizado: FidelidadSellosSocio = {
          ...actual,
          Sellos_Acumulados: sellosFinales,
          Ciclos_Completados: ciclos,
          Puntos_Totales: actual.Puntos_Totales + (sellosSumar * 100),
          Vouchers_Emitidos_JSON: JSON.stringify(vouchers),
          Historial_Sellos_JSON: JSON.stringify(historial),
          Ultima_Actualizacion: hoy
        };

        if (completadoCiclo) {
          mostrarToast(`¡FELICITACIONES! Socio completó 10 sellos. Voucher de $15.000 emitido.`);
        }

        const nuevaLista = [...prev];
        nuevaLista[index] = itemActualizado;
        return nuevaLista;
      } else if (socio) {
        const nuevoRegistro: FidelidadSellosSocio = {
          ID_Registro: `FID-${Date.now().toString().slice(-5)}`,
          DNI_Socio: socio.DNI,
          Apellido_Nombre: socio.Apellido_Nombre,
          Sellos_Acumulados: Math.min(10, sellosSumar),
          Ciclos_Completados: 0,
          Puntos_Totales: sellosSumar * 100,
          Vouchers_Emitidos_JSON: '[]',
          Historial_Sellos_JSON: JSON.stringify([
            { fecha: hoy, sellosSumados: sellosSumar, motivo: motivo, operador: operadorActivo }
          ]),
          Ultima_Actualizacion: hoy
        };
        return [nuevoRegistro, ...prev];
      }
      return prev;
    });
  };

  const handleCambiarPortal = (nuevoPortal: PortalType) => {
    if (nuevoPortal === 'portal-socio-app' && sesionActual?.tipo !== 'SOCIO_APP') {
      setPortalLoginDestino('portal-socio-app');
      setModalLoginAbierto(true);
      return;
    }
    if (nuevoPortal === 'portal-comercio-b2b' && sesionActual?.tipo !== 'COMERCIO_B2B') {
      setPortalLoginDestino('portal-comercio-b2b');
      setModalLoginAbierto(true);
      return;
    }
    setPortalActivo(nuevoPortal);
  };

  const handleLoginExitoso = (sesion: SesionUsuario, portalDestino: PortalType) => {
    setSesionActual(sesion);
    if (sesion.tipo === 'SOCIO_APP') {
      const s = socios.find((soc) => soc.DNI === sesion.idUsuario);
      if (s) setSocioSeleccionado(s);
    }
    setPortalActivo(portalDestino);
    mostrarToast(`¡Bienvenido/a ${sesion.nombre}! Sesión iniciada con éxito.`);
  };

  const handleCerrarSesion = () => {
    setSesionActual(null);
    setPortalActivo('portal-crm-admin');
    mostrarToast('Sesión cerrada correctamente.', 'info');
  };

  const handleActualizarClaveSocio = (dni: string, nuevaClave: string) => {
    setSocios((prev) =>
      prev.map((s) => (s.DNI === dni ? { ...s, Clave_Acceso_Hash: nuevaClave } : s))
    );
    mostrarToast(`Clave de acceso para DNI ${dni} actualizada correctamente.`);
  };

  const handleActualizarClaveComercio = (cuit: string, nuevaClave: string) => {
    setComerciosB2B((prev) =>
      prev.map((c) => (c.CUIT_Responsable === cuit ? { ...c, Clave_Acceso_B2B_Hash: nuevaClave } : c))
    );
    mostrarToast(`Clave B2B para CUIT ${cuit} actualizada.`);
  };

  const handleBusquedaRapida = (query: string) => {
    const q = query.toLowerCase().trim();
    const match = socios.find(
      (s) => s.DNI.includes(q) || s.Apellido_Nombre.toLowerCase().includes(q) || s.Nro_Socio.toLowerCase().includes(q)
    );
    if (match) {
      setSocioSeleccionado(match);
      setTabActiva('ficha-socio-360');
      mostrarToast(`Socio ${match.Apellido_Nombre} localizado.`);
    } else {
      mostrarToast(`No se encontró ningún socio con el criterio "${query}".`, 'danger');
    }
  };

  // Configuración de títulos de pantalla
  const getTituloPantalla = () => {
    switch (tabActiva) {
      case 'padron-socios':
        return {
          modulo: 'Módulo 01',
          titulo: 'Padrón General de Socios',
          subtitulo: 'Buscador multi-criterio, control normativo UIF/INAES y exportación masiva a Excel/CSV',
          icon: Users
        };
      case 'ficha-socio-360':
        return {
          modulo: 'Módulo 02',
          titulo: 'Ficha 360° del Socio (Perfil Detallado)',
          subtitulo: 'Expediente digital, semáforo UIF/INAES/ARCA, grupo familiar, subsidios y legajos Google Drive',
          icon: Users
        };
      case 'simulador-originacion':
        return {
          modulo: 'Módulo 03',
          titulo: 'Simulador Financiero & Originación de Ayudas',
          subtitulo: 'Líneas FEDEM, Municipales (VIKINGO) y Sidecreer, WhatsApp institucional y refinanciaciones',
          icon: Calculator
        };
      case 'centro-operaciones':
        return {
          modulo: 'Módulo 04 • Unificado',
          titulo: 'Centro de Operaciones, Alertas SLA y Liquidaciones de Tesorería',
          subtitulo: 'Bitácora preventiva de cobranzas, gestiones multi-etapa, balance de caja y órdenes de pago BERSA',
          icon: Activity
        };
      case 'comercializadores':
        return {
          modulo: 'Módulo 05',
          titulo: 'Padrón y Liquidación de Comercializadores',
          subtitulo: 'Gestión CRUD de asesores externos, pre-liquidación y control de retenciones',
          icon: Percent
        };
      case 'carteras-vpn':
        return {
          modulo: 'Módulo 06',
          titulo: 'Consola de Cesión y Gestión de Carteras (VPN)',
          subtitulo: 'Valuación por Valor Presente Neto (VPN), segmentación por mora y auditoría de lotes',
          icon: PieChart
        };
      case 'alianzas-billetera':
        return {
          modulo: 'Módulo 07',
          titulo: 'Ecosistema Alianzas & Billetera Virtual Mutual',
          subtitulo: 'Comercios B2B adheridos, 3 billeteras preaprobadas, triple tope de reintegros y fidelización',
          icon: Wallet
        };
      case 'recibos-ai-webhooks':
        return {
          modulo: 'Módulo 08',
          titulo: 'Analizador de Recibos con IA & Webhooks (Darwin / WhatsApp)',
          subtitulo: 'OCR Gemini Vision, reglas de afectación provincial y pasarela de webhooks para bots',
          icon: Bot
        };
      case 'marketing-leads':
        return {
          modulo: 'Módulo 09',
          titulo: 'Funnel de Conversión, Leads & Marketing Digital',
          subtitulo: 'Campañas Meta Ads, TikTok, Google Search, métricas CPL, CAC y semáforo de calidad',
          icon: Target
        };
      default:
        return {
          modulo: 'Sistema',
          titulo: 'Mutual Modelo de Entre Ríos',
          subtitulo: 'CRM & Backoffice Financiero',
          icon: ShieldCheck
        };
    }
  };

  const infoPantalla = getTituloPantalla();
  const IconoPantalla = infoPantalla.icon;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold text-white flex items-center gap-2 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-600'
                : toastMsg.type === 'danger'
                ? 'bg-rose-600'
                : 'bg-blue-600'
            }`}
          >
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* HEADER SUPERIOR: CONMUTADOR DE LOS 3 PORTALES Y SESIÓN */}
      <PortalSwitcherHeader
        portalActivo={portalActivo}
        sesionActual={sesionActual}
        onCambiarPortal={handleCambiarPortal}
        onAbrirLogin={(p) => {
          setPortalLoginDestino(p || portalActivo);
          setModalLoginAbierto(true);
        }}
        onCerrarSesion={handleCerrarSesion}
      />

      {/* 📱 PORTAL 2: APP PWA / BILLETERA VIRTUAL DEL ASOCIADO */}
      {portalActivo === 'portal-socio-app' && (
        <div className="flex-1 bg-slate-950 py-3">
          <PortalSocioApp
            socio={
              (sesionActual?.tipo === 'SOCIO_APP'
                ? socios.find((s) => s.DNI === sesionActual.idUsuario)
                : socioSeleccionado) || socios[0]
            }
            comercios={comerciosB2B}
            promociones={promocionesPool}
            fidelidad={fidelidadSellos.find(
              (f) =>
                f.DNI_Socio ===
                ((sesionActual?.tipo === 'SOCIO_APP'
                  ? socios.find((s) => s.DNI === sesionActual.idUsuario)?.DNI
                  : socioSeleccionado?.DNI) || socios[0].DNI)
            )}
            transacciones={transaccionesBilletera}
            onNuevaTransaccion={handleNuevaTransaccionBilletera}
            onDesconocerTransaccion={handleDesconocerTransaccion}
            onSubirReciboDrive={() => {
              mostrarToast('Recibo auditado por Gemini Vision IA y archivado en Drive.');
            }}
            onCerrarSesion={handleCerrarSesion}
            onCambiarPortal={handleCambiarPortal}
          />
        </div>
      )}

      {/* 🏪 PORTAL 3: PORTAL DEL COMERCIO ALIADO B2B */}
      {portalActivo === 'portal-comercio-b2b' && (
        <div className="flex-1 bg-slate-950">
          <PortalComercioB2B
            comercio={
              (sesionActual?.tipo === 'COMERCIO_B2B'
                ? comerciosB2B.find((c) => c.CUIT_Responsable === sesionActual.idUsuario)
                : comerciosB2B[0]) || comerciosB2B[0]
            }
            socios={socios}
            promociones={promocionesPool}
            transacciones={transaccionesBilletera}
            adelantos={adelantosLiquidacion}
            operadorActivo={operadorActivo}
            onNuevaTransaccion={handleNuevaTransaccionBilletera}
            onSolicitarAdelanto={handleSolicitarAdelanto}
            onCerrarSesion={handleCerrarSesion}
            onCambiarPortal={handleCambiarPortal}
          />
        </div>
      )}

      {/* 🏢 PORTAL 1: CRM BACKOFFICE FINANCIERO Y TESORERÍA MUTUAL */}
      {portalActivo === 'portal-crm-admin' && (
        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR LATERAL IZQUIERDA FIJA */}
          <Sidebar
            tabActiva={tabActiva}
            onCambiarTab={(tab) => {
              setTabActiva(tab);
              setMobileMenuOpen(false);
            }}
        operadorActivo={operadorActivo}
        onCambiarOperador={(op) => {
          setOperadorActivo(op);
          mostrarToast(`Operador activo cambiado a ${op}`);
        }}
        conteoAyudasPendientes={conteoAyudasPendientes}
        conteoAlertasCriticas={conteoAlertasCriticas}
        onAbrirModalSocio={() => {
          setSocioAEditar(null);
          setModalAbierto('socio');
        }}
        onAbrirModalAyuda={() => setModalAbierto('ayuda')}
        onAbrirModalAlerta={() => setModalAbierto('seguimiento')}
        onBusquedaRapida={handleBusquedaRapida}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* ÁREA DE CONTENIDO PRINCIPAL CON MARGEN CORRESPONDIENTE AL SIDEBAR */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Barra Superior de la Aplicación */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Alternar barra lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase font-mono">
                  {infoPantalla.modulo}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {infoPantalla.subtitulo}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                <IconoPantalla className="w-4 h-4 text-[#135596]" />
                <span>{infoPantalla.titulo}</span>
              </h2>
            </div>
          </div>

          {/* Accesos Rápidos Superiores */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setSocioAEditar(null);
                setModalAbierto('socio');
              }}
              className="px-3 py-1.5 bg-[#135596] hover:bg-[#0d3b68] text-white text-xs font-semibold rounded-lg shadow-2xs transition hidden md:flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Socio</span>
            </button>
            <button
              onClick={() => setModalAbierto('ayuda')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition hidden md:flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>+ Préstamo</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-blue-100 font-bold flex items-center justify-center text-xs border border-blue-700 shadow-2xs">
                {operadorActivo.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-semibold text-slate-800 hidden sm:inline">
                {operadorActivo}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico de la Pantalla Activa */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {tabActiva === 'padron-socios' && (
            <ScreenPadronSocios
              socios={socios}
              onSeleccionarSocioYVerFicha={(s) => {
                setSocioSeleccionado(s);
                setTabActiva('ficha-socio-360');
              }}
              onNuevoSocio={() => {
                setSocioAEditar(null);
                setModalAbierto('socio');
              }}
              onSimularParaSocio={handleSimularParaSocio}
            />
          )}

          {tabActiva === 'ficha-socio-360' && (
            <ScreenFichaSocio360
              socios={socios}
              socioActivo={socioSeleccionado}
              ayudas={ayudas}
              seguimientos={seguimientos}
              subsidiosYConsumos={subsidiosYConsumos}
              auditoriasIALegajos={auditoriasIALegajos}
              operadorActivo={operadorActivo}
              onCambiarSocio={setSocioSeleccionado}
              onEditarSocio={(s) => {
                setSocioAEditar(s);
                setModalAbierto('socio');
              }}
              onSimularParaSocio={handleSimularParaSocio}
              onSubirArchivoDrive={handleSubirArchivoDrive}
              onReemplazarDocumentoLegajo={handleReemplazarDocumentoLegajo}
              onActualizarGrupoFamiliar={handleActualizarGrupoFamiliar}
              onNuevoConsumoSubsidio={handleNuevoConsumoSubsidio}
              onActualizarConsumoSubsidio={handleActualizarConsumoSubsidio}
              onActualizarEstadoAyuda={handleCambiarEstadoAyuda}
              onActualizarAyuda={handleActualizarAyuda}
              onActualizarEstadoAlerta={handleActualizarEstadoAlerta}
            />
          )}

          {tabActiva === 'simulador-originacion' && (
            <ScreenSimuladorOriginacion
              operadorActivo={operadorActivo}
              socioPreseleccionado={socioSeleccionado}
              socios={socios}
              ayudas={ayudas}
              onSeleccionarSocio={setSocioSeleccionado}
              onCrearAyudaConPlan={(linea, monto, cuotas, valorCuota, esRefi, idsCancelados, montoRetenido) => {
                setPlanPreseleccionado({
                  linea,
                  monto,
                  cuotas,
                  valorCuota,
                  esRefi,
                  idsCancelados,
                  montoRetenido
                });
                setModalAbierto('ayuda');
              }}
            />
          )}

          {tabActiva === 'centro-operaciones' && (
            <ScreenCentroOperaciones
              ayudas={ayudas}
              seguimientos={seguimientos}
              onActualizarEstadoAlerta={handleActualizarEstadoAlerta}
              onAgregarEtapaGestion={handleAgregarEtapaGestion}
              onCancelarAlerta={handleCancelarAlerta}
              onActualizarEstadoAyuda={handleCambiarEstadoAyuda}
              onNuevaAlerta={() => setModalAbierto('seguimiento')}
              onVerSocio={(dni) => {
                const s = socios.find((soc) => soc.DNI === dni);
                if (s) {
                  setSocioSeleccionado(s);
                  setTabActiva('ficha-socio-360');
                }
              }}
            />
          )}

          {tabActiva === 'comercializadores' && (
            <ScreenComercializadores
              comercializadores={comercializadores}
              liquidaciones={liquidaciones}
              ayudas={ayudas}
              historialComisiones={historialComisiones}
              onNuevoComercializador={() => setModalAbierto('comercializador')}
              onEditarComercializador={(c) => {
                setComercializadores((prev) => prev.map((x) => (x.ID_Comercializador === c.ID_Comercializador ? c : x)));
                mostrarToast(`Comercializador ${c.Nombre_Estudio_Agente} actualizado.`);
              }}
              onActualizarComercializador={handleActualizarComercializador}
              onEmitirLiquidacion={handleEmitirLiquidacionComisiones}
              onCambiarEstadoPago={handleCambiarEstadoPagoLiq}
            />
          )}

          {tabActiva === 'carteras-vpn' && (
            <ScreenCarterasVPN
              ayudas={ayudas}
              cesiones={cesiones}
              auditoriasIALegajos={auditoriasIALegajos}
              onAbrirModalCesion={(ids, res) => {
                setCesionDataTemp({ ids, resumen: res });
                setModalAbierto('cesion');
              }}
              onRevertirCesion={handleRevertirCesion}
            />
          )}

          {tabActiva === 'alianzas-billetera' && (
            <ScreenAlianzasBilletera
              comercios={comerciosB2B}
              promociones={promocionesPool}
              fidelidadSellos={fidelidadSellos}
              transacciones={transaccionesBilletera}
              adelantos={adelantosLiquidacion}
              socios={socios}
              socioActivo={socioSeleccionado}
              operadorActivo={operadorActivo}
              onGuardarComercio={handleGuardarComercio}
              onEditarComercio={handleEditarComercio}
              onCrearPromo={handleCrearPromo}
              onNuevaTransaccion={handleNuevaTransaccionBilletera}
              onDesconocerTransaccion={handleDesconocerTransaccion}
              onSolicitarAdelanto={handleSolicitarAdelanto}
              onActualizarSellos={handleActualizarSellos}
              onSeleccionarSocio={setSocioSeleccionado}
            />
          )}

          {tabActiva === 'recibos-ai-webhooks' && (
            <ScreenRecibosAIWebhooks
              logsIA={logsIA}
              configIA={configIA}
              socios={socios}
              onGuardarConfigIA={(c) => {
                setConfigIA(c);
                mostrarToast('Credenciales y configuración de IA actualizadas.');
              }}
              onSimularConMargen={(margen, socio) => {
                if (socio) setSocioSeleccionado(socio);
                setTabActiva('simulador-originacion');
                mostrarToast(`Margen de ${margen} transferido al Simulador.`);
              }}
            />
          )}

          {tabActiva === 'marketing-leads' && (
            <ScreenMarketingLeads />
          )}
        </main>
      </div>
    </div>
  )}

      {/* MODALES */}
      {modalAbierto === 'socio' && (
        <ModalSocio
          socioAEditar={socioAEditar}
          operadorActivo={operadorActivo}
          onGuardar={handleGuardarSocio}
          onCerrar={() => {
            setModalAbierto(null);
            setSocioAEditar(null);
          }}
        />
      )}

      {modalAbierto === 'ayuda' && (
        <ModalAyuda
          socios={socios}
          ayudasExistentes={ayudas}
          socioPreseleccionado={socioSeleccionado}
          planPreseleccionado={planPreseleccionado}
          operadorActivo={operadorActivo}
          onGuardar={handleGuardarAyuda}
          onCerrar={() => {
            setModalAbierto(null);
            setPlanPreseleccionado(null);
          }}
        />
      )}

      {modalAbierto === 'seguimiento' && (
        <ModalSeguimiento
          socios={socios}
          operadorActivo={operadorActivo}
          onGuardar={handleGuardarSeguimiento}
          onCerrar={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'comercializador' && (
        <ModalComercializador
          onGuardar={handleGuardarComercializador}
          onCerrar={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'cesion' && cesionDataTemp && (
        <ModalCesionCartera
          idsSeleccionados={cesionDataTemp.ids}
          resumenValuacion={cesionDataTemp.resumen}
          onConfirmar={handleConfirmarCesion}
          onCerrar={() => {
            setModalAbierto(null);
            setCesionDataTemp(null);
          }}
        />
      )}

      {/* MODAL DE AUTENTICACIÓN Y LOGIN MULTI-PORTAL */}
      <PortalLoginModal
        isOpen={modalLoginAbierto}
        portalInicial={portalLoginDestino}
        socios={socios}
        comercios={comerciosB2B}
        operadores={OPERADORES_MUTUAL}
        onLoginExitoso={handleLoginExitoso}
        onActualizarClaveSocio={handleActualizarClaveSocio}
        onActualizarClaveComercio={handleActualizarClaveComercio}
        onClose={() => setModalLoginAbierto(false)}
      />
    </div>
  );
}
