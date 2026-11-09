/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RyycoSupplier,
  SupplierProduct,
  SupplierCategory,
  SupplierApplication,
} from '../types/ryycoB2B';
import { formatCop, sanitizeRyycoPhone } from '../utils/ryycoFormatters';
import {
  IMG_BEEF_PATTIES,
  IMG_ECO_PACKAGING,
  IMG_FRESH_PRODUCE,
  IMG_OIL_DAIRY,
} from '../data/ryycoB2BSeed';
import {
  Store,
  Truck,
  FileText,
  ShieldCheck,
  Check,
  Package,
  User,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Plus,
  Send,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { RyycoLogo } from './RyycoLogo';

interface SupplierPortalViewProps {
  suppliers: RyycoSupplier[];
  products: SupplierProduct[];
  applications: SupplierApplication[];
  onSubmitApplication: (app: Omit<SupplierApplication, 'id' | 'status' | 'createdAt'>) => void;
  onCreateSupplierProduct: (product: Omit<SupplierProduct, 'id'>) => void;
  onOpenAdminPanel: () => void;
  userName?: string;
  onBackToMarketplace?: () => void;
}

const CATEGORIES: SupplierCategory[] = [
  'Cárnicos y Embutidos',
  'Frutas y Verduras',
  'Aceites y Abarrotes',
  'Lácteos y Quesos',
  'Empaques Biodegradables',
  'Bebidas y Licores',
];

const CATEGORY_DEFAULT_IMAGE: Record<SupplierCategory, string> = {
  'Cárnicos y Embutidos': IMG_BEEF_PATTIES,
  'Frutas y Verduras': IMG_FRESH_PRODUCE,
  'Aceites y Abarrotes': IMG_OIL_DAIRY,
  'Lácteos y Quesos': IMG_OIL_DAIRY,
  'Empaques Biodegradables': IMG_ECO_PACKAGING,
  'Bebidas y Licores': IMG_OIL_DAIRY,
};

export const SupplierPortalView: React.FC<SupplierPortalViewProps> = ({
  suppliers,
  products,
  applications,
  onSubmitApplication,
  onCreateSupplierProduct,
  onOpenAdminPanel,
  userName = 'PRUEBA',
  onBackToMarketplace,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'contact_ryyco' | 'add_product'>('directory');
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

  // Formulario de postulación de contacto a RYYCO Central
  const [appTradeName, setAppTradeName] = useState('');
  const [appBusinessName, setAppBusinessName] = useState('');
  const [appNit, setAppNit] = useState('');
  const [appCategory, setAppCategory] = useState<SupplierCategory>('Cárnicos y Embutidos');
  const [appCity, setAppCity] = useState('Ipiales');
  const [appAddress, setAppAddress] = useState('');
  const [appContactName, setAppContactName] = useState('');
  const [appContactWhatsapp, setAppContactWhatsapp] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appEstimatedSkus, setAppEstimatedSkus] = useState(15);
  const [appMessage, setAppMessage] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Formulario nuevo insumo mayorista
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState<SupplierCategory>('Cárnicos y Embutidos');
  const [presentationLabel, setPresentationLabel] = useState('Caja master x 10 kg');
  const [baseUnit, setBaseUnit] = useState<'kg' | 'litro' | 'unidad'>('kg');
  const [baseUnitQuantity, setBaseUnitQuantity] = useState(10);
  const [priceCop, setPriceCop] = useState(245000);
  const [tierQty, setTierQty] = useState(5);
  const [tierPriceCop, setTierPriceCop] = useState(228000);
  const [prodStock, setProdStock] = useState<number>(50);
  const [equivalentGroupKey, setEquivalentGroupKey] = useState('carne-hamburguesa-res-premium');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const canUpload = selectedSupplier?.canUploadProducts && selectedSupplier?.status === 'active';

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTradeName.trim() || !appNit.trim() || !appContactWhatsapp.trim()) return;

    onSubmitApplication({
      tradeName: appTradeName.trim(),
      businessName: appBusinessName.trim() || `${appTradeName.trim()} S.A.S.`,
      nit: appNit.trim(),
      category: appCategory,
      city: appCity.trim(),
      address: appAddress.trim() || 'Sector Comercial / Industrial',
      contactName: appContactName.trim() || 'Representante Comercial',
      contactWhatsapp: sanitizeRyycoPhone(appContactWhatsapp),
      email: appEmail.trim() || 'ventas@proveedor.co',
      catalogEstimatedSkus: appEstimatedSkus,
      message: appMessage.trim() || 'Interesados en abastecer a la red de restaurantes del ecosistema RYYCO.',
    });

    setApplicationSubmitted(true);
    setTimeout(() => {
      setApplicationSubmitted(false);
      setActiveSubTab('directory');
    }, 2800);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload) return;
    const sup = selectedSupplier;
    if (!sup || !prodName.trim()) return;

    const groupNames: Record<string, string> = {
      'carne-hamburguesa-res-premium': 'Carne de Hamburguesa Res Premium 80/20',
      'empaque-hamburguesa-biodegradable': 'Contenedor Térmico Biodegradable para Llevar',
      'aceite-fritura-industrial-20l': 'Aceite Vegetal Fritura Profunda Alto Punto de Humo',
      'kit-verduras-frescas-restaurante': 'Mix Verduras Frescas Lavadas (Tomate, Lechuga, Cebolla, Aguacate)',
      'insumo-general-mayorista': prodName.trim(),
    };

    onCreateSupplierProduct({
      supplierId: sup.id,
      supplierTradeName: sup.tradeName,
      supplierVerified: Boolean(sup.verifiedByRyyco),
      supplierLeadTimeHours: Number(sup.leadTimeHours) || 4,
      supplierRating: Number(sup.rating) || 5.0,
      sku: prodSku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      equivalentGroupKey,
      equivalentGroupName: groupNames[equivalentGroupKey] || prodName.trim(),
      name: prodName.trim(),
      description: `Suministro institucional distribuido por ${sup.tradeName} para restaurantes RYYCO.`,
      category: prodCategory,
      presentationLabel: presentationLabel.trim() || 'Unidad de venta mayorista',
      baseUnit,
      baseUnitQuantity: Math.max(0.1, Number(baseUnitQuantity) || 1),
      priceCop: Math.max(100, Number(priceCop) || 1000),
      volumeTiers:
        tierPriceCop < priceCop
          ? [
              {
                minQty: Number(tierQty) || 5,
                unitPriceCop: Number(tierPriceCop),
                label: `${tierQty}+ uds (${formatCop(Number(tierPriceCop) / Math.max(0.1, Number(baseUnitQuantity) || 1))}/${baseUnit})`,
              },
            ]
          : [],
      minOrderQty: 1,
      stock: Math.max(1, Number(prodStock) || 50),
      photoUrl: CATEGORY_DEFAULT_IMAGE[prodCategory] || '',
      salesUnit: baseUnit === 'kg' ? 'kilogramo' : baseUnit === 'litro' ? 'litro' : 'unidad',
      availability: 'disponible',
      leadTimePrepHours: 0,
      storageCondition: prodCategory === 'Cárnicos y Embutidos' ? 'refrigerado' : 'ambiente',
      isVariableWeight: false,
      active: true,
    });

    setProdName('');
    setProdSku('');
    setProdStock(50);
    setActiveSubTab('directory');
  };

  const formatDisplayPhone = (rawPhone: string) => {
    if (!rawPhone) return '';
    return rawPhone.replace(/^57/, '');
  };

  const getWhatsAppUrl = (rawPhone: string, tradeName: string) => {
    const cleanPhone = sanitizeRyycoPhone(rawPhone);
    const text = encodeURIComponent(
      `Hola ${tradeName}, los contacto desde la plataforma RYYCO para consultar disponibilidad y cotización de insumos.`
    );
    return `https://wa.me/57${cleanPhone.replace(/^57/, '')}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-gray-900 flex flex-col">
      {/* 1. Header Corporativo Superior (Mockup: Logo RYYCO | Red de proveedores ... Usuario) */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="flex items-center cursor-pointer transition-opacity hover:opacity-90"
              title="Volver al Catálogo"
            >
              <RyycoLogo variant="dark" className="h-8" showSubtitle={false} />
            </button>
            <div className="h-5 w-px bg-gray-300" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base tracking-tight">
              Red de proveedores
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop User Pill: PRUEBA ⌄ */}
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Panel RYYCO Central"
            >
              <User className="w-4 h-4 text-gray-700" />
              <span className="tracking-tight uppercase">{userName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {/* Mobile User Icon: circular */}
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="sm:hidden w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Perfil / Admin"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Cuerpo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Section */}
        <div className="space-y-1">
          <p className="text-[11px] sm:text-xs font-extrabold text-[#D97706] tracking-wider uppercase">
            PROVEEDORES Y ADMISIÓN
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-950 tracking-tight font-display">
            Conecta con proveedores RYYCO
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Contacta a RYYCO Central para vincular tu empresa. Tras la verificación, podrás publicar tu catálogo.
          </p>
        </div>

        {/* Barra de Acciones y Pestañas */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Botón Rojo Activo Proveedores (2) */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('directory');
              setIsCatalogMenuOpen(false);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs ${
              activeSubTab === 'directory'
                ? 'bg-[#E52243] hover:bg-[#D1132A] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:text-gray-950'
            }`}
          >
            Proveedores ({suppliers.length})
          </button>

          {/* Botón Texto Contactar a RYYCO Central */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('contact_ryyco');
              setIsCatalogMenuOpen(false);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'contact_ryyco'
                ? 'bg-gray-100 text-gray-900 font-bold'
                : 'text-gray-800 hover:text-gray-950 hover:bg-gray-50'
            }`}
          >
            Contactar a RYYCO Central
          </button>

          {/* Desplegable Operaciones de catálogo ⌄ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCatalogMenuOpen(!isCatalogMenuOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                activeSubTab === 'add_product'
                  ? 'bg-gray-100 text-gray-900 border-gray-300'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>Operaciones de catálogo</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {isCatalogMenuOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('add_product');
                    setIsCatalogMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#E52243] shrink-0" />
                  <div>
                    <div className="font-bold text-gray-900">Subir Insumo al Catálogo</div>
                    <div className="text-[11px] text-gray-500">Publicar nuevo producto con precios mayoristas</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Tarjeta "Así funciona la admisión" */}
        <div className="bg-[#FFFDF7] border border-[#FDE68A] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>Así funciona la admisión</span>
          </div>

          {/* Pasos Desktop: Fila horizontal con flechas y botón rojo outline */}
          <div className="hidden lg:flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2 xl:gap-3 flex-1">
              {/* Paso 1 */}
              <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs flex-1">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </div>
                <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                  Postula tus datos
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

              {/* Paso 2 */}
              <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs flex-1">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </div>
                <Truck className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                  Revisamos RUT y logística
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

              {/* Paso 3 */}
              <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs flex-1">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </div>
                <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                  Aprobamos tu solicitud
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

              {/* Paso 4 */}
              <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs flex-1">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  4
                </div>
                <Store className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                  Publica tu catálogo
                </span>
              </div>
            </div>

            {/* Botón rojo outline: Abrir panel RYYCO Central */}
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="bg-white border-2 border-[#E52243] hover:bg-rose-50 text-[#E52243] rounded-xl px-4 py-2.5 flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#E52243]" />
              <span className="font-bold text-xs text-[#E52243] whitespace-nowrap">
                Abrir panel RYYCO Central
              </span>
            </button>
          </div>

          {/* Pasos Mobile: Tarjetas verticales apiladas */}
          <div className="lg:hidden space-y-2 mt-3">
            <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                1
              </div>
              <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Postula tus datos</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                2
              </div>
              <Truck className="w-4 h-4 text-[#D97706] shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Revisamos RUT y logística</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                3
              </div>
              <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Aprobamos tu solicitud</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                4
              </div>
              <Store className="w-4 h-4 text-[#D97706] shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Publica tu catálogo</span>
            </div>

            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="w-full mt-2 bg-white border-2 border-[#E52243] hover:bg-rose-50 text-[#E52243] rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#E52243]" />
              <span className="font-bold text-xs text-[#E52243]">Abrir panel RYYCO Central</span>
            </button>
          </div>
        </div>

        {/* 4. VISTA PRINCIPAL: DIRECTORIO DE PROVEEDORES */}
        {activeSubTab === 'directory' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 font-display tracking-tight">
                Directorio de proveedores
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {suppliers.length} {suppliers.length === 1 ? 'proveedor habilitado' : 'proveedores habilitados'}
              </p>
            </div>

            {suppliers.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
                  <Store className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">0 Proveedores Habilitados</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    No hay proveedores habilitados en este momento. Puedes postular tu empresa o registrar nuevos desde RYYCO Central.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('contact_ryyco')}
                    className="px-4 py-2 bg-[#E52243] hover:bg-[#D1132A] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Postular a RYYCO Central
                  </button>
                  <button
                    type="button"
                    onClick={onOpenAdminPanel}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Registrar en Central
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tabla Desktop (>= md) */}
                <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500">
                          <th className="py-3.5 px-5">Proveedor</th>
                          <th className="py-3.5 px-4">Especialidad</th>
                          <th className="py-3.5 px-4">WhatsApp</th>
                          <th className="py-3.5 px-4">Pedido mínimo</th>
                          <th className="py-3.5 px-4">Insumos</th>
                          <th className="py-3.5 px-5">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                        {suppliers.map((sup) => {
                          const supProductsCount = products.filter(
                            (p) => p.supplierId === sup.id
                          ).length;

                          return (
                            <tr
                              key={sup.id}
                              className="hover:bg-gray-50/60 transition-colors"
                            >
                              {/* Columna Proveedor */}
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
                                    <Store className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 text-sm">
                                      {sup.tradeName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {sup.slug || sup.tradeName.toLowerCase().replace(/\s+/g, '')} · NIT {sup.nit}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Columna Especialidad */}
                              <td className="py-4 px-4 text-xs">
                                <div className="font-bold text-gray-900">
                                  {sup.category}
                                </div>
                                <div className="text-gray-500 text-[11px]">
                                  Entrega {sup.leadTimeHours} h · {sup.city}
                                </div>
                              </td>

                              {/* Columna WhatsApp */}
                              <td className="py-4 px-4">
                                <a
                                  href={getWhatsAppUrl(sup.salesWhatsapp, sup.tradeName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-mono text-xs font-bold transition-colors shadow-2xs"
                                  title="Contactar por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                                  <span>{formatDisplayPhone(sup.salesWhatsapp)}</span>
                                </a>
                              </td>

                              {/* Columna Pedido Mínimo */}
                              <td className="py-4 px-4 text-xs">
                                <div className="font-bold text-gray-900 text-sm">
                                  {formatCop(sup.minOrderCop)}
                                </div>
                                <div className="text-gray-500 text-[11px]">
                                  Envío gratis desde {formatCop(sup.freeShippingThresholdCop)}
                                </div>
                              </td>

                              {/* Columna Insumos */}
                              <td className="py-4 px-4 text-xs font-bold text-gray-900">
                                {supProductsCount} {supProductsCount === 1 ? 'SKU' : 'SKUs'}
                              </td>

                              {/* Columna Estado */}
                              <td className="py-4 px-5">
                                {sup.canUploadProducts ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>Perfil habilitado</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={onOpenAdminPanel}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>Pendiente Central</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tarjetas Mobile (< md, como en la columna derecha del mockup) */}
                <div className="md:hidden space-y-3">
                  {suppliers.map((sup) => {
                    const supProductsCount = products.filter(
                      (p) => p.supplierId === sup.id
                    ).length;

                    return (
                      <div
                        key={sup.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3"
                      >
                        {/* Fila 1: Icono + Nombre + Badge Estado */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">
                                {sup.tradeName}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                {sup.slug || sup.tradeName.toLowerCase().replace(/\s+/g, '')} · NIT {sup.nit}
                              </div>
                            </div>
                          </div>

                          {sup.canUploadProducts ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold shrink-0">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Perfil habilitado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold shrink-0">
                              <Lock className="w-3 h-3" />
                              <span>Pendiente</span>
                            </span>
                          )}
                        </div>

                        {/* Fila 2: Especialidad (izq) y Pedido mínimo (der) */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                          <div>
                            <div className="font-bold text-gray-900 text-xs">
                              {sup.category}
                            </div>
                            <div className="text-gray-500 text-[11px]">
                              Entrega {sup.leadTimeHours} h · {sup.city}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-gray-400 font-semibold uppercase">
                              Pedido mínimo
                            </div>
                            <div className="font-bold text-gray-900 text-xs sm:text-sm">
                              {formatCop(sup.minOrderCop)}
                            </div>
                            <div className="text-gray-500 text-[10px]">
                              Envío gratis desde {formatCop(sup.freeShippingThresholdCop)}
                            </div>
                          </div>
                        </div>

                        {/* Fila 3: SKU (izq) y Botón WhatsApp (der) */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>{supProductsCount} {supProductsCount === 1 ? 'SKU' : 'SKUs'}</span>
                          </div>

                          <a
                            href={getWhatsAppUrl(sup.salesWhatsapp, sup.tradeName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-mono text-xs font-bold transition-colors shadow-2xs"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                            <span>{formatDisplayPhone(sup.salesWhatsapp)}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* 5. SUBTAB: CONTACTAR A RYYCO CENTRAL */}
        {activeSubTab === 'contact_ryyco' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('directory')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Directorio</span>
                </button>
                <h2 className="text-xl font-extrabold text-gray-950 font-display">
                  Postulación para ser Proveedor de Restaurantes RYYCO
                </h2>
                <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                  Envía tus datos comerciales. RYYCO Central se comunicará en un plazo máximo de 24 horas para revisar tu documentación y habilitar tu perfil de subida.
                </p>
              </div>
            </div>

            {applicationSubmitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-gray-900">
                  ¡Solicitud enviada a RYYCO Central!
                </h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Tu expediente ha quedado registrado en la mesa de control de SuperAdmin. Un asesor comercial se comunicará vía WhatsApp para activar tus permisos de catálogo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nombre comercial de tu marca o bodega *
                    </label>
                    <input
                      type="text"
                      required
                      value={appTradeName}
                      onChange={(e) => setAppTradeName(e.target.value)}
                      placeholder="Ej. Distribuidora Avícola San Juan"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      NIT Empresarial *
                    </label>
                    <input
                      type="text"
                      required
                      value={appNit}
                      onChange={(e) => setAppNit(e.target.value)}
                      placeholder="Ej. 901.442.119-8"
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Razón Social Completa
                    </label>
                    <input
                      type="text"
                      value={appBusinessName}
                      onChange={(e) => setAppBusinessName(e.target.value)}
                      placeholder="Ej. Avícola San Juan del Sur S.A.S."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Línea Principal de Suministros
                    </label>
                    <select
                      value={appCategory}
                      onChange={(e) => setAppCategory(e.target.value as SupplierCategory)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-[#E52243]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nombre de la persona de contacto *
                    </label>
                    <input
                      type="text"
                      required
                      value={appContactName}
                      onChange={(e) => setAppContactName(e.target.value)}
                      placeholder="Ej. Diana Patricia Gómez"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      WhatsApp Corporativo *
                    </label>
                    <input
                      type="text"
                      required
                      value={appContactWhatsapp}
                      onChange={(e) => setAppContactWhatsapp(e.target.value)}
                      placeholder="Ej. 315 789 2200"
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={appEmail}
                      onChange={(e) => setAppEmail(e.target.value)}
                      placeholder="Ej. ventas@avicolasanjuan.co"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ciudad / Municipio
                    </label>
                    <input
                      type="text"
                      value={appCity}
                      onChange={(e) => setAppCity(e.target.value)}
                      placeholder="Ej. Ipiales"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Dirección de tu bodega / CEDI
                  </label>
                  <input
                    type="text"
                    value={appAddress}
                    onChange={(e) => setAppAddress(e.target.value)}
                    placeholder="Ej. Carrera 5 #14-22 Zona Mayorista, Ipiales"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ¿Qué productos distribuyes y cuáles son tus condiciones?
                  </label>
                  <textarea
                    rows={3}
                    value={appMessage}
                    onChange={(e) => setAppMessage(e.target.value)}
                    placeholder="Describe tus principales insumos, cobertura en Ipiales/Nariño y si ofreces crédito a restaurantes..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('directory')}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E52243] hover:bg-[#D1132A] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud a RYYCO Central</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 6. SUBTAB: SUBIR INSUMO AL CATÁLOGO */}
        {activeSubTab === 'add_product' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('directory')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Directorio</span>
                </button>
                <h2 className="text-xl font-extrabold text-gray-950 font-display">
                  Publicar nuevo insumo en el catálogo mayorista
                </h2>
                <p className="text-xs text-gray-600">
                  Publica insumos vinculados a distribuidores verificados por RYYCO Central.
                </p>
              </div>
            </div>

            {/* Selector de proveedor emisor */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label htmlFor="select-supplier" className="text-xs font-bold text-gray-700 whitespace-nowrap">
                  Proveedor:
                </label>
                <select
                  id="select-supplier"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E52243]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tradeName} {s.canUploadProducts ? '(Habilitado)' : '(Pendiente de Central)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {canUpload ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Habilitado por RYYCO Central</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-lg">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Aprobación</span>
                  </span>
                )}
              </div>
            </div>

            {!canUpload ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
                <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-base font-bold text-gray-900">
                  El proveedor seleccionado aún no está habilitado para subir productos
                </h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Por seguridad de inocuidad y logística, todo proveedor debe ser verificado por RYYCO Central antes de publicar su catálogo.
                </p>
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="px-4 py-2 bg-[#E52243] hover:bg-[#D1132A] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Abrir panel RYYCO Central
                </button>
              </div>
            ) : (
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nombre comercial del insumo *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="Ej. Tocineta Ahumada Laminada Bloque x 2.5 kg"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:border-[#E52243]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as SupplierCategory)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Presentación comercial
                    </label>
                    <input
                      type="text"
                      required
                      value={presentationLabel}
                      onChange={(e) => setPresentationLabel(e.target.value)}
                      placeholder="Ej. Paquete al vacío x 2.5 kg"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Unidad de medida base
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={baseUnitQuantity}
                        onChange={(e) => setBaseUnitQuantity(Number(e.target.value))}
                        className="w-1/2 px-3 py-2 text-xs sm:text-sm font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-lg"
                      />
                      <select
                        value={baseUnit}
                        onChange={(e) => setBaseUnit(e.target.value as 'kg' | 'litro' | 'unidad')}
                        className="w-1/2 px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="litro">Litros (L)</option>
                        <option value="unidad">Unidades (uds)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Precio base por presentación (COP)
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={priceCop}
                      onChange={(e) => setPriceCop(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Stock inicial disponible *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('directory')}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E52243] hover:bg-[#D1132A] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar Insumo en el Catálogo</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
