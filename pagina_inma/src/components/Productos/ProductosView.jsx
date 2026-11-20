import React, { useState } from 'react';
import { 
  Shirt, 
  Search, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Share2,
  Tag,
  Wand2,
  Upload,
  X
} from 'lucide-react';
import { saveProduct, deleteProduct } from '../../services/storageService';

const FASHION_PRESET_IMAGES = [
  { label: 'Vestido Floral', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Blusa Seda Salvia', url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pantalón Culotte Beige', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Blazer Rosa', url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Falda Plisada', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Top Punto Marfil', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80' }
];

const compressImageFile = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
    };
  });
};

export const ProductosView = ({ products, showToast, openFormModal, isFormModalOpen, setFormModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [stockStatusFilter, setStockStatusFilter] = useState('Todos');
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeImageMap, setActiveImageMap] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Vestidos',
    costPrice: '',
    salePrice: '',
    lowStockThreshold: 3,
    active: true,
    description: '',
    image: FASHION_PRESET_IMAGES[0].url,
    images: [FASHION_PRESET_IMAGES[0].url],
    isOneSize: false,
    variants: [
      { size: 'XS', color: 'Estándar', stock: 0 },
      { size: 'S', color: 'Estándar', stock: 0 },
      { size: 'M', color: 'Estándar', stock: 0 },
      { size: 'L', color: 'Estándar', stock: 0 },
      { size: 'XL', color: 'Estándar', stock: 0 }
    ]
  });

  const categories = ['Todos', 'Vestidos', 'Blusas', 'Pantalones', 'Chaquetas', 'Faldas', 'Camisetas & Tops', 'Conjuntos', 'Accesorios', 'Otros'];
  const stockStatuses = [
    { label: 'Todos', value: 'Todos', dotColor: '#A69889' },
    { label: 'En Stock', value: 'EnStock', dotColor: '#2E7D32' },
    { label: 'Stock Bajo', value: 'Bajo', dotColor: '#C98A2C' },
    { label: 'Agotado', value: 'Agotado', dotColor: '#D9534F' }
  ];

  const handleOpenForm = (product = null) => {
    if (product) {
      const isOne = Boolean(product.isOneSize || (product.variants && product.variants.length === 1 && product.variants[0].size === 'Única'));
      const productImages = product.images && product.images.length > 0 ? product.images : [product.image || FASHION_PRESET_IMAGES[0].url];
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'Vestidos',
        costPrice: product.costPrice || '',
        salePrice: product.salePrice || '',
        lowStockThreshold: product.lowStockThreshold || 3,
        active: product.active !== undefined ? product.active : true,
        description: product.description || '',
        image: productImages[0] || FASHION_PRESET_IMAGES[0].url,
        images: productImages,
        isOneSize: isOne,
        variants: product.variants || (isOne ? [{ size: 'Única', color: 'Estándar', stock: 0 }] : [
          { size: 'XS', color: 'Estándar', stock: 0 },
          { size: 'S', color: 'Estándar', stock: 0 },
          { size: 'M', color: 'Estándar', stock: 0 },
          { size: 'L', color: 'Estándar', stock: 0 },
          { size: 'XL', color: 'Estándar', stock: 0 }
        ])
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `BL-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'Vestidos',
        costPrice: '',
        salePrice: '',
        lowStockThreshold: 3,
        active: true,
        description: '',
        image: FASHION_PRESET_IMAGES[0].url,
        images: [FASHION_PRESET_IMAGES[0].url],
        isOneSize: false,
        variants: [
          { size: 'XS', color: 'Estándar', stock: 0 },
          { size: 'S', color: 'Estándar', stock: 0 },
          { size: 'M', color: 'Estándar', stock: 0 },
          { size: 'L', color: 'Estándar', stock: 0 },
          { size: 'XL', color: 'Estándar', stock: 0 }
        ]
      });
    }
    setFormModalOpen(true);
  };

  const handleToggleOneSize = (isOne) => {
    if (isOne) {
      const existingStock = formData.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
      setFormData({
        ...formData,
        isOneSize: true,
        variants: [{ size: 'Única', color: 'Estándar', stock: existingStock }]
      });
    } else {
      setFormData({
        ...formData,
        isOneSize: false,
        variants: [
          { size: 'XS', color: 'Estándar', stock: 0 },
          { size: 'S', color: 'Estándar', stock: 0 },
          { size: 'M', color: 'Estándar', stock: 0 },
          { size: 'L', color: 'Estándar', stock: 0 },
          { size: 'XL', color: 'Estándar', stock: 0 }
        ]
      });
    }
  };

  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    showToast('Procesando fotos...', 'info');
    const newImages = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      const compressed = await compressImageFile(file);
      newImages.push(compressed);
    }

    if (newImages.length > 0) {
      setFormData(prev => {
        const currentList = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
        const combined = [...currentList, ...newImages].slice(0, 8);
        return {
          ...prev,
          images: combined,
          image: combined[0]
        };
      });
      showToast(`${newImages.length} imagen(es) añadida(s)`, 'success');
    }
  };

  const handleSetMainImage = (imgUrl) => {
    setFormData(prev => {
      const list = prev.images || [prev.image];
      const remaining = list.filter(img => img !== imgUrl);
      const updated = [imgUrl, ...remaining];
      return {
        ...prev,
        image: imgUrl,
        images: updated
      };
    });
  };

  const handleRemoveImage = (imgUrl) => {
    setFormData(prev => {
      const list = prev.images || [prev.image];
      const updated = list.filter(img => img !== imgUrl);
      const fallbackImg = updated[0] || FASHION_PRESET_IMAGES[0].url;
      return {
        ...prev,
        images: updated.length > 0 ? updated : [fallbackImg],
        image: fallbackImg
      };
    });
  };

  const handleVariantStockChange = (index, newStock) => {
    const updatedVariants = [...formData.variants];
    if (updatedVariants[index]) {
      updatedVariants[index].stock = Math.max(0, parseInt(newStock) || 0);
      setFormData({ ...formData, variants: updatedVariants });
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;

    if (!formData.name.trim()) {
      showToast('Introduce el nombre de la prenda', 'error');
      return;
    }

    if (sale <= 0) {
      showToast('El precio de venta debe ser mayor que 0€', 'error');
      return;
    }

    const payload = {
      ...formData,
      costPrice: cost,
      salePrice: sale,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 3
    };

    if (editingProduct) payload.id = editingProduct.id;

    saveProduct(payload);
    setFormModalOpen(false);
    showToast(editingProduct ? 'Producto actualizado' : 'Prenda añadida al catálogo', 'success');
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar ${name} del catálogo?`)) {
      deleteProduct(id);
      showToast('Producto eliminado', 'info');
    }
  };

  const handleToggleActive = (product) => {
    saveProduct({ ...product, active: !product.active });
    showToast(`Producto ${!product.active ? 'activado' : 'desactivado'}`, 'info');
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;

    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    let matchesStock = true;
    if (stockStatusFilter === 'Bajo') matchesStock = totalStock > 0 && totalStock <= p.lowStockThreshold;
    if (stockStatusFilter === 'Agotado') matchesStock = totalStock === 0;
    if (stockStatusFilter === 'EnStock') matchesStock = totalStock > p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Shirt size={26} color="var(--primary-900)" />
            <span>Catálogo e Inventario</span>
          </h1>
          <p>Gestiona los productos, precios y niveles de stock de tu boutique.</p>
        </div>

        <button className="btn btn-inverted" onClick={() => handleOpenForm()}>
          <Plus size={18} />
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* Filter Row: Search + Category Pills + Stock Status Pills */}
      <div className="pastel-card filter-row-section">
        {/* Search Bar */}
        <div className="stitch-search-bar" style={{ maxWidth: '300px' }}>
          <Search size={17} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="pills-scroll-wrapper">
          {categories.map(cat => (
            <button
              key={cat}
              className={`stitch-pill ${categoryFilter === cat ? 'stitch-pill-dark' : 'stitch-pill-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              <span className="dot-indicator" style={{ background: categoryFilter === cat ? '#FFFFFF' : 'var(--secondary-500)' }}></span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Stock Status Pills */}
        <div className="stock-status-pills">
          {stockStatuses.map(st => (
            <button
              key={st.value}
              className={`stitch-pill ${stockStatusFilter === st.value ? 'stitch-pill-primary' : 'stitch-pill-tertiary'}`}
              onClick={() => setStockStatusFilter(st.value)}
            >
              <span className="dot-indicator" style={{ background: st.dotColor }}></span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid (2-3 columns) */}
      <div className="products-grid-stitch" style={{ marginTop: '24px' }}>
        {filteredProducts.length === 0 ? (
          <div className="no-products-card pastel-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px' }}>
            <Shirt size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3>No se encontraron productos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '6px 0 16px 0' }}>
              Prueba a cambiar el filtro de búsqueda o añade tu primera prenda al catálogo.
            </p>
            <button className="btn btn-primary" onClick={() => handleOpenForm()}>
              <Plus size={18} />
              <span>Añadir Producto</span>
            </button>
          </div>
        ) : (
          filteredProducts.map((p, idx) => {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
            const profitMargin = p.salePrice - p.costPrice;
            const profitPercent = p.salePrice > 0 ? ((profitMargin / p.salePrice) * 100).toFixed(0) : 0;
            const isLowStock = totalStock > 0 && totalStock <= p.lowStockThreshold;
            const isOutOfStock = totalStock === 0;

            const currentImgList = p.images && p.images.length > 0 ? p.images : [p.image];
            const currentActiveImg = activeImageMap[p.id] || currentImgList[0];

            return (
              <div key={p.id} className={`product-stitch-card pastel-card stagger-item stagger-${(idx % 6) + 1} ${!p.active ? 'inactive-card' : ''}`}>
                <div className="card-top-layout">
                  {/* Thumbnail Image on Left */}
                  <div className="product-thumb-container">
                    <img src={currentActiveImg} alt={p.name} className="product-thumb-img" />
                  </div>

                  {/* Top Details */}
                  <div className="product-main-details">
                    <span className="category-small-label">{p.category.toUpperCase()}</span>
                    <h3 className="product-title-bold">{p.name}</h3>
                    <p className="sku-small-gray">Ref: {p.sku}</p>

                    {/* Stock Status Badge */}
                    <div style={{ marginTop: '6px' }}>
                      {isOutOfStock ? (
                        <span className="stitch-pill stitch-pill-primary">
                          <span className="dot-indicator" style={{ background: '#D9534F' }}></span>
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="stitch-pill stitch-pill-primary">
                          <span className="dot-indicator" style={{ background: '#C98A2C' }}></span>
                          Stock Bajo ({totalStock})
                        </span>
                      ) : (
                        <span className="stitch-pill stitch-pill-secondary">
                          <span className="dot-indicator" style={{ background: '#2E7D32' }}></span>
                          En Stock ({totalStock})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Numbers Row: Cost, PVP, Margin (€ and %) */}
                <div className="financial-three-row">
                  <div className="fin-col">
                    <span className="fin-label">Precio Coste</span>
                    <span className="fin-val">{p.costPrice.toFixed(2)}€</span>
                  </div>
                  <div className="fin-col">
                    <span className="fin-label">Precio Venta</span>
                    <span className="fin-val highlight">{p.salePrice.toFixed(2)}€</span>
                  </div>
                  <div className="fin-col">
                    <span className="fin-label">Margen</span>
                    <span className="fin-val profit">€{profitMargin.toFixed(2)} ({profitPercent}%)</span>
                  </div>
                </div>

                {/* MATRIZ DE STOCK Section */}
                <div className="stock-matrix-section">
                  <span className="matrix-title">MATRIZ DE STOCK</span>
                  <div className="matrix-grid-boxes">
                    {standardSizes.map(sz => {
                      const v = p.variants.find(varItem => varItem.size === sz);
                      const stockVal = v ? v.stock : '-';
                      const isZero = stockVal === 0;

                      return (
                        <div key={sz} className={`size-box-cell ${isZero ? 'out' : ''}`}>
                          <span className="sz-name">{sz}</span>
                          <span className="sz-count">{stockVal}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multicolor Circular Action Group */}
                <div className="card-footer-actions">
                  <div className="multicolor-action-group">
                    {/* 1. Wand/Edit (Maroon) */}
                    <button 
                      className="multicolor-btn bg-maroon"
                      onClick={() => handleOpenForm(p)}
                      title="Editar prenda"
                    >
                      <Wand2 size={15} />
                    </button>

                    {/* 2. Share/Duplicate (Olive) */}
                    <button 
                      className="multicolor-btn bg-olive"
                      onClick={() => handleToggleActive(p)}
                      title={p.active ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {p.active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    {/* 3. Tag (Blue) */}
                    <button 
                      className="multicolor-btn bg-blue"
                      onClick={() => showToast(`Referencia ${p.sku} copiada`, 'info')}
                      title="Copiar Referencia"
                    >
                      <Tag size={15} />
                    </button>

                    {/* 4. Delete (Red) */}
                    <button 
                      className="multicolor-btn bg-red"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      title="Eliminar producto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {(isFormModalOpen || editingProduct) && (
        <div className="modal-overlay" onClick={() => { setFormModalOpen(false); setEditingProduct(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Editar Prenda' : 'Añadir Nueva Prenda'}</h3>
              <button className="btn-icon-only" onClick={() => { setFormModalOpen(false); setEditingProduct(null); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                {/* Upload Image Gallery Section */}
                <div className="form-group image-upload-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Galería de Fotos de la Prenda ({formData.images?.length || 0} de 8 max)</label>
                  
                  {/* Thumbnails Grid for current product images */}
                  <div className="multi-images-preview-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {(formData.images || [formData.image]).map((imgUrl, idx) => (
                      <div key={idx} className={`multi-img-box ${formData.image === imgUrl ? 'is-main' : ''}`} style={{ position: 'relative', width: '72px', height: '72px' }}>
                        <img src={imgUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: formData.image === imgUrl ? '2px solid var(--primary-900)' : '1px solid var(--border-light)' }} />
                        {formData.image === imgUrl && (
                          <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'var(--primary-900)', color: '#fff', fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>PORTADA</span>
                        )}
                        <div style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', gap: '3px' }}>
                          {formData.image !== imgUrl && (
                            <button type="button" onClick={() => handleSetMainImage(imgUrl)} title="Marcar portada" style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>★</button>
                          )}
                          <button type="button" onClick={() => handleRemoveImage(imgUrl)} title="Eliminar foto" style={{ background: 'rgba(217, 83, 79, 0.85)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="upload-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <Upload size={16} />
                      <span>Subir Fotos de tu Dispositivo 📷</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>

                  {/* Preset images picker */}
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>O elige imágenes de modelo predefinidas:</p>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {FASHION_PRESET_IMAGES.map((preset, idx) => (
                        <img 
                          key={idx}
                          src={preset.url}
                          alt={preset.label}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: formData.image === preset.url ? '2px solid var(--primary-900)' : '1px solid var(--border-light)',
                            opacity: formData.image === preset.url ? 1 : 0.75
                          }}
                          onClick={() => {
                            const currentImgs = formData.images || [formData.image];
                            if (!currentImgs.includes(preset.url)) {
                              setFormData({ ...formData, image: preset.url, images: [preset.url, ...currentImgs] });
                            } else {
                              handleSetMainImage(preset.url);
                            }
                          }}
                          title={preset.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Producto / Prenda *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Milano Silk Blouse"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'Todos').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código SKU / Referencia</label>
                    <input 
                      type="text" 
                      placeholder="Ref: BL-2049"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Precio de Compra (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="21.60"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio de Venta PVP (€) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      placeholder="54.00"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Stock per Size inputs */}
                <div className="form-group">
                  <label className="form-label">Unidades en Stock por Talla</label>
                  <div className="variants-grid-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {formData.variants.map((v, i) => (
                      <div key={i} style={{ textAlign: 'center', background: 'var(--neutral-100)', padding: '8px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{v.size}</span>
                        <input 
                          type="number" 
                          min="0"
                          value={v.stock}
                          onChange={(e) => handleVariantStockChange(i, e.target.value)}
                          className="form-control"
                          style={{ padding: '4px', textAlign: 'center', marginTop: '4px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setFormModalOpen(false); setEditingProduct(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Guardar Cambios' : 'Añadir Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .filter-row-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pills-scroll-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          flex: 1;
        }

        .stock-status-pills {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
        }

        .products-grid-stitch {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .product-stitch-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-stitch-card.inactive-card {
          opacity: 0.65;
        }

        .card-top-layout {
          display: flex;
          gap: 14px;
        }

        .product-thumb-container {
          width: 90px;
          height: 105px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--neutral-100);
          flex-shrink: 0;
        }

        .product-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-main-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .category-small-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--primary-900);
          letter-spacing: 0.06em;
        }

        .product-title-bold {
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .sku-small-gray {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .financial-three-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.3fr;
          gap: 8px;
          padding: 10px 12px;
          background: var(--neutral-100);
          border-radius: var(--radius-sm);
        }

        .fin-col {
          display: flex;
          flex-direction: column;
        }

        .fin-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .fin-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .fin-val.highlight {
          font-weight: 800;
          color: var(--primary-900);
        }

        .fin-val.profit {
          font-weight: 800;
          color: #2E7D32;
          font-size: 0.8rem;
        }

        .stock-matrix-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .matrix-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }

        .matrix-grid-boxes {
          display: flex;
          gap: 6px;
        }

        .size-box-cell {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 2px;
          border-radius: 8px;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
        }

        .size-box-cell.out {
          background: var(--neutral-100);
          border-color: var(--neutral-200);
          opacity: 0.6;
        }

        .sz-name {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .sz-count {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--primary-900);
        }

        .card-footer-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
        }
      `}</style>
    </div>
  );
};
