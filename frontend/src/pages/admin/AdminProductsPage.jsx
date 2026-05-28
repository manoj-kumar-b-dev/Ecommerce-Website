import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Package, Search, Filter, Camera, AlertCircle, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const INITIAL_FORM_STATE = {
  name: '', slug: '', description: '', price: '', comparePrice: '',
  category: '', stock: '', images: [], isFeatured: false, tags: '', brand: ''
};

// Client-side image compression for Android
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        // blob can be null on some browsers (memory pressure, canvas taint, etc.)
        resolve(blob || file);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', quality);
    };
    img.onerror = () => {
      resolve(file); // Fallback to original if reading fails
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkCheckedIds, setBulkCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  
  // File upload state
  const fileInputRef = useRef(null);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
    fetchInventoryListing();
    fetchCategories();
  }, []);

  const fetchInventoryListing = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/products?limit=100');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/products/categories');
      const fetchedCategories = data.categories || [];
      setCategories(fetchedCategories);
      setFormData(prev => prev.category ? prev : { ...prev, category: fetchedCategories[0]?._id || '' });
    } catch (err) {
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Note: triggerFileInput is no longer used — the label wrapping pattern
  // handles the click natively and works correctly on Android.
  // Keeping the ref in case it is needed for future reset logic.
  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Upload error toast state ──────────────────────────────────────────────
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // Client-side validation before sending to the server.
  // Catches wrong file types and oversized files immediately on Android
  // without a round-trip to the backend.
  const validateFile = useCallback((file) => {
    const ALLOWED_TYPES = new Set([
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/gif', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff'
    ]);
    const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff?)$/i;
    const MAX_SIZE_MB = 15;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // MIME type check (primary)
    const isValidMime = ALLOWED_TYPES.has(file.type?.toLowerCase());
    // Extension fallback — Samsung Internet / Android WebView sometimes sends
    // 'application/octet-stream' for images, so check the filename extension too.
    const isValidExt = IMAGE_EXT_RE.test(file.name);

    if (!isValidMime && !isValidExt) {
      return `"${file.name}" is not a supported image format. Please use JPG, PNG, WebP, or HEIC.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`;
    }
    return null; // valid
  }, []);

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Clear input so the same file can be re-selected later
    resetFileInput();
    setUploadErrorMsg('');

    // Validate all files before starting any uploads
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadErrorMsg(validationError);
        return; // Stop — don't process any file if one is invalid
      }
    }

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      localUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'compressing' // compressing, uploading, error
    }));

    setPendingUploads(prev => [...prev, ...newUploads]);

    for (const uploadItem of newUploads) {
      try {
        // Compress Image (Critical for Android)
        const compressedBlob = await compressImage(uploadItem.file);
        
        setPendingUploads(prev => prev.map(p => 
          p.id === uploadItem.id ? { ...p, status: 'uploading', progress: 10 } : p
        ));

        // Use FormData
        const fData = new FormData();
        // If blob was returned (compressed), rename to .jpg to match JPEG content.
        // If original File was returned as fallback, keep its original name/extension.
        const isCompressedBlob = compressedBlob !== uploadItem.file;
        const safeFileName = isCompressedBlob
          ? uploadItem.file.name.replace(/\.[^.]+$/, '.jpg')
          : uploadItem.file.name;
        fData.append('file', compressedBlob, safeFileName);

        // DO NOT set Content-Type header manually! Let the browser set the boundary
        const res = await axiosInstance.post('/api/admin/upload', fData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPendingUploads(prev => prev.map(p => 
              p.id === uploadItem.id ? { ...p, progress: percentCompleted } : p
            ));
          }
        });

        if (res.data.success && res.data.image_url) {
          setFormData(prev => ({ ...prev, images: [...prev.images, res.data.image_url] }));
          setPendingUploads(prev => prev.filter(p => p.id !== uploadItem.id));
        } else {
          throw new Error('Upload failed on server');
        }
      } catch (err) {
        console.error(`[UPLOAD] Error uploading ${uploadItem.file.name}:`, err);
        // Extract a meaningful message from the Axios error response
        const serverMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
        setPendingUploads(prev => prev.map(p =>
          p.id === uploadItem.id ? { ...p, status: 'error', errorMsg: serverMessage } : p
        ));
      }
    }
  };

  const removePendingUpload = (id) => {
    setPendingUploads(prev => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.localUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  // Retry a single failed upload by re-triggering the upload pipeline for that item
  const retryFailedUpload = async (uploadItem) => {
    setPendingUploads(prev => prev.map(p =>
      p.id === uploadItem.id ? { ...p, status: 'compressing', progress: 0, errorMsg: undefined } : p
    ));
    setUploadErrorMsg('');
    try {
      const compressedBlob = await compressImage(uploadItem.file);
      setPendingUploads(prev => prev.map(p =>
        p.id === uploadItem.id ? { ...p, status: 'uploading', progress: 10 } : p
      ));
      const fData = new FormData();
      const isCompressedBlob = compressedBlob !== uploadItem.file;
      const safeFileName = isCompressedBlob
        ? uploadItem.file.name.replace(/\.[^.]+$/, '.jpg')
        : uploadItem.file.name;
      fData.append('file', compressedBlob, safeFileName);
      const res = await axiosInstance.post('/api/admin/upload', fData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setPendingUploads(prev => prev.map(p =>
            p.id === uploadItem.id ? { ...p, progress: pct } : p
          ));
        }
      });
      if (res.data.success && res.data.image_url) {
        setFormData(prev => ({ ...prev, images: [...prev.images, res.data.image_url] }));
        setPendingUploads(prev => prev.filter(p => p.id !== uploadItem.id));
      } else {
        throw new Error('Upload failed on server');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setPendingUploads(prev => prev.map(p =>
        p.id === uploadItem.id ? { ...p, status: 'error', errorMsg: serverMessage } : p
      ));
    }
  };

  const openCreateModeModal = () => {
    setEditTargetId(null);
    setFormData(INITIAL_FORM_STATE);
    setPendingUploads([]);
    setUploadErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModeModal = (product) => {
    setEditTargetId(product._id);
    setFormData({
      name: product.name, slug: product.slug, description: product.description,
      price: product.price, comparePrice: product.comparePrice || '',
      category: product.category?._id || product.category, stock: product.stock,
      images: product.images || [], isFeatured: product.isFeatured, tags: product.tags?.join(', ') || '',
      brand: product.brand || ''
    });
    setPendingUploads([]);
    setUploadErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmissionPipeline = async (e) => {
    e.preventDefault();

    if ((!formData.images || formData.images.length === 0) && pendingUploads.length === 0) {
      alert('Product must have at least one image. Please upload an image first.');
      return;
    }

    const isUploading = pendingUploads.some(p => p.status === 'uploading' || p.status === 'compressing');
    if (isUploading) {
      alert('Please wait for all images to finish uploading.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      comparePrice: Number(formData.comparePrice) || 0,
      stock: Number(formData.stock),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    try {
      if (editTargetId) {
        await axiosInstance.put(`/api/admin/products?id=${editTargetId}`, payload);
      } else {
        await axiosInstance.post('/api/admin/products', payload);
      }
      setIsModalOpen(false);
      fetchInventoryListing();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error processing request';
      alert(`Error: ${errorMsg}`);
    }
  };

  const executeItemPurge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axiosInstance.delete(`/api/admin/products?id=${id}`);
      fetchInventoryListing();
    } catch (err) {
      console.error(err);
    }
  };

  const executeBulkPurgeSequence = async () => {
    if (!window.confirm(`Delete ${bulkCheckedIds.length} selected products?`)) return;
    try {
      await axiosInstance.delete('/api/admin/products', { data: { bulkIds: bulkCheckedIds } });
      setBulkCheckedIds([]);
      fetchInventoryListing();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBulkCheckboxElement = (id) => {
    setBulkCheckedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 relative pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory and catalogs</p>
        </div>
        <div className="flex items-center gap-3">
          {bulkCheckedIds.length > 0 && (
            <button
              onClick={executeBulkPurgeSequence}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium border border-red-200 text-sm py-2 px-4 rounded-xl transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete ({bulkCheckedIds.length})</span>
            </button>
          )}
          <button
            onClick={openCreateModeModal}
            className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile */}
      <button
        onClick={openCreateModeModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center z-20 active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border-none bg-transparent focus:ring-0 text-gray-900 placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="w-px h-6 bg-gray-200"></div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-colors">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Products Table / Mobile Cards */}
      <div className="bg-white border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden -mx-4 md:mx-0">
        <div className="overflow-x-auto p-4 md:p-0">
          <table className="w-full admin-mobile-card-table text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 w-12 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    checked={bulkCheckedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={() => {
                      if (bulkCheckedIds.length === filteredProducts.length) setBulkCheckedIds([]);
                      else setBulkCheckedIds(filteredProducts.map(p => p._id));
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Price</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Stock</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <Package className="h-10 w-10 text-gray-300" />
                      <span className="text-sm">No products found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 md:w-12 hidden md:table-cell">
                      <input
                        type="checkbox"
                        checked={bulkCheckedIds.includes(prod._id)}
                        onChange={() => toggleBulkCheckboxElement(prod._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Product">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-12 md:h-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                          <img
                            src={prod.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{prod.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{prod.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Price">
                      <div className="text-right md:text-left">
                        <span className="font-semibold text-gray-900">₹{prod.price}</span>
                        {prod.comparePrice > prod.price && (
                          <span className="block text-xs text-gray-400 line-through">₹{prod.comparePrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Stock">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${prod.stock < 5 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right" data-label="Actions">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModeModal(prod)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => executeItemPurge(prod._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Product Form Modal (Drawer on Mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex md:items-center justify-center md:p-4 animate-backdrop-in">
          <div className="bg-white md:rounded-2xl w-full min-h-[100dvh] md:min-h-0 md:max-w-2xl md:max-h-[90vh] flex flex-col shadow-2xl relative animate-slide-in-up md:animate-scale-in">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10 md:rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editTargetId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Fill in the product details below</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors touch-target flex-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <form id="productForm" onSubmit={handleFormSubmissionPipeline} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="admin-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="admin-input"
                      required
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand || ''}
                      onChange={handleInputChange}
                      className="admin-input"
                      required
                      placeholder="e.g. Sony"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Category</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="admin-input appearance-none pr-10"
                      >
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="admin-input font-medium text-gray-900"
                      required
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Compare at Price (₹)</label>
                    <input
                      type="number"
                      name="comparePrice"
                      value={formData.comparePrice}
                      onChange={handleInputChange}
                      className="admin-input text-gray-500"
                      placeholder="Optional"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="admin-input"
                      required
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Custom Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="admin-input font-mono text-sm"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="admin-label">Description *</label>
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="admin-input resize-none"
                      required
                      placeholder="Detailed product description..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="admin-label">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="admin-input"
                      placeholder="comma, separated, tags"
                    />
                  </div>

                  {/* IMAGE UPLOAD SECTION — label-wrap pattern works on Android & iOS */}
                  <div className="sm:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="admin-label !mb-0 text-gray-900">Product Images</span>
                      <span className="text-xs text-gray-500 font-medium">{formData.images.length}/5 Images</span>
                    </div>

                    {/*
                      Android fix:
                      - NO capture="environment" — that attribute forces camera-only on Android,
                        blocking the gallery/file picker entirely.
                      - The <input> is wrapped inside a <label> so a tap anywhere on the
                        styled area natively opens the system file chooser without needing
                        a programmatic .click() call (which Android WebView can block).
                      - The input itself is visually hidden but NOT display:none or
                        position:absolute with z-0-behind-button — both patterns
                        can break on Android Chrome and Samsung Internet.
                    */}
                    <label
                      htmlFor="productImageInput"
                      className={`w-full flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none ${
                        isMobile
                          ? 'bg-white border-primary-300 active:border-primary-500 shadow-sm min-h-[140px]'
                          : 'bg-white border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3 pointer-events-none">
                        {isMobile ? <Camera className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1 pointer-events-none">
                        {isMobile ? 'Tap to Choose Photo' : 'Click or Drag & Drop'}
                      </p>
                      <p className="text-xs text-gray-500 pointer-events-none">
                        JPG, PNG, WebP, HEIC · Up to 15 MB
                      </p>
                      {/* Input is inside the label — native label-click association, no JS needed */}
                      <input
                        id="productImageInput"
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagesUpload}
                        className="sr-only"
                      />
                    </label>

                    {/* Upload validation error banner */}
                    {uploadErrorMsg && (
                      <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-red-700">Upload Error</p>
                          <p className="text-xs text-red-600 mt-0.5">{uploadErrorMsg}</p>
                        </div>
                        <button type="button" onClick={() => setUploadErrorMsg('')} className="flex-shrink-0 text-red-400 hover:text-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Upload Previews */}
                    {(formData.images.length > 0 || pendingUploads.length > 0) && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Existing Completed Images */}
                        {formData.images.map((url, i) => (
                          <div key={`existing-${i}`} className="relative group aspect-square rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                            <img src={url} className="w-full h-full object-cover" alt="Product" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, idx) => idx !== i)
                                }))}
                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Pending/Uploading Images */}
                        {pendingUploads.map((upload) => (
                          <div key={upload.id} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm flex flex-col items-center justify-center p-2 text-center">
                            {upload.status === 'error' ? (
                              <>
                                <AlertCircle className="h-5 w-5 text-red-500 mb-1 flex-shrink-0" />
                                <span className="text-[9px] font-semibold text-red-600 leading-tight line-clamp-2 px-1">
                                  {upload.errorMsg || 'Upload failed'}
                                </span>
                                <div className="flex gap-1 mt-1.5">
                                  {/* Retry button */}
                                  <button
                                    type="button"
                                    onClick={() => retryFailedUpload(upload)}
                                    title="Retry upload"
                                    className="p-1 bg-primary-50 border border-primary-200 rounded-full text-primary-600 hover:bg-primary-100"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </button>
                                  {/* Dismiss button */}
                                  <button
                                    type="button"
                                    onClick={() => removePendingUpload(upload.id)}
                                    title="Dismiss"
                                    className="p-1 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="absolute inset-0 opacity-40">
                                  <img src={upload.localUrl} className="w-full h-full object-cover blur-sm" alt="Preview" />
                                </div>
                                <div className="relative z-10 w-full px-3">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                                    <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${upload.progress}%` }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                                    {upload.status === 'compressing' ? 'Compressing…' : `${upload.progress}%`}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Featured Product</p>
                        <p className="text-xs text-gray-500">Show this product prominently on the storefront</p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer Actions */}
            <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50 md:rounded-b-2xl flex items-center justify-end gap-3 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={pendingUploads.some(p => p.status === 'uploading' || p.status === 'compressing')}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-xl hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {editTargetId ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
