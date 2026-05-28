import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, RefreshCw, X, ShoppingBag } from 'lucide-react';
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

  // Lock scroll when mobile sidebar open
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [showMobileSidebar]);

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
        console.error('[ShopPage] Error fetching products:', err);
        setProducts([]);
        setPagination({});
      } finally {
        setLoading(false);
        // Scroll to top when page changes, but smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setShowMobileSidebar(false);
  };

  const activeFiltersCount = [activeCategory, activeBrand, activeMinPrice, activeMaxPrice, activeRating].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search Query Banner */}
        {activeSearch && (
          <div className="mb-6 bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm flex items-center justify-between animate-fade-in">
            <p className="text-gray-600">
              Showing results for: <span className="font-heading font-bold text-gray-900 text-lg">"{activeSearch}"</span>
            </p>
            <button
              onClick={() => updateFilterParam('search', '')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <span className="text-sm font-medium text-gray-500 hidden lg:inline">
              Showing <span className="text-gray-900">{products.length}</span> of <span className="text-gray-900">{pagination.totalProducts || 0}</span> products
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-block text-left w-full sm:w-auto">
            <select
              value={activeSort}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
              className="appearance-none w-full sm:w-auto bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm transition-colors"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4.5 w-4.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-8 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Categories</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={activeCategory === cat._id}
                          onChange={() => updateFilterParam('category', activeCategory === cat._id ? '' : cat._id)}
                          className="peer appearance-none h-5 w-5 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer hover:border-primary-400"
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="flex-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium select-none">{cat.name}</span>
                      {cat.productCount > 0 && (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                          {cat.productCount}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Price Range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={activeMinPrice}
                      onChange={(e) => updateFilterParam('minPrice', e.target.value)}
                      className="w-full text-sm pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-400 font-medium">-</span>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={activeMaxPrice}
                      onChange={(e) => updateFilterParam('maxPrice', e.target.value)}
                      className="w-full text-sm pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Customer Rating</h3>
                <div className="space-y-3">
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={activeRating === String(stars)}
                          onChange={() => updateFilterParam('rating', activeRating === String(stars) ? '' : String(stars))}
                          className="peer appearance-none h-5 w-5 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer hover:border-primary-400"
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex items-center gap-1 select-none">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < stars ? 'text-amber-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-500">& Up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar (Drawer) */}
          {showMobileSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in" onClick={() => setShowMobileSidebar(false)} />
              <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto animate-slide-in-left flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <h2 className="text-xl font-heading font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-8 flex-1">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Categories</h3>
                    <div className="space-y-4">
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer touch-target">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={activeCategory === cat._id}
                              onChange={() => updateFilterParam('category', activeCategory === cat._id ? '' : cat._id)}
                              className="peer appearance-none h-6 w-6 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="flex-1 text-base text-gray-700 font-medium select-none">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Price Range</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-full">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={activeMinPrice}
                          onChange={(e) => updateFilterParam('minPrice', e.target.value)}
                          className="w-full text-base pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                      <span className="text-gray-400 font-medium">-</span>
                      <div className="relative w-full">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={activeMaxPrice}
                          onChange={(e) => updateFilterParam('maxPrice', e.target.value)}
                          className="w-full text-base pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Customer Rating</h3>
                    <div className="space-y-4">
                      {[4, 3, 2].map((stars) => (
                        <label key={stars} className="flex items-center gap-3 cursor-pointer touch-target">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={activeRating === String(stars)}
                              onChange={() => updateFilterParam('rating', activeRating === String(stars) ? '' : String(stars))}
                              className="peer appearance-none h-6 w-6 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="flex items-center gap-1.5 select-none text-lg">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < stars ? 'text-amber-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-500 ml-1">& Up</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0 grid grid-cols-2 gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="py-3.5 text-center text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="py-3.5 text-center text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-md"
                  >
                    Show Results
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <ShoppingBag className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 font-medium mb-6 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, idx) => (
                    <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-14 mb-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateFilterParam('page', String(Math.max(1, Number(activePage) - 1)))}
                      disabled={Number(activePage) === 1}
                      className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Prev
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-1">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          Math.abs(pageNum - Number(activePage)) <= 1
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => updateFilterParam('page', String(pageNum))}
                              className={`h-11 w-11 flex items-center justify-center text-sm font-bold rounded-xl transition-all shadow-sm ${Number(activePage) === pageNum
                                  ? 'bg-primary-600 text-white border border-primary-600 shadow-primary-500/20'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === 2 && Number(activePage) > 3) ||
                          (pageNum === pagination.totalPages - 1 && Number(activePage) < pagination.totalPages - 2)
                        ) {
                          return <span key={pageNum} className="text-gray-400 font-bold px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => updateFilterParam('page', String(Math.min(pagination.totalPages, Number(activePage) + 1)))}
                      disabled={Number(activePage) === pagination.totalPages}
                      className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
