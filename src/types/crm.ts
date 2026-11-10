export type OperadorMutual = 'Julian' | 'Melina' | 'Lucrecia' | 'Andrea' | 'Valentina' | 'Nicolas';

export type LineaAyuda = 'FEDEM Provincial' | 'Municipalidad (VIKINGO)' | 'Tarjeta Sidecreer';

export type EstadoTramite = 'Solicitado' | 'En Evaluación' | 'Aprobado' | 'Liquidado' | 'Cancelado por Refinanciación' | 'Rechazado';

export type EstadoCobranza = 'Al Día' | 'Mora Temprana' | 'Mora Tardía' | 'En Gestión Judicial' | 'Cancelado Total';

export type EstadoDocumentacion = 'Incompleto' | 'En Revisión' | 'Legajo Completo';

export type TipoRegistroAlerta = 'Alerta Trámite' | 'Seguimiento Cobranza' | 'Consulta Comercial' | 'Reclamo Socio';

export type EstadoAlerta = 'Pendiente' | 'En Gestión' | 'Resuelta' | 'Reprogramada' | 'Cancelada';

export type PrioridadAlerta = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export type EstadoPEP = 'NO_PEP' | 'PEP_DECLARADO' | 'REQUIERE_DJ';

export type EstadoREPET = 'LIMPIO' | 'EN_ALERTA';

export type EstadoARCA = 'ACTIVO_REGULAR' | 'OBSERVADO' | 'SIN_CONSTANCIA' | 'EXENTO';

export type EstadoInhibicionJudicial = 'HABILITADO' | 'INHIBIDO';

export type CondicionPrevisional = 'ACTIVO_APORTANTE' | 'LEY_8732_PROVINCIAL' | 'ANSES_NACIONAL' | 'EN_TRAMITE';

export type TabKey =
  | 'padron-socios'
  | 'ficha-socio-360'
  | 'simulador-originacion'
  | 'centro-operaciones'
  | 'comercializadores'
  | 'carteras-vpn'
  | 'alianzas-billetera'
  | 'recibos-ai-webhooks'
  | 'marketing-leads';

export interface FamiliarSocio {
  id: string;
  nombre: string;
  parentesco: 'Cónyuge' | 'Hijo/a' | 'Padre/Madre' | 'Otro';
  dni: string;
  fechaNacimiento: string;
  aCargo: boolean;
}

export interface SubsidioSocio {
  id: string;
  tipo: 'Nacimiento' | 'Casamiento' | 'Fallecimiento' | 'Escolaridad' | 'Óptico';
  fechaOtorgamiento: string;
  monto: number;
  estado: 'Aprobado' | 'Liquidado' | 'En Trámite';
}

export interface SocioPadron {
  DNI: string;
  Nro_Socio: string;
  Apellido_Nombre: string;
  Fecha_Nacimiento: string;
  Edad: number;
  Sexo: 'F' | 'M' | 'Otro';
  Domicilio: string;
  Localidad: string;
  Telefono_WhatsApp: string;
  Email: string;
  CBU_Alias: string;
  Banco: string;
  Organismo: string;
  Sector_Trabajo: string;
  Dependencia_Funcion: string;
  Condicion_Laboral: 'Planta Permanente' | 'Contratado' | 'Jubilado/Pensionado' | 'Monotributista';
  Legajo_Sueldo: string;
  Sueldo_Bruto: number;
  Afectaciones_Ley: number;
  Afectaciones_Particulares: number;
  Sueldo_Neto: number;
  Margen_Cuota_Disponible: number;
  Monto_Preaprobado: number;
  Estado_Cuota_Social: 'Al Día' | 'Deuda 1 Mes' | 'Deuda 2+ Meses' | 'Exento';
  Deuda_Cuota_Social: number;
  En_Tramite_Jubilacion: 'SI' | 'NO';
  Detalle_Jubilacion: string;
  Bloqueado_Legales: 'SI' | 'NO';
  Detalle_Legales: string;
  Pagos_Duplicados: 'SI' | 'NO';
  Detalle_Pagos_Duplicados: string;
  Alivio_Financiero: 'SI' | 'NO';
  Mutuales_Alivio: string;
  Certificacion_Deuda: 'SI' | 'NO';
  Detalle_Certificacion: string;
  // Campos de Cumplimiento Normativo y Auditoría (UIF / INAES / ARCA):
  Estado_PEP: EstadoPEP;
  Detalle_PEP?: string;
  Estado_REPET: EstadoREPET;
  Detalle_REPET?: string;
  Estado_ARCA_Constancia: EstadoARCA;
  CUIT_ARCA?: string;
  Estado_Inhibicion_Judicial: EstadoInhibicionJudicial;
  Condicion_Previsional: CondicionPrevisional;
  Fecha_Auditoria_Normativa: string;
  Subsidios_JSON: string; // JSON de SubsidioSocio[]
  Grupo_Familiar_JSON: string; // JSON de FamiliarSocio[]
  Carpeta_Drive_ID: string;
  Carpeta_Drive_URL: string;
  Originacion: 'Orgánica' | 'Comercializador';
  Fecha_Alta: string;
  Ultima_Actualizacion: string;
  Operador: OperadorMutual;
  // Campos de Autenticación y App PWA (Edición Enterprise v5.0):
  Clave_Acceso_Hash?: string;
  Estado_Usuario_App?: 'Activo' | 'Bloqueado' | 'Pendiente Primer Ingreso';
  Ultimo_Ingreso_Fecha?: string;
}

export type PortalType = 'portal-crm-admin' | 'portal-socio-app' | 'portal-comercio-b2b';

export interface SesionUsuario {
  tipo: 'OPERADOR_CRM' | 'SOCIO_APP' | 'COMERCIO_B2B';
  idUsuario: string; // DNI del socio, CUIT del comercio, u operador mutual
  nombre: string;
  rol?: string;
  sucursal?: string;
  fechaIngreso: string;
}

export interface CuotaPlan {
  numeroCuota: number;
  fechaVencimiento: string;
  cuotaTotal: number;
  amortizacionCapital: number;
  interesYGastos: number;
  saldoCapitalRestante: number;
  estado: 'Pendiente' | 'Pagada' | 'En Mora';
}

export interface ArchivoAdjuntoDrive {
  idArchivo: string;
  nombre: string;
  tipoDocumento: 'DNI' | 'RECIBO' | 'CBU' | 'MUTUO' | 'PAGARE' | 'LIBRE_DEUDA' | 'SERVICIO' | 'OTRO';
  url: string;
  fechaHora: string;
  operador: OperadorMutual;
}

export interface ChecklistDoc {
  DNI: boolean;
  RECIBO: boolean;
  CBU: boolean;
  MUTUO: boolean;
  PAGARE: boolean;
  LIBRE_DEUDA: boolean;
  SERVICIO: boolean;
}

export interface AyudaEconomica {
  ID_Ayuda: string;
  Nro_Mutuo: string;
  Fecha_Solicitud: string;
  Fecha_Liquidacion: string;
  Periodo_Mes: string;
  DNI: string;
  Apellido_Nombre: string;
  Linea_Ayuda: LineaAyuda;
  Organismo: string;
  Originacion: 'Orgánica' | 'Comercializador';
  ID_Comercializador: string;
  Nombre_Comercializador: string;
  Monto_Solicitado: number;
  Monto_Depositado: number;
  Es_Refinanciacion: 'SI' | 'NO';
  IDs_Ayudas_Canceladas: string; // Comma-separated or JSON
  Deudas_Manuales_JSON: string; // JSON de { entidad: string, monto: number }[]
  Monto_Retenido_Refi: number;
  Neto_Efectivo_Entregado: number;
  Capital_Bruto: number;
  Gastos_Admin: number;
  Seguro_Total: number;
  Intereses_Financieros: number;
  Total_A_Devolver: number;
  Cantidad_Cuotas: number;
  Valor_Cuota: number;
  Cuotas_Pagadas: number;
  Cuotas_Restantes: number;
  Saldo_Capital_Restante: number;
  Saldo_Total_Restante: number;
  Estado_Tramite: EstadoTramite;
  Estado_Cobranza: EstadoCobranza;
  Estado_Documentacion: EstadoDocumentacion;
  Checklist_Doc_JSON: string; // JSON de ChecklistDoc
  Carpeta_Legajo_URL: string;
  Archivos_Adjuntos_JSON: string; // JSON de ArchivoAdjuntoDrive[]
  Plan_Cuotas_JSON: string; // JSON de CuotaPlan[]
  Cartera_Titular: string; // 'Cartera Propia Mutual' o Cesionario
  ID_Lote_Cesion: string;
  Fecha_Cesion: string;
  Observaciones: string;
  Operador: OperadorMutual;
}

export interface EtapaGestionAlerta {
  idEtapa: string;
  fechaHora: string;
  operador: OperadorMutual;
  accion: string;
  detalle: string;
  resultado?: string;
  nuevoEstado: EstadoAlerta;
}

export interface SeguimientoAlerta {
  ID_Seguimiento: string;
  Fecha_Hora: string;
  DNI: string;
  Apellido_Nombre: string;
  ID_Ayuda_Relacionada: string;
  Tipo_Registro: TipoRegistroAlerta;
  Categoria: 'Alerta SLA' | 'Seguimiento' | 'Cobranzas' | 'Comercial';
  Subtipo_Tramite: string;
  Prioridad: PrioridadAlerta;
  Fecha_Vencimiento_Alerta: string;
  Estado_Alerta: EstadoAlerta;
  Detalle_Gestion: string;
  Resultado_Proximo_Paso: string;
  Operador_Asignado: OperadorMutual;
  Operador_Creador: OperadorMutual;
  Notificado_WhatsApp: 'SI' | 'NO';
  Historial_Gestiones_JSON?: string; // JSON de EtapaGestionAlerta[]
  // Campo temporal enriquecido:
  estadoTemporalAlerta?: 'VENCIDA' | 'VENCE_HOY' | 'PROXIMA' | 'RESUELTA';
}

export interface Comercializador {
  ID_Comercializador: string;
  Nombre_Estudio_Agente: string;
  DNI_CUIT: string;
  Telefono: string;
  Email: string;
  CBU_Pago: string;
  Base_Calculo_Comision: 'Neto_Efectivo_Entregado' | 'Monto_Solicitado' | 'Capital_Bruto';
  Porcentaje_Comision: number;
  Estado: 'Activo' | 'Inactivo';
  Fecha_Alta: string;
  Observaciones: string;
}

export interface LiquidacionComision {
  ID_Liquidacion: string;
  Fecha_Emision: string;
  Periodo_Desde: string;
  Periodo_Hasta: string;
  ID_Comercializador: string;
  Nombre_Comercializador: string;
  Cantidad_Ayudas: number;
  Total_Monto_Solicitado: number;
  Total_Monto_Depositado: number;
  Total_Neto_Efectivo: number;
  Base_Aplicada: string;
  Porcentaje_Comision: number;
  Monto_Comision_Bruta: number;
  Deducciones_Ajustes: number;
  Neto_A_Pagar_Comision: number;
  Estado_Pago: 'Pendiente de Pago' | 'Pagado' | 'Anulado';
  Fecha_Pago: string;
  Comprobante_Pago_URL: string;
  IDs_Ayudas_Incluidas_JSON: string;
  Operador: OperadorMutual;
}

export interface CesionCartera {
  ID_Lote_Cesion: string;
  Fecha_Cesion: string;
  Cesionario_Entidad_Destino: string;
  CUIT_Cesionario: string;
  Lineas_Incluidas: string;
  Cantidad_Creditos_Cedidos: number;
  Total_Monto_Original: number;
  Total_Cuotas_Restantes: number;
  Saldo_Nominal_Cedido: number;
  Tasa_Descuento_Aplicada_Pct: number;
  Precio_Venta_Cartera: number;
  Modalidad_Cobranza: 'Cobranza por CBU' | 'Retención por Recibo CGE' | 'Cesión Plena';
  Estado_Cesion: 'Vigente' | 'Revertido' | 'Finalizado';
  IDs_Ayudas_Cedidas_JSON: string;
  Contrato_Drive_URL: string;
  Observaciones: string;
  Operador: OperadorMutual;
}

export interface ReciboCodigo {
  ID_Registro: string;
  Tipo_Fila: 'CODIGO_MAESTRO' | 'ANALISIS_RECIBO';
  Codigo_Concepto: string;
  Nombre_Concepto: string;
  Organismo_Ambito: string;
  Clasificacion_Recibo: 'HABER_COMPUTABLE' | 'NO_COMPUTABLE' | 'DESCUENTO_LEY' | 'DESCUENTO_PARTICULAR';
  DNI_Analizado: string;
  Fecha_Analisis: string;
  Haberes_Computables: number;
  Descuentos_Ley: number;
  Descuentos_Particulares: number;
  Regla_Afectacion: '35% Neto Ley' | '40% Neto Ley' | '40% Sueldo Bruto';
  Pct_Tope: number;
  Margen_Disponible_Calculado: number;
  Detalle_Items_JSON: string; // JSON de { codigo: string, concepto: string, monto: number, clasificacion: string }[]
  Operador: OperadorMutual;
}

export interface ItemReciboAnalizado {
  codigo: string;
  concepto: string;
  monto: number;
  clasificacion: 'HABER_COMPUTABLE' | 'NO_COMPUTABLE' | 'DESCUENTO_LEY' | 'DESCUENTO_PARTICULAR';
}

export interface LogIntegracionIA {
  ID_Log: string;
  Fecha_Hora: string;
  Canal_Agente: 'Gemini OCR' | 'Darwin IA' | 'WhatsApp API' | 'Sistema Interno';
  Evento_Accion: string;
  DNI_Relacionado: string;
  ID_Referencia: string;
  Payload_Entrada_JSON: string;
  Respuesta_Salida_JSON: string;
  Estado_Ejecucion: 'SUCCESS' | 'ERROR' | 'WARNING';
  Latencia_Ms: number;
}

export interface ConfiguracionIA {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  IA_AUDITORIA_ACTIVA: 'SI' | 'NO';
  DARWIN_IA_WEBHOOK_URL: string;
  DARWIN_IA_API_KEY: string;
  DARWIN_IA_ACTIVO: 'SI' | 'NO';
  WHATSAPP_API_URL: string;
  WHATSAPP_API_TOKEN: string;
  WHATSAPP_INSTANCE_ID: string;
  WHATSAPP_API_ACTIVO: 'SI' | 'NO';
}

export interface SubsidioYConsumo {
  ID_Consumo: string;
  DNI: string;
  Apellido_Nombre: string;
  Tipo_Registro: 'SUBSIDIO' | 'CONSUMO_SERVICIO';
  Categoria: 'Farmacia' | 'Óptica' | 'Ortopedia' | 'Odontología' | 'Estética' | 'Voucher / Comercio Aliado' | 'Subsidio Casamiento' | 'Subsidio Nacimiento' | 'Subsidio Fallecimiento' | 'Subsidio Desempleo' | 'Subsidio Escolaridad';
  Comercio_Proveedor: string;
  Fecha: string;
  Monto: number;
  Estado: 'Entregado / Aprobado' | 'En Proceso' | 'Pendiente Retiro' | 'Cancelado';
  Comprobante_Drive_URL?: string;
  Observaciones?: string;
  Operador: OperadorMutual;
}

export interface AuditoriaIALegajo {
  ID_Auditoria: string;
  DNI: string;
  Apellido_Nombre: string;
  ID_Documento_Drive: string;
  Nombre_Archivo: string;
  Tipo_Doc: 'DNI' | 'RECIBO' | 'CBU' | 'SERVICIO' | 'MUTUO' | 'CONSUMO' | 'OTRO';
  Version_Num: number;
  Es_Version_Actual: boolean;
  Fecha_Reemplazo?: string;
  Motivo_Reemplazo?: string;
  Dictamen_IA: 'Aprobado 🟢' | 'Observado 🟡' | 'Ilegible 🔴' | 'Legibilidad Baja 🔴';
  Score_Riesgo: number; // 0 a 100
  Fecha_Analisis: string;
  Comentarios_Tecnicos: string;
  Datos_Extraidos_JSON: string; // JSON con datos leídos por Gemini Vision
  Operador: OperadorMutual;
}

export interface HistorialComisionComercializador {
  ID_Log: string;
  ID_Comercializador: string;
  Nombre_Comercializador: string;
  Fecha_Cambio: string;
  Comision_Anterior: number;
  Comision_Nueva: number;
  Base_Calculo_Anterior: string;
  Base_Calculo_Nueva: string;
  Motivo_Modificacion: string;
  Operador: OperadorMutual;
}

export interface SimulationResultRow {
  plazo: number;
  valorCuota: number;
  netoEntregar: number;
  montoFinalDevolver: number;
  // Detalle administrativo:
  capitalBruto: number;
  gastosAdmin: number;
  seguroTotal: number;
  cuotaPura: number;
  interesesFinancieros: number;
  tna: number;
  tem: number;
  tea: number;
  temCft: number;
  coeficiente: number;
  capitalVikingo?: number;
  capitalQuad?: number;
  textoWhatsApp: string;
}

export type RubroComercioB2B =
  | 'Farmacia'
  | 'Proveeduría'
  | 'Motos & Movilidad'
  | 'Náutica & Pesca'
  | 'Turismo & Hotelería'
  | 'Estética & Salud'
  | 'Óptica'
  | 'Odontología'
  | 'Electro & Hogar';

export interface ComercioAlianzaB2B {
  ID_Comercio: string;
  Nombre_Fantasia: string;
  Razon_Social: string;
  Rubro: RubroComercioB2B;
  CUIT_Responsable: string;
  Direccion: string;
  Localidad: string;
  Telefono_WhatsApp: string;
  Email: string;
  Arancel_Mutual_Pct: number; // e.g. 3.5%
  Planes_Cuotas_JSON: string; // JSON de number[] e.g. [1, 3, 6, 12, 18, 24]
  Acepta_Cuenta_Corriente: 'SI' | 'NO';
  Permite_Adelanto_Liquidacion: 'SI' | 'NO';
  Tasa_Descuento_Adelanto_Pct: number; // e.g. 3.0%
  PIN_Token_Acceso: string;
  Estado: 'Activo' | 'Suspendido';
  Estado_Comercio?: 'Activo' | 'Suspendido';
  Clave_Acceso_B2B_Hash?: string;
  Sucursales_JSON?: string;
  Saldo_Ventas_Pendientes: number;
  Total_Facturado_Historico: number;
  Fecha_Alta: string;
  Observaciones?: string;
  // Campos Enterprise v5.4 para Directorio y Mapa Interactivo
  Latitud?: number;
  Longitud?: number;
  Horarios_Atencion?: string;
  Descripcion?: string;
  Promos_Activas_JSON?: string;
  Imagen_Portada?: string;
  Calificacion?: number;
  Abierto_Ahora?: boolean;
}

export interface PromocionPoolReintegro {
  ID_Promo: string;
  ID_Comercio: string;
  Nombre_Comercio: string;
  Rubro: RubroComercioB2B;
  Titulo: string;
  Pct_Descuento: number; // e.g. 20%
  Tope_Mensual_Socio: number; // e.g. 15000
  Presupuesto_Pool_Total: number; // e.g. 1500000
  Presupuesto_Consumido: number;
  Dias_Semana_JSON: string; // JSON de string[] e.g. ["Lunes", "Miércoles", "Viernes"] o ["Todos los días"]
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Estado: 'Vigente' | 'Agotada' | 'Pausada';
  Codigo_QR_Vidriera: string;
  Cupos_Totales: number;
  Cupos_Utilizados: number;
}

export interface DetalleSelloItem {
  selloNum: number;
  fechaHora: string;
  accion: string;
  comercio: string;
  puntosGanados: number;
  estado: 'Completado' | 'Pendiente';
  icono?: string;
  comprobanteId?: string;
  tipRecomendado?: string;
}

export interface FidelidadSellosSocio {
  ID_Registro: string;
  DNI_Socio: string;
  Apellido_Nombre: string;
  Sellos_Acumulados: number; // 0 a 10 sellos
  Ciclos_Completados: number;
  Puntos_Totales: number;
  Vouchers_Emitidos_JSON: string; // JSON de { id: string, titulo: string, monto: number, vencimiento: string, estado: 'Disponible' | 'Canjeado' | 'Vencido' }[]
  Ultima_Actualizacion: string;
  Historial_Sellos_JSON: string; // JSON de DetalleSelloItem[]
}

export interface TransaccionBilletera {
  ID_Transaccion: string;
  Fecha_Hora: string;
  DNI_Socio: string;
  Apellido_Nombre_Socio: string;
  ID_Comercio: string;
  Nombre_Comercio: string;
  Rubro: RubroComercioB2B;
  Billetera_Utilizada: 'Disponible 1 - Cuenta Corriente' | 'Disponible 2 - Consumo Específico B2B' | 'Disponible 3 - Ayuda Libre';
  Monto_Total_Compra: number;
  Monto_Reintegro_Aplicado: number;
  Monto_Neto_Financiado: number;
  Cuotas: number;
  Monto_Cuota: number;
  Metodo_Autorizacion: 'QR Dinámico Billetera' | 'Cobro Asistido Mostrador (WhatsApp)' | 'Token PIN';
  Estado_Transaccion: 'Aprobada' | 'En Auditoría Antifraude' | 'Desconocida por Socio' | 'Anulada';
  Token_Autorizacion: string;
  Liquidado_Al_Comercio: 'SI' | 'NO';
  ID_Promo_Aplicada?: string;
}

export interface AdelantoLiquidacionComercio {
  ID_Adelanto: string;
  Fecha_Solicitud: string;
  ID_Comercio: string;
  Nombre_Comercio: string;
  Monto_Ventas_Adelantadas: number;
  Tasa_Descuento_Pct: number;
  Monto_Descuento_Financiero: number;
  Neto_Transferido: number;
  CBU_Destino: string;
  Estado: 'Liquidado' | 'En Proceso' | 'Rechazado';
  Operador: OperadorMutual;
}
