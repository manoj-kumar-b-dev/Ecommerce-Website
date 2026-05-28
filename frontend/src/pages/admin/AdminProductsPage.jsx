import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Package, Search, Filter } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const INITIAL_FORM_STATE = {
  name: '', slug: '', description: '', price: '', comparePrice: '',
  category: '', stock: '', images: [], isFeatured: false, tags: '', brand: ''
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
  const [uploadingFiles, setUploadingFiles] = useState(false);

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

  useEffect(() => {
    fetchInventoryListing();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const uploadedUrls = [...formData.images];
    const failedFiles = [];

    try {
      for (const file of files) {
        try {
          const fData = new FormData();
          fData.append('file', file);

          const res = await axiosInstance.post('/api/admin/upload', fData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success && res.data.image_url) {
            uploadedUrls.push(res.data.image_url);
          } else {
            failedFiles.push(file.name);
          }
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err.response?.data || err.message);
          failedFiles.push(file.name);
        }
      }

      setFormData(prev => ({ ...prev, images: uploadedUrls }));

      if (failedFiles.length > 0) {
        alert(`Failed to upload ${failedFiles.length} file(s): ${failedFiles.join(', ')}`);
      } else if (uploadedUrls.length > 0) {
        alert(`Successfully uploaded ${files.length} image(s)`);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingFiles(false);
    }
  };

  const openCreateModeModal = () => {
    setEditTargetId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  const openEditModeModal = (product) => {
    setEditTargetId(product._id);
    setFormData({
      name: product.name, slug: product.slug, description: product.description,
      price: product.price, comparePrice: product.comparePrice || '',
      category: product.category?._id || product.category, stock: product.stock,
      images: product.images, isFeatured: product.isFeatured, tags: product.tags?.join(', ') || '',
      brand: product.brand || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmissionPipeline = async (e) => {
    e.preventDefault();

    if (!formData.images || formData.images.length === 0) {
      alert('Product must have at least one image. Please upload an image first.');
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
        alert('Product updated successfully!');
      } else {
        await axiosInstance.post('/api/admin/products', payload);
        alert('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchInventoryListing();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error processing request';
      alert(`Error: ${errorMsg}`);
      console.error('Form submission error:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {bulkCheckedIds.length > 0 && (
            <button
              onClick={executeBulkPurgeSequence}
              className="flex items-center gap-2 bg-danger-50 hover:bg-danger-100 text-danger-600 font-medium border border-danger-200 text-sm py-2 px-4 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({bulkCheckedIds.length})
            </button>
          )}
          <button
            onClick={openCreateModeModal}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={bulkCheckedIds.length === products.length && products.length > 0}
                    onChange={() => {
                      if (bulkCheckedIds.length === products.length) {
                        setBulkCheckedIds([]);
                      } else {
                        setBulkCheckedIds(products.map(p => p._id));
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={bulkCheckedIds.includes(prod._id)}
                        onChange={() => toggleBulkCheckboxElement(prod._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={prod.images?.[0] || 'https://placehold.co/48x48?text=Product'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{prod.name}</p>
                          <p className="text-xs text-gray-500">{prod.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">₹{prod.price}</span>
                      {prod.comparePrice > prod.price && (
                        <span className="block text-xs text-gray-500 line-through">₹{prod.comparePrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${prod.stock < 5 ? 'text-danger-600' : 'text-gray-900'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModeModal(prod)}
                          className="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => executeItemPurge(prod._id)}
                          className="p-2 text-gray-500 hover:text-danger-600 rounded-lg hover:bg-danger-50 transition-colors"
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

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
              {editTargetId ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleFormSubmissionPipeline} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="auto-generated-if-blank"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                    required
                    placeholder="Product description..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImagesUpload}
                      disabled={uploadingFiles}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload images
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </label>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            className="h-16 w-16 object-cover border border-gray-200 rounded-lg"
                            alt="Preview"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i)
                            }))}
                            className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingFiles || formData.images.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploadingFiles ? 'Uploading images...' : editTargetId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
