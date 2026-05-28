import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, RefreshCw, Filter, X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoaders';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Extract filter states from URL
  const activeCategory = searchParams.get('category') || '';
  const activeBrand = searchParams.get('brand') || '';
  const activeSort = searchParams.get('sort') || 'featured';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeRating = searchParams.get('rating') || '';
  const activeSearch = searchParams.get('search') || '';
  const activePage = searchParams.get('page') || '1';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get('/api/products/categories');
        setCategories(data.categories || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchShopProducts = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams(searchParams).toString();
        const { data } = await axiosInstance.get(`/api/products?${qs}`);
        setProducts(Array.isArray(data.products) ? data.products : []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error('[ShopPage] Error fetching products:', err.response?.data?.message || err.message);
        setProducts([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    };
    fetchShopProducts();
  }, [searchParams]);

  // Update filter parameters
  const updateFilterParam = (key, value) => {
    const current = new URLSearchParams(searchParams);
    current.set('page', '1');
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    setSearchParams(current);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [activeCategory, activeBrand, activeMinPrice, activeMaxPrice, activeRating].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Query Banner */}
        {activeSearch && (
          <div className="mb-6 bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Showing results for: <span className="font-semibold text-gray-900">"{activeSearch}"</span>
            </p>
          </div>
        )}

        {/* Control Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <span className="text-sm text-gray-500 hidden lg:inline">
              {pagination.totalProducts || 0} products found
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-block text-left">
            <select
              value={activeSort}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={activeCategory === cat._id}
                        onChange={() => updateFilterParam('category', activeCategory === cat._id ? '' : cat._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <span className="flex-1">{cat.name}</span>
                      {cat.productCount && (
                        <span className="text-xs text-gray-400">({cat.productCount})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={(e) => updateFilterParam('minPrice', e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={(e) => updateFilterParam('maxPrice', e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={activeRating === String(stars)}
                        onChange={() => updateFilterParam('rating', activeRating === String(stars) ? '' : String(stars))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <span className="text-amber-400">{'★'.repeat(stars)}</span>
                      <span className="text-amber-400">{'☆'.repeat(5 - stars)}</span>
                      <span className="text-xs text-gray-400">& Up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {showMobileSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
              <aside className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={activeCategory === cat._id}
                            onChange={() => updateFilterParam('category', activeCategory === cat._id ? '' : cat._id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                          />
                          <span className="flex-1">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={activeMinPrice}
                        onChange={(e) => updateFilterParam('minPrice', e.target.value)}
                        className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-gray-300">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={activeMaxPrice}
                        onChange={(e) => updateFilterParam('maxPrice', e.target.value)}
                        className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Rating</h3>
                    <div className="space-y-2">
                      {[4, 3, 2].map((stars) => (
                        <label key={stars} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={activeRating === String(stars)}
                            onChange={() => updateFilterParam('rating', activeRating === String(stars) ? '' : String(stars))}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                          />
                          <span className="text-amber-400">{'★'.repeat(stars)}</span>
                          <span className="text-amber-400">{'☆'.repeat(5 - stars)}</span>
                          <span className="text-xs text-gray-400">& Up</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="w-full py-2.5 text-center text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium mb-4">No products match your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateFilterParam('page', String(Math.max(1, Number(activePage) - 1)))}
                      disabled={Number(activePage) === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        // Show first, last, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          Math.abs(pageNum - Number(activePage)) <= 1
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => updateFilterParam('page', String(pageNum))}
                              className={`h-10 w-10 text-sm font-medium rounded-lg transition-colors ${Number(activePage) === pageNum
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => updateFilterParam('page', String(Math.min(pagination.totalPages, Number(activePage) + 1)))}
                      disabled={Number(activePage) === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
