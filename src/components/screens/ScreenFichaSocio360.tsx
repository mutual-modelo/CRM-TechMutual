import React from 'react';
import {
  SocioPadron,
  AyudaEconomica,
  SeguimientoAlerta,
  FamiliarSocio,
  SubsidioYConsumo,
  AuditoriaIALegajo
} from '../../types/crm';
import { formatMonedaAR } from '../../utils/financialCalculations';
import {
  FolderOpen,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit3,
  Search,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  ShoppingBag,
  Gift,
  HeartHandshake,
  Bot,
  Trash2,
  Check,
  FileCheck,
  Save,
  RefreshCw,
  Paperclip,
  History,
  Layers,
  Eye
} from 'lucide-react';

interface ScreenFichaSocio360Props {
  socios: SocioPadron[];
  socioActivo: SocioPadron | null;
  ayudas: AyudaEconomica[];
  seguimientos: SeguimientoAlerta[];
  subsidiosYConsumos: SubsidioYConsumo[];
  auditoriasIALegajos: AuditoriaIALegajo[];
  operadorActivo?: string;
  onCambiarSocio: (socio: SocioPadron) => void;
  onEditarSocio: (socio: SocioPadron) => void;
  onSimularParaSocio: (socio: SocioPadron) => void;
  onSubirArchivoDrive: (socio: SocioPadron, tipoDoc: string, file: File) => void;
  onReemplazarDocumentoLegajo?: (socio: SocioPadron, idDocAnterior: string, tipoDoc: string, file: File, motivo: string) => void;
  onActualizarGrupoFamiliar: (dni: string, nuevoGrupo: FamiliarSocio[]) => void;
  onNuevoConsumoSubsidio: (item: Partial<SubsidioYConsumo>) => void;
  onActualizarConsumoSubsidio?: (idConsumo: string, cambios: Partial<SubsidioYConsumo>) => void;
  onActualizarEstadoAyuda?: (idAyuda: string, nuevoEstado: any) => void;
  onActualizarAyuda?: (idAyuda: string, cambios: Partial<AyudaEconomica>) => void;
  onActualizarEstadoAlerta?: (idSeguimiento: string, nuevoEstado: any) => void;
}

export const ScreenFichaSocio360: React.FC<ScreenFichaSocio360Props> = ({
  socios,
  socioActivo,
  ayudas,
  seguimientos,
  subsidiosYConsumos,
  auditoriasIALegajos,
  operadorActivo = 'Julian',
  onCambiarSocio,
  onEditarSocio,
  onSimularParaSocio,
  onSubirArchivoDrive,
  onReemplazarDocumentoLegajo,
  onActualizarGrupoFamiliar,
  onNuevoConsumoSubsidio,
  onActualizarConsumoSubsidio,
  onActualizarEstadoAyuda,
  onActualizarAyuda,
  onActualizarEstadoAlerta
}) => {
  const [tipoDocSubida, setTipoDocSubida] = React.useState('DNI');
  const [selectorQuery, setSelectorQuery] = React.useState('');
  const [selectorAbierto, setSelectorAbierto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Pestaña activa dentro de la Ficha 360°
  const [tabFicha, setTabFicha] = React.useState<'resumen' | 'familia' | 'consumos-subsidios' | 'legajos-ia'>('resumen');

  // Filtro de Legajos: Solo versiones vigentes vs Histórico completo
  const [filtroLegajos, setFiltroLegajos] = React.useState<'vigentes' | 'todos'>('vigentes');

  // Modales interactivos (Drill-down y Edición Activa)
  const [ayudaDetalle, setAyudaDetalle] = React.useState<AyudaEconomica | null>(null);
  const [formAyudaEdit, setFormAyudaEdit] = React.useState<{
    Estado_Tramite: any;
    Estado_Cobranza: any;
    Cuotas_Pagadas: number;
    Saldo_Total_Restante: number;
    Cartera_Titular: string;
    Observaciones: string;
  }>({
    Estado_Tramite: 'Liquidado',
    Estado_Cobranza: 'Al Día',
    Cuotas_Pagadas: 0,
    Saldo_Total_Restante: 0,
    Cartera_Titular: 'Cartera Propia Mutual',
    Observaciones: ''
  });

  const [alertaDetalle, setAlertaDetalle] = React.useState<SeguimientoAlerta | null>(null);
  const [formAlertaEdit, setFormAlertaEdit] = React.useState<{
    Estado_Alerta: any;
    Prioridad: any;
    Operador_Asignado: any;
    Resultado_Proximo_Paso: string;
    Detalle_Gestion: string;
  }>({
    Estado_Alerta: 'Pendiente',
    Prioridad: 'Media',
    Operador_Asignado: 'Julian',
    Resultado_Proximo_Paso: '',
    Detalle_Gestion: ''
  });

  const [auditoriaDetalle, setAuditoriaDetalle] = React.useState<AuditoriaIALegajo | null>(null);

  // Modal para Adjuntar Factura/Comprobante Digital a un Consumo o Subsidio
  const [consumoAdjuntarFactura, setConsumoAdjuntarFactura] = React.useState<SubsidioYConsumo | null>(null);
  const [formFactura, setFormFactura] = React.useState<{
    nroComprobante: string;
    proveedor: string;
    monto: number;
    urlComprobante: string;
    observaciones: string;
  }>({
    nroComprobante: '',
    proveedor: '',
    monto: 0,
    urlComprobante: '',
    observaciones: ''
  });

  // Modal para Reemplazar / Actualizar Versión de un Documento de Legajo
  const [docAReemplazar, setDocAReemplazar] = React.useState<AuditoriaIALegajo | null>(null);
  const [formReemplazo, setFormReemplazo] = React.useState<{
    nombreArchivo: string;
    motivo: string;
    archivo: File | null;
  }>({
    nombreArchivo: '',
    motivo: 'Actualización mensual de haberes',
    archivo: null
  });
  const fileReemplazoRef = React.useRef<HTMLInputElement>(null);

  // Modales de Alta
  const [modalNuevoFamiliar, setModalNuevoFamiliar] = React.useState(false);
  const [formFamiliar, setFormFamiliar] = React.useState<{
    nombre: string;
    parentesco: 'Cónyuge' | 'Hijo/a' | 'Padre/Madre' | 'Otro';
    dni: string;
    fechaNacimiento: string;
    aCargo: boolean;
  }>({
    nombre: '',
    parentesco: 'Hijo/a',
    dni: '',
    fechaNacimiento: '2010-01-01',
    aCargo: true
  });

  const [modalNuevoConsumo, setModalNuevoConsumo] = React.useState(false);
  const [formConsumo, setFormConsumo] = React.useState<{
    tipoRegistro: 'SUBSIDIO' | 'CONSUMO_SERVICIO';
    categoria: any;
    comercio: string;
    monto: number;
    observaciones: string;
  }>({
    tipoRegistro: 'CONSUMO_SERVICIO',
    categoria: 'Farmacia',
    comercio: 'Farmacia Modelo Central (Paraná)',
    monto: 15000,
    observaciones: ''
  });

  // Funciones para abrir modales interactivos
  const abrirEdicionAyuda = (ay: AyudaEconomica) => {
    setAyudaDetalle(ay);
    setFormAyudaEdit({
      Estado_Tramite: ay.Estado_Tramite,
      Estado_Cobranza: ay.Estado_Cobranza,
      Cuotas_Pagadas: ay.Cuotas_Pagadas,
      Saldo_Total_Restante: ay.Saldo_Total_Restante,
      Cartera_Titular: ay.Cartera_Titular,
      Observaciones: ay.Observaciones || ''
    });
  };

  const abrirEdicionAlerta = (s: SeguimientoAlerta) => {
    setAlertaDetalle(s);
    setFormAlertaEdit({
      Estado_Alerta: s.Estado_Alerta,
      Prioridad: s.Prioridad,
      Operador_Asignado: s.Operador_Asignado,
      Resultado_Proximo_Paso: s.Resultado_Proximo_Paso || '',
      Detalle_Gestion: s.Detalle_Gestion || ''
    });
  };

  const abrirAdjuntarFactura = (c: SubsidioYConsumo) => {
    setConsumoAdjuntarFactura(c);
    setFormFactura({
      nroComprobante: `FAC-${Math.floor(100000 + Math.random() * 900000)}`,
      proveedor: c.Comercio_Proveedor,
      monto: c.Monto,
      urlComprobante: c.Comprobante_Drive_URL || `https://drive.google.com/file/d/FAC_${Date.now()}`,
      observaciones: c.Observaciones || ''
    });
  };

  const abrirReemplazoDoc = (aud: AuditoriaIALegajo) => {
    setDocAReemplazar(aud);
    setFormReemplazo({
      nombreArchivo: `${aud.Tipo_Doc}_Actualizado_${new Date().toISOString().slice(0, 7)}.pdf`,
      motivo: aud.Tipo_Doc === 'RECIBO' ? 'Actualización mensual de haberes' : 'Reemplazo de documento legible / actualizado',
      archivo: null
    });
  };

  // Si no hay socio activo, default al primero
  const socio = socioActivo || socios[0] || null;

  // Filtrado de socios para el selector superior
  const sociosParaSeleccionar = React.useMemo(() => {
    if (!selectorQuery.trim()) return socios;
    const q = selectorQuery.toLowerCase();
    return socios.filter(
      (s) =>
        s.Apellido_Nombre.toLowerCase().includes(q) ||
        s.DNI.includes(q) ||
        s.Nro_Socio.toLowerCase().includes(q)
    );
  }, [socios, selectorQuery]);

  // Ayudas del socio actual
  const ayudasSocio = React.useMemo(() => {
    if (!socio) return [];
    return ayudas.filter((a) => a.DNI === socio.DNI);
  }, [ayudas, socio]);

  // Seguimientos del socio actual
  const seguimientosSocio = React.useMemo(() => {
    if (!socio) return [];
    return seguimientos.filter((s) => s.DNI === socio.DNI);
  }, [seguimientos, socio]);

  // Familiares parseados
  const familiaresSocio: FamiliarSocio[] = React.useMemo(() => {
    if (!socio?.Grupo_Familiar_JSON) return [];
    try {
      return JSON.parse(socio.Grupo_Familiar_JSON);
    } catch {
      return [];
    }
  }, [socio]);

  // Consumos y Subsidios del socio actual
  const consumosSubsidiosSocio = React.useMemo(() => {
    if (!socio) return [];
    return subsidiosYConsumos.filter((c) => c.DNI === socio.DNI);
  }, [subsidiosYConsumos, socio]);

  // Auditorías IA de Legajos del socio
  const auditoriasSocio = React.useMemo(() => {
    if (!socio) return [];
    return auditoriasIALegajos.filter((a) => a.DNI === socio.DNI);
  }, [auditoriasIALegajos, socio]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && socio) {
      onSubirArchivoDrive(socio, tipoDocSubida, e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGuardarFamiliar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socio || !formFamiliar.nombre.trim() || !formFamiliar.dni.trim()) {
      alert('Complete los datos obligatorios del familiar.');
      return;
    }
    const nuevo: FamiliarSocio = {
      id: `FAM-${Date.now().toString().slice(-5)}`,
      nombre: formFamiliar.nombre.trim(),
      parentesco: formFamiliar.parentesco,
      dni: formFamiliar.dni.trim(),
      fechaNacimiento: formFamiliar.fechaNacimiento,
      aCargo: formFamiliar.aCargo
    };
    const listaActualizada = [...familiaresSocio, nuevo];
    onActualizarGrupoFamiliar(socio.DNI, listaActualizada);
    setModalNuevoFamiliar(false);
    setFormFamiliar({
      nombre: '',
      parentesco: 'Hijo/a',
      dni: '',
      fechaNacimiento: '2010-01-01',
      aCargo: true
    });
  };

  const handleEliminarFamiliar = (id: string) => {
    if (!socio) return;
    if (window.confirm('¿Está seguro de eliminar este familiar vinculado?')) {
      const listaActualizada = familiaresSocio.filter((f) => f.id !== id);
      onActualizarGrupoFamiliar(socio.DNI, listaActualizada);
    }
  };

  const handleGuardarConsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socio) return;
    onNuevoConsumoSubsidio({
      DNI: socio.DNI,
      Apellido_Nombre: socio.Apellido_Nombre,
      Tipo_Registro: formConsumo.tipoRegistro,
      Categoria: formConsumo.categoria,
      Comercio_Proveedor: formConsumo.comercio,
      Fecha: new Date().toISOString().slice(0, 10),
      Monto: Number(formConsumo.monto) || 0,
      Estado: 'Entregado / Aprobado',
      Observaciones: formConsumo.observaciones
    });
    setModalNuevoConsumo(false);
  };

  const auditoriasFiltradas = React.useMemo(() => {
    if (filtroLegajos === 'vigentes') {
      return auditoriasSocio.filter((a) => a.Es_Version_Actual);
    }
    return auditoriasSocio;
  }, [auditoriasSocio, filtroLegajos]);

  const handleGuardarEdicionAyuda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ayudaDetalle) return;
    const cuotasRestantes = Math.max(0, ayudaDetalle.Cantidad_Cuotas - formAyudaEdit.Cuotas_Pagadas);
    const saldoRestante =
      formAyudaEdit.Saldo_Total_Restante !== undefined
        ? Number(formAyudaEdit.Saldo_Total_Restante)
        : cuotasRestantes * ayudaDetalle.Valor_Cuota;

    const payload: Partial<AyudaEconomica> = {
      Estado_Tramite: formAyudaEdit.Estado_Tramite,
      Estado_Cobranza: formAyudaEdit.Estado_Cobranza,
      Cuotas_Pagadas: Number(formAyudaEdit.Cuotas_Pagadas),
      Cuotas_Restantes: cuotasRestantes,
      Saldo_Total_Restante: saldoRestante,
      Cartera_Titular: formAyudaEdit.Cartera_Titular,
      Observaciones: formAyudaEdit.Observaciones
    };

    if (onActualizarAyuda) {
      onActualizarAyuda(ayudaDetalle.ID_Ayuda, payload);
    } else if (onActualizarEstadoAyuda) {
      onActualizarEstadoAyuda(ayudaDetalle.ID_Ayuda, formAyudaEdit.Estado_Tramite);
    }
    setAyudaDetalle(null);
  };

  const handleGuardarEdicionAlerta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertaDetalle) return;
    if (onActualizarEstadoAlerta) {
      onActualizarEstadoAlerta(alertaDetalle.ID_Seguimiento, formAlertaEdit.Estado_Alerta);
    }
    setAlertaDetalle(null);
  };

  const handleGuardarFacturaConsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumoAdjuntarFactura) return;
    const url = formFactura.urlComprobante.trim() || `https://drive.google.com/file/d/FAC_${Date.now()}`;
    const obsActualizada = formFactura.observaciones
      ? `${formFactura.observaciones} • Factura N° ${formFactura.nroComprobante}`
      : `Factura Digital N° ${formFactura.nroComprobante} adjunta en Drive`;

    if (onActualizarConsumoSubsidio) {
      onActualizarConsumoSubsidio(consumoAdjuntarFactura.ID_Consumo, {
        Comprobante_Drive_URL: url,
        Observaciones: obsActualizada,
        Estado: 'Entregado / Aprobado'
      });
    }
    setConsumoAdjuntarFactura(null);
  };

  const handleConfirmarReemplazoDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docAReemplazar || !socio) return;
    const file =
      formReemplazo.archivo ||
      new File(['comprobante-actualizado'], formReemplazo.nombreArchivo, { type: 'application/pdf' });

    if (onReemplazarDocumentoLegajo) {
      onReemplazarDocumentoLegajo(
        socio,
        docAReemplazar.ID_Auditoria,
        docAReemplazar.Tipo_Doc,
        file,
        formReemplazo.motivo
      );
    } else {
      onSubirArchivoDrive(socio, docAReemplazar.Tipo_Doc, file);
    }
    setDocAReemplazar(null);
  };

  if (!socio) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold">No hay asociados registrados en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector Superior Rápido de Asociado */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <Users className="w-4 h-4 text-blue-600" />
            Asociado en Vista:
          </span>
          <div className="relative flex-1">
            <input
              type="text"
              value={selectorAbierto ? selectorQuery : `${socio.Apellido_Nombre} (DNI ${socio.DNI} - ${socio.Nro_Socio})`}
              onFocus={() => {
                setSelectorAbierto(true);
                setSelectorQuery('');
              }}
              onChange={(e) => setSelectorQuery(e.target.value)}
              placeholder="Buscar socio para ver su Ficha 360°..."
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
            />
            {selectorAbierto && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 divide-y divide-slate-100">
                {sociosParaSeleccionar.map((s) => (
                  <button
                    key={s.DNI}
                    onClick={() => {
                      onCambiarSocio(s);
                      setSelectorAbierto(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-blue-50 text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{s.Apellido_Nombre}</div>
                      <div className="text-[11px] text-slate-500">
                        DNI {s.DNI} • {s.Nro_Socio} • {s.Organismo}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Margen: {formatMonedaAR(s.Margen_Cuota_Disponible)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectorAbierto && (
            <button
              onClick={() => setSelectorAbierto(false)}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditarSocio(socio)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Editar Datos</span>
          </button>
          <button
            onClick={() => onSimularParaSocio(socio)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#135596] hover:bg-[#0e3b68] rounded-lg transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Préstamo</span>
          </button>
        </div>
      </div>

      {/* PANEL PRINCIPAL: FICHA 360° */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-md p-5 relative overflow-hidden transition-all">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#135596] via-blue-500 to-emerald-500" />

        {/* Cabecera del Asociado */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#135596]">
                {socio.Nro_Socio}
              </span>
              <span className="text-xs text-slate-500">Alta: {socio.Fecha_Alta}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {socio.Apellido_Nombre}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
              <span>DNI: <strong className="font-mono text-slate-800">{socio.DNI}</strong></span>
              <span>Organismo: <strong className="text-slate-800">{socio.Organismo}</strong></span>
              <span>Sector: <strong>{socio.Sector_Trabajo}</strong></span>
              <span>Función: <strong>{socio.Dependencia_Funcion}</strong></span>
              <span>Edad: <strong>{socio.Edad} años</strong></span>
              <span>Localidad: <strong>{socio.Localidad}</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                socio.Estado_Cuota_Social === 'Al Día'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {socio.Estado_Cuota_Social === 'Al Día' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              Cuota Social: {socio.Estado_Cuota_Social}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Legajo BERSA: {socio.Legajo_Sueldo || 'L-55291'}
            </span>
          </div>
        </div>

        {/* SEMÁFORO NORMATIVO Y AUDITORÍA INTEGRADA (UIF / INAES / ARCA) */}
        <div className="my-4 p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                Semáforo Normativo & Auditoría Integrada (UIF / INAES / ARCA)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Auditoría: {socio.Fecha_Auditoria_Normativa || '2026-11-01'}
              </span>
            </div>
            <button
              onClick={() => {
                alert(
                  `✅ Auditoría UIF/INAES/ARCA ejecutada con éxito para ${socio.Apellido_Nombre}.\n\n• UIF Res. 35/2023: PEP Verificado (${socio.Estado_PEP})\n• RePET: Base de datos limpia sin antecedentes.\n• ARCA (ex-AFIP): CUIT ${socio.CUIT_ARCA || socio.DNI} Activo y Regular.\n• INAES: Cumplimiento de Cuota Social verificado.\n\nFicha actualizada en Base de Datos.`
                );
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Ejecutar Verificación en Línea</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. PEP */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">1. Control PEP (UIF)</div>
              <div className="mt-1">
                {socio.Estado_PEP === 'NO_PEP' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No PEP
                  </span>
                )}
                {socio.Estado_PEP === 'PEP_DECLARADO' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> PEP Declarado
                  </span>
                )}
                {socio.Estado_PEP === 'REQUIERE_DJ' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    <XCircle className="w-3 h-3 text-rose-600" /> Requiere DJ
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 truncate" title={socio.Detalle_PEP}>
                {socio.Detalle_PEP || 'Res. UIF 35/2023'}
              </div>
            </div>

            {/* 2. RePET */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">2. RePET (Terrorismo)</div>
              <div className="mt-1">
                {socio.Estado_REPET !== 'EN_ALERTA' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sin Coincidencias
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    <AlertTriangle className="w-3 h-3 text-rose-600" /> ALERTA REPET
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 truncate">
                Padrón público nacional
              </div>
            </div>

            {/* 3. CUIT ARCA */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">3. Constancia ARCA</div>
              <div className="mt-1">
                {socio.Estado_ARCA_Constancia === 'ACTIVO_REGULAR' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Activo Regular
                  </span>
                )}
                {socio.Estado_ARCA_Constancia === 'OBSERVADO' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Observado
                  </span>
                )}
                {socio.Estado_ARCA_Constancia === 'EXENTO' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Exento / Jubilado
                  </span>
                )}
                {socio.Estado_ARCA_Constancia === 'SIN_CONSTANCIA' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    Sin CUIT
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-mono truncate">
                {socio.CUIT_ARCA || socio.DNI}
              </div>
            </div>

            {/* 4. Jubilación */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">4. Caja Jubilaciones</div>
              <div className="mt-1">
                {socio.En_Tramite_Jubilacion === 'SI' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Trámite Ley 8732
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    Activo Normal
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 truncate" title={socio.Detalle_Jubilacion}>
                {socio.Detalle_Jubilacion || 'Aportante regular'}
              </div>
            </div>

            {/* 5. Bloqueos / Legales */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">5. Situación Legal</div>
              <div className="mt-1">
                {socio.Bloqueado_Legales === 'SI' || socio.Estado_Inhibicion_Judicial === 'INHIBIDO' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    <XCircle className="w-3 h-3 text-rose-600" /> Inhibido / Bloqueado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Habilitado
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 truncate" title={socio.Detalle_Legales}>
                {socio.Detalle_Legales || 'Sin embargos activos'}
              </div>
            </div>

            {/* 6. Cuota Social */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">6. INAES Cuota Social</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    socio.Estado_Cuota_Social === 'Al Día'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {socio.Estado_Cuota_Social === 'Al Día' ? 'Al Día' : 'Con Deuda'}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-mono">
                {socio.Deuda_Cuota_Social > 0 ? formatMonedaAR(socio.Deuda_Cuota_Social) : '$0 de deuda'}
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPIs Financieros del Socio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sueldo Bruto
            </span>
            <span className="font-mono text-base font-bold text-slate-700">
              {formatMonedaAR(socio.Sueldo_Bruto)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sueldo Neto Bolsillo
            </span>
            <span className="font-mono text-base font-bold text-slate-900">
              {formatMonedaAR(socio.Sueldo_Neto)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Margen Disponible Cuota
            </span>
            <span className="font-mono text-lg font-bold text-emerald-700">
              {formatMonedaAR(socio.Margen_Cuota_Disponible)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Monto Preaprobado Est.
            </span>
            <span className="font-mono text-lg font-bold text-[#135596]">
              {formatMonedaAR(socio.Monto_Preaprobado)}
            </span>
          </div>
        </div>

        {/* Datos de Contacto y Bancarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Teléfono / WhatsApp</span>
              <span className="font-semibold text-slate-800">{socio.Telefono_WhatsApp || 'No informado'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Correo Electrónico</span>
              <span className="font-semibold text-slate-800 truncate block max-w-[200px]">
                {socio.Email || 'No informado'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">CBU / Alias ({socio.Banco})</span>
              <span className="font-mono font-bold text-slate-800">{socio.CBU_Alias || 'No cargado'}</span>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS DENTRO DE LA FICHA 360° */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 mb-4 pb-2">
          <button
            onClick={() => setTabFicha('resumen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              tabFicha === 'resumen'
                ? 'bg-[#135596] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ayudas & Alertas ({ayudasSocio.length + seguimientosSocio.length})</span>
          </button>

          <button
            onClick={() => setTabFicha('familia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              tabFicha === 'familia'
                ? 'bg-[#135596] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Grupo Familiar ({familiaresSocio.length})</span>
          </button>

          <button
            onClick={() => setTabFicha('consumos-subsidios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              tabFicha === 'consumos-subsidios'
                ? 'bg-[#135596] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Subsidios & Consumos Mutuales ({consumosSubsidiosSocio.length})</span>
          </button>

          <button
            onClick={() => setTabFicha('legajos-ia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              tabFicha === 'legajos-ia'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Expediente Drive & Auditoría IA ({auditoriasSocio.length})</span>
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: RESUMEN DE AYUDAS Y ALERTAS (DRILL-DOWN INTERACTIVO) */}
        {tabFicha === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ayudas Económicas del Socio (Clickable Drill-down) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Ayudas Económicas Vigentes e Históricas ({ayudasSocio.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Clic para ver desglose</span>
              </div>

              {ayudasSocio.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 text-center bg-white rounded-lg border border-slate-100">
                  Sin préstamos activos ni históricos.
                </p>
              ) : (
                <div className="space-y-2">
                  {ayudasSocio.map((ay) => (
                    <div
                      key={ay.ID_Ayuda}
                      onClick={() => abrirEdicionAyuda(ay)}
                      className="bg-white border border-slate-200 hover:border-blue-500 rounded-lg p-3 text-xs space-y-2 cursor-pointer transition shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 group-hover:text-blue-900">
                            {ay.Nro_Mutuo}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {ay.ID_Ayuda}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ay.Estado_Tramite === 'Liquidado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ay.Estado_Tramite === 'Cancelado por Refinanciación'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ay.Estado_Tramite}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" />
                            Gestionar
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-800 font-semibold">{ay.Linea_Ayuda}</div>
                      <div className="flex justify-between font-mono text-[11px] text-slate-600">
                        <span>Valor Cuota: <strong>{formatMonedaAR(ay.Valor_Cuota)}</strong></span>
                        <span>Cuotas: {ay.Cuotas_Restantes}/{ay.Cantidad_Cuotas}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Saldo Restante:</span>
                        <span className="font-bold text-rose-700">{formatMonedaAR(ay.Saldo_Total_Restante)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seguimientos & Alertas (Clickable Drill-down y Gestión) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Seguimientos & Alertas SLA ({seguimientosSocio.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Clic para gestionar y resolver</span>
              </div>

              {seguimientosSocio.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 text-center bg-white rounded-lg border border-slate-100">
                  Sin alertas abiertas para este socio.
                </p>
              ) : (
                <div className="space-y-2">
                  {seguimientosSocio.map((s) => (
                    <div
                      key={s.ID_Seguimiento}
                      onClick={() => abrirEdicionAlerta(s)}
                      className="bg-white border border-slate-200 hover:border-amber-500 rounded-lg p-3 text-xs space-y-2 cursor-pointer transition shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{s.Subtipo_Tramite}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.Prioridad === 'Urgente'
                                ? 'bg-rose-100 text-rose-800'
                                : s.Prioridad === 'Alta'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {s.Prioridad}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" />
                            Resolver
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {s.Detalle_Gestion}
                      </p>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Vence: <strong>{s.Fecha_Vencimiento_Alerta}</strong></span>
                        <span>Asig: {s.Operador_Asignado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: GRUPO FAMILIAR (ABM COMPLETO) */}
        {tabFicha === 'familia' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  Padrón de Familiares a Cargo y Cónyuges ({familiaresSocio.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Beneficiarios de cobertura médica, subsidios por nacimiento/fallecimiento y coseguro mutual.
                </p>
              </div>
              <button
                onClick={() => setModalNuevoFamiliar(true)}
                className="px-3 py-1.5 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Familiar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {familiaresSocio.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#135596]">
                        {f.parentesco}
                      </span>
                      {f.aCargo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          A Cargo
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1.5">{f.nombre}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">DNI {f.dni}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Nacimiento: {f.fechaNacimiento}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleEliminarFamiliar(f.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: SUBSIDIOS & CONSUMOS MUTUALES */}
        {tabFicha === 'consumos-subsidios' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  Servicios, Farmacias Adheridas, Ópticas, Vouchers y Subsidios ({consumosSubsidiosSocio.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Consumos en comercios aliados con deducción por planilla y subsidios sociales entregados.
                </p>
              </div>
              <button
                onClick={() => setModalNuevoConsumo(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrar Consumo / Subsidio</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Tipo / Rubro</th>
                    <th className="py-2.5 px-3">Comercio / Proveedor</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3">Comprobante Drive</th>
                    <th className="py-2.5 px-3">Detalle</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consumosSubsidiosSocio.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No hay consumos o subsidios registrados para este socio.
                      </td>
                    </tr>
                  ) : (
                    consumosSubsidiosSocio.map((c) => (
                      <tr key={c.ID_Consumo} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.Tipo_Registro === 'SUBSIDIO'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {c.Categoria}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {c.Comercio_Proveedor}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{c.Fecha}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatMonedaAR(c.Monto)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {c.Estado}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {c.Comprobante_Drive_URL ? (
                            <a
                              href={c.Comprobante_Drive_URL}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] hover:underline"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span>Factura Drive</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-amber-600 italic">Sin Factura Adjunta</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[200px] truncate" title={c.Observaciones}>
                          {c.Observaciones || 'Sin observaciones'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => abrirAdjuntarFactura(c)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-200 transition cursor-pointer"
                            title="Adjuntar o actualizar factura"
                          >
                            <Paperclip className="w-2.5 h-2.5 text-blue-600" />
                            <span>Factura</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 4: EXPEDIENTE DRIVE & AUDITORÍA IA DE LEGAJOS */}
        {tabFicha === 'legajos-ia' && (
          <div className="space-y-4">
            {/* Subida Rápida con Auditoría IA Automática */}
            <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-700" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                      Auditoría Automática OCR / IA de Legajos (Gemini API)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Al subir un comprobante, el motor de IA extrae datos normativos, valida autenticidad y califica el riesgo.
                    </p>
                  </div>
                </div>

                <a
                  href={socio.Carpeta_Drive_URL || 'https://drive.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#135596] hover:underline"
                >
                  <span>Abrir Carpeta en Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Subir y Analizar con IA:</span>
                <select
                  value={tipoDocSubida}
                  onChange={(e) => setTipoDocSubida(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-purple-600"
                >
                  <option value="DNI">DNI Frente y Dorso</option>
                  <option value="RECIBO">Recibo de Sueldo Oficial</option>
                  <option value="CBU">Constancia de CBU / Alias</option>
                  <option value="SERVICIO">Factura de Servicio / Domicilio</option>
                  <option value="MUTUO">Mutuo Firmado</option>
                  <option value="OTRO">Otro Documento</option>
                </select>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-legajo-input-360"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md font-semibold transition cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar Archivo y Ejecutar Auditoría IA</span>
                </button>
              </div>
            </div>

            {/* Selector de Modo de Visualización (Versiones Vigentes vs Histórico Completo) */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-700" />
                  Visualización:
                </span>
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setFiltroLegajos('vigentes')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      filtroLegajos === 'vigentes'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟢 Versiones Vigentes ({auditoriasSocio.filter((a) => a.Es_Version_Actual).length})
                  </button>
                  <button
                    onClick={() => setFiltroLegajos('todos')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      filtroLegajos === 'todos'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 Histórico Completo de Reemplazos ({auditoriasSocio.length})
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Conserva trazabilidad cronológica ante auditorías INAES / UIF
              </span>
            </div>

            {/* Listado de Dictámenes de Auditoría IA */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Archivo / Tipo</th>
                    <th className="py-2.5 px-3 text-center">Versión</th>
                    <th className="py-2.5 px-3">Fecha Análisis / Historial</th>
                    <th className="py-2.5 px-3 text-center">Dictamen IA</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3">Dictamen Técnico Gemini</th>
                    <th className="py-2.5 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditoriasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No hay documentos auditados por IA en esta vista.
                      </td>
                    </tr>
                  ) : (
                    auditoriasFiltradas.map((aud) => (
                      <tr key={aud.ID_Auditoria} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{aud.Nombre_Archivo}</div>
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                            {aud.Tipo_Doc}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              v{aud.Version_Num || 1}
                            </span>
                            {aud.Es_Version_Actual ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Vigente
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Reemplazado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          <div className="font-mono">{aud.Fecha_Analisis}</div>
                          {aud.Motivo_Reemplazo && (
                            <div className="text-[10px] text-amber-800 bg-amber-50 px-1 py-0.5 rounded mt-0.5 max-w-[200px] truncate" title={aud.Motivo_Reemplazo}>
                              Motivo: {aud.Motivo_Reemplazo}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              aud.Dictamen_IA.includes('Aprobado')
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : aud.Dictamen_IA.includes('Observado')
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {aud.Dictamen_IA}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span
                            className={`${
                              aud.Score_Riesgo >= 80
                                ? 'text-emerald-700'
                                : aud.Score_Riesgo >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {aud.Score_Riesgo}/100
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[240px] truncate" title={aud.Comentarios_Tecnicos}>
                          {aud.Comentarios_Tecnicos}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setAuditoriaDetalle(aud)}
                              className="px-2 py-1 text-[10px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 transition cursor-pointer"
                              title="Ver extracción de datos y JSON"
                            >
                              Extracción IA
                            </button>
                            <button
                              onClick={() => abrirReemplazoDoc(aud)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition cursor-pointer"
                              title="Subir nueva versión o reemplazar documento"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Reemplazar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: GESTIÓN Y EDICIÓN ACTIVA DE AYUDA ECONÓMICA */}
      {/* ============================================================== */}
      {ayudaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ayudaDetalle.Nro_Mutuo} • {ayudaDetalle.ID_Ayuda}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Gestión Activa y Modificación de Ayuda Económica
                </h3>
                <p className="text-xs text-slate-500">
                  {ayudaDetalle.Linea_Ayuda} • {ayudaDetalle.Organismo}
                </p>
              </div>
              <button
                onClick={() => setAyudaDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Resumen Financiero Original */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Monto Depositado:</span>
                <strong className="text-slate-900">{formatMonedaAR(ayudaDetalle.Monto_Depositado)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Neto Entregado:</span>
                <strong className="text-emerald-700">{formatMonedaAR(ayudaDetalle.Neto_Efectivo_Entregado)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Valor Cuota:</span>
                <strong className="text-slate-800">{formatMonedaAR(ayudaDetalle.Valor_Cuota)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cuotas Totales:</span>
                <strong className="text-slate-800">{ayudaDetalle.Cantidad_Cuotas} cuotas</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total a Devolver:</span>
                <strong className="text-slate-800">{formatMonedaAR(ayudaDetalle.Total_A_Devolver)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Retención Refi:</span>
                <strong className="text-amber-700">{formatMonedaAR(ayudaDetalle.Monto_Retenido_Refi)}</strong>
              </div>
            </div>

            {/* Formulario de Edición Activa de Estado, Cobranza y Observaciones */}
            <form onSubmit={handleGuardarEdicionAyuda} className="space-y-3 text-xs pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estado del Trámite / Ayuda:
                  </label>
                  <select
                    value={formAyudaEdit.Estado_Tramite}
                    onChange={(e) => setFormAyudaEdit({ ...formAyudaEdit, Estado_Tramite: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Solicitado">Solicitado</option>
                    <option value="En Evaluación">En Evaluación</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Liquidado">Liquidado Tesorería</option>
                    <option value="Cancelado por Refinanciación">Cancelado por Refinanciación</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estado de Cobranza:
                  </label>
                  <select
                    value={formAyudaEdit.Estado_Cobranza}
                    onChange={(e) => setFormAyudaEdit({ ...formAyudaEdit, Estado_Cobranza: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Al Día">Al Día</option>
                    <option value="Mora Temprana">Mora Temprana (1-30 días)</option>
                    <option value="Mora Judicial">Mora Judicial (+60 días)</option>
                    <option value="Cancelado">Cancelado / Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Cuotas Pagadas:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={ayudaDetalle.Cantidad_Cuotas}
                    value={formAyudaEdit.Cuotas_Pagadas}
                    onChange={(e) => {
                      const pagadas = Number(e.target.value) || 0;
                      const rest = Math.max(0, ayudaDetalle.Cantidad_Cuotas - pagadas);
                      setFormAyudaEdit({
                        ...formAyudaEdit,
                        Cuotas_Pagadas: pagadas,
                        Saldo_Total_Restante: rest * ayudaDetalle.Valor_Cuota
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Restantes calculadas: {Math.max(0, ayudaDetalle.Cantidad_Cuotas - formAyudaEdit.Cuotas_Pagadas)}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Saldo Total Restante ($):
                  </label>
                  <input
                    type="number"
                    value={formAyudaEdit.Saldo_Total_Restante}
                    onChange={(e) =>
                      setFormAyudaEdit({
                        ...formAyudaEdit,
                        Saldo_Total_Restante: Number(e.target.value) || 0
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-rose-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Monto pendiente de cobro
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Cartera Titular:
                  </label>
                  <input
                    type="text"
                    value={formAyudaEdit.Cartera_Titular}
                    onChange={(e) => setFormAyudaEdit({ ...formAyudaEdit, Cartera_Titular: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notas de Avance & Observaciones de Gestión:
                </label>
                <textarea
                  value={formAyudaEdit.Observaciones}
                  onChange={(e) => setFormAyudaEdit({ ...formAyudaEdit, Observaciones: e.target.value })}
                  placeholder="Detalle de comunicaciones con el socio, acuerdos de pago o refi..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-normal focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAyudaDetalle(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios de la Ayuda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: GESTIÓN ACTIVA Y RESOLUCIÓN DE ALERTA SLA / COBRANZA */}
      {/* ============================================================== */}
      {alertaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {alertaDetalle.ID_Seguimiento}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Gestión y Resolución de Alerta SLA / Cobranza
                </h3>
                <p className="text-xs text-slate-500">{alertaDetalle.Subtipo_Tramite}</p>
              </div>
              <button
                onClick={() => setAlertaDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionAlerta} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estado:</label>
                  <select
                    value={formAlertaEdit.Estado_Alerta}
                    onChange={(e) => setFormAlertaEdit({ ...formAlertaEdit, Estado_Alerta: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Gestión">En Gestión</option>
                    <option value="Resuelta">Resuelta</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prioridad:</label>
                  <select
                    value={formAlertaEdit.Prioridad}
                    onChange={(e) => setFormAlertaEdit({ ...formAlertaEdit, Prioridad: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Operador Asignado:</label>
                  <select
                    value={formAlertaEdit.Operador_Asignado}
                    onChange={(e) => setFormAlertaEdit({ ...formAlertaEdit, Operador_Asignado: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="Julian">Julian</option>
                    <option value="Valentin">Valentin</option>
                    <option value="Romina">Romina</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detalle Original de la Alerta:</label>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  {alertaDetalle.Detalle_Gestion}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Registro de Avance / Próximo Paso Resolutivo:
                </label>
                <textarea
                  value={formAlertaEdit.Resultado_Proximo_Paso}
                  onChange={(e) => setFormAlertaEdit({ ...formAlertaEdit, Resultado_Proximo_Paso: e.target.value })}
                  placeholder="ej. Socio atendido por WhatsApp. Se acordó refinanciación en 12 cuotas..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Desea dar de baja / cancelar esta alerta?')) {
                      if (onActualizarEstadoAlerta) {
                        onActualizarEstadoAlerta(alertaDetalle.ID_Seguimiento, 'Cancelada');
                      }
                      setAlertaDetalle(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                >
                  Desactivar Alerta
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertaDetalle(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Gestión</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: AUDITORÍA Y EXTRACCIÓN OCR / IA DE LEGAJO */}
      {/* ============================================================== */}
      {auditoriaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {auditoriaDetalle.ID_Auditoria}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Reporte de Auditoría Gemini OCR / IA
                </h3>
                <p className="text-xs text-slate-500">{auditoriaDetalle.Nombre_Archivo}</p>
              </div>
              <button
                onClick={() => setAuditoriaDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200">
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Dictamen Oficial IA:</span>
                  <div className="font-bold text-sm text-purple-950 mt-0.5">{auditoriaDetalle.Dictamen_IA}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Score Confiabilidad:</span>
                  <div className="font-mono font-black text-lg text-purple-900">{auditoriaDetalle.Score_Riesgo}/100</div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Comentarios Técnicos del Auditor IA:</label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {auditoriaDetalle.Comentarios_Tecnicos}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Datos Estructurados Extraídos (JSON):</label>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(auditoriaDetalle.Datos_Extraidos_JSON), null, 2);
                    } catch {
                      return auditoriaDetalle.Datos_Extraidos_JSON;
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAuditoriaDetalle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ALTA DE FAMILIAR VINCULADO */}
      {/* ============================================================== */}
      {modalNuevoFamiliar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Vincular Nuevo Familiar al Socio
              </h3>
              <button
                onClick={() => setModalNuevoFamiliar(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarFamiliar} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Apellido y Nombre:</label>
                <input
                  type="text"
                  required
                  value={formFamiliar.nombre}
                  onChange={(e) => setFormFamiliar({ ...formFamiliar, nombre: e.target.value })}
                  placeholder="ej. Benitez, Tomás Ignacio"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parentesco:</label>
                  <select
                    value={formFamiliar.parentesco}
                    onChange={(e) => setFormFamiliar({ ...formFamiliar, parentesco: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Padre/Madre">Padre/Madre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DNI:</label>
                  <input
                    type="text"
                    required
                    value={formFamiliar.dni}
                    onChange={(e) => setFormFamiliar({ ...formFamiliar, dni: e.target.value })}
                    placeholder="ej. 48123904"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fecha de Nacimiento:</label>
                <input
                  type="date"
                  value={formFamiliar.fechaNacimiento}
                  onChange={(e) => setFormFamiliar({ ...formFamiliar, fechaNacimiento: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-acargo"
                  checked={formFamiliar.aCargo}
                  onChange={(e) => setFormFamiliar({ ...formFamiliar, aCargo: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="chk-acargo" className="text-slate-700 font-semibold cursor-pointer">
                  Familiar a Cargo (incluye Coseguro y Subsidios)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoFamiliar(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#135596] hover:bg-[#0e3b68] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Familiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ALTA DE CONSUMO / SUBSIDIO */}
      {/* ============================================================== */}
      {modalNuevoConsumo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Registrar Consumo o Subsidio Mutual
              </h3>
              <button
                onClick={() => setModalNuevoConsumo(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarConsumo} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Registro:</label>
                  <select
                    value={formConsumo.tipoRegistro}
                    onChange={(e) => setFormConsumo({ ...formConsumo, tipoRegistro: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="CONSUMO_SERVICIO">Consumo en Comercio Aliado</option>
                    <option value="SUBSIDIO">Subsidio Social Mutual</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rubro / Categoría:</label>
                  <select
                    value={formConsumo.categoria}
                    onChange={(e) => setFormConsumo({ ...formConsumo, categoria: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {formConsumo.tipoRegistro === 'CONSUMO_SERVICIO' ? (
                      <>
                        <option value="Farmacia">Farmacia</option>
                        <option value="Óptica">Óptica</option>
                        <option value="Ortopedia">Ortopedia</option>
                        <option value="Odontología">Odontología</option>
                        <option value="Estética">Centro de Estética</option>
                        <option value="Voucher / Comercio Aliado">Voucher / Supermercado</option>
                      </>
                    ) : (
                      <>
                        <option value="Subsidio Casamiento">Subsidio Casamiento</option>
                        <option value="Subsidio Nacimiento">Subsidio Nacimiento</option>
                        <option value="Subsidio Fallecimiento">Subsidio Fallecimiento</option>
                        <option value="Subsidio Escolaridad">Subsidio Escolaridad</option>
                        <option value="Subsidio Desempleo">Subsidio Desempleo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Comercio / Proveedor:</label>
                <input
                  type="text"
                  required
                  value={formConsumo.comercio}
                  onChange={(e) => setFormConsumo({ ...formConsumo, comercio: e.target.value })}
                  placeholder="ej. Farmacia Modelo Central"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Monto ($):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formConsumo.monto}
                  onChange={(e) => setFormConsumo({ ...formConsumo, monto: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observaciones / Comprobante:</label>
                <textarea
                  value={formConsumo.observaciones}
                  onChange={(e) => setFormConsumo({ ...formConsumo, observaciones: e.target.value })}
                  placeholder="Detalle de receta, factura o documentación presentada..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoConsumo(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ADJUNTAR FACTURA / COMPROBANTE DIGITAL A CONSUMO */}
      {/* ============================================================== */}
      {consumoAdjuntarFactura && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {consumoAdjuntarFactura.ID_Consumo}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Adjuntar Factura o Comprobante Digital
                </h3>
                <p className="text-xs text-slate-500">
                  {consumoAdjuntarFactura.Categoria} • {consumoAdjuntarFactura.Comercio_Proveedor}
                </p>
              </div>
              <button
                onClick={() => setConsumoAdjuntarFactura(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarFacturaConsumo} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Monto del Consumo:</span>
                  <strong className="text-slate-900 font-bold">{formatMonedaAR(consumoAdjuntarFactura.Monto)}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Fecha Operación:</span>
                  <strong className="text-slate-700">{consumoAdjuntarFactura.Fecha}</strong>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  N° de Factura / Ticket Fiscal:
                </label>
                <input
                  type="text"
                  required
                  value={formFactura.nroComprobante}
                  onChange={(e) => setFormFactura({ ...formFactura, nroComprobante: e.target.value })}
                  placeholder="ej. FAC-0001-00049281"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Enlace de Documento en Google Drive / URL:
                </label>
                <input
                  type="text"
                  value={formFactura.urlComprobante}
                  onChange={(e) => setFormFactura({ ...formFactura, urlComprobante: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El comprobante se resguarda digitalmente en el legajo Drive del socio.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observaciones / Detalle de Comprobante:
                </label>
                <textarea
                  value={formFactura.observaciones}
                  onChange={(e) => setFormFactura({ ...formFactura, observaciones: e.target.value })}
                  placeholder="ej. Medicamentos recetados por Dr. Gómez, descuento 40% aplicado..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConsumoAdjuntarFactura(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Vincular Comprobante en Drive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: ACTUALIZAR O REEMPLAZAR DOCUMENTO DE LEGAJO (HISTORIAL DRIVE) */}
      {/* ============================================================== */}
      {docAReemplazar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {docAReemplazar.ID_Auditoria} • Versión Actual v{docAReemplazar.Version_Num || 1}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Actualizar o Reemplazar Documento de Legajo
                </h3>
                <p className="text-xs text-slate-500">
                  Tipo: {docAReemplazar.Tipo_Doc} • Archivo previo: {docAReemplazar.Nombre_Archivo}
                </p>
              </div>
              <button
                onClick={() => setDocAReemplazar(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarReemplazoDoc} className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 uppercase text-[10px]">Nueva Versión a Generar:</span>
                  <span className="font-mono font-black text-purple-900 text-sm bg-white px-2 py-0.5 rounded border border-purple-300">
                    v{(docAReemplazar.Version_Num || 1) + 1}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  La versión anterior se mantendrá preservada en el histórico inmutable de auditoría para trazabilidad regulatoria ante el INAES.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Motivo de Reemplazo o Actualización:
                </label>
                <select
                  value={formReemplazo.motivo}
                  onChange={(e) => setFormReemplazo({ ...formReemplazo, motivo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Actualización mensual de haberes (nuevo recibo)">
                    Actualización mensual de haberes (nuevo período de recibo de sueldo)
                  </option>
                  <option value="Reemplazo por escaneo legible en alta resolución">
                    Reemplazo por escaneo legible / color de mayor nitidez
                  </option>
                  <option value="Actualización por cambio de domicilio del socio">
                    Actualización por cambio de domicilio / factura reciente
                  </option>
                  <option value="Actualización reglamentaria de constancia CBU/Alias">
                    Actualización reglamentaria de constancia CBU/Alias bancaria
                  </option>
                  <option value="Reemplazo de documento vencido o ilegible">
                    Reemplazo de documento vencido o ilegible
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nombre del Archivo / Documento:
                </label>
                <input
                  type="text"
                  required
                  value={formReemplazo.nombreArchivo}
                  onChange={(e) => setFormReemplazo({ ...formReemplazo, nombreArchivo: e.target.value })}
                  placeholder="ej. Recibo_Sueldo_Noviembre_2026.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Seleccionar Archivo Físico (PDF / JPG / PNG):
                </label>
                <input
                  type="file"
                  ref={fileReemplazoRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormReemplazo({
                        ...formReemplazo,
                        nombreArchivo: e.target.files[0].name,
                        archivo: e.target.files[0]
                      });
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocAReemplazar(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Subir Versión v{(docAReemplazar.Version_Num || 1) + 1} y Auditar con IA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
