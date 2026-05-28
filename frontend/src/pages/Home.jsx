import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronRight, Truck, ShieldCheck, RefreshCcw, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ProductCardSkeleton } from '../components/SkeletonLoaders';
import axiosInstance from '../utils/axiosInstance';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true);
        setError(null);
        const { data } = await axiosInstance.get('/api/products/featured');

        if (Array.isArray(data.products) && data.products.length > 0) {
          setFeaturedProducts(data.products);
        } else {
          // Fallback: fetch regular products if no featured ones exist
          const fallback = await axiosInstance.get('/api/products?limit=8');
          setFeaturedProducts(Array.isArray(fallback.data.products) ? fallback.data.products : []);
        }
      } catch (err) {
        console.error('[Home] Error fetching featured products:', err);
        setError(err.response?.data?.message || 'Failed to load products. Is the backend running?');
        setFeaturedProducts([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch new arrivals
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoadingNew(true);
        const { data } = await axiosInstance.get('/api/products?limit=8&sort=newest');
        setNewArrivals(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error('[Home] Error fetching new arrivals:', err);
        setNewArrivals([]);
      } finally {
        setLoadingNew(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await axiosInstance.get('/api/products/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('[Home] Error fetching categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>ShopFlow - Premium E-commerce Store</title>
        <meta name="description" content="Discover premium products with secure transactions. Shop the latest collections with free shipping and easy returns." />
        <meta property="og:title" content="ShopFlow - Premium E-commerce Store" />
        <meta property="og:description" content="Premium products, secure checkout, fast delivery." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Premium Quality, Unbeatable Prices
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover our curated collection of high-quality products. From electronics to fashion,
              we've got everything you need with free shipping and 30-day returns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/shop?sort=featured"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary-500/30 text-white font-semibold rounded-lg hover:bg-primary-500/40 transition-all"
              >
                Featured Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over ₹500</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCcw className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-sm text-gray-600 mt-1">Browse our popular categories</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/shop?category=${category._id}`}
                className="group bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                {category.productCount && (
                  <p className="text-xs text-gray-500 mt-1">{category.productCount} items</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-600 mt-1">Handpicked favorites just for you</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {error ? (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-700 text-sm font-medium">
            ⚠️ {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loadingFeatured ? (
              [...Array(4)].map((_, idx) => <ProductCardSkeleton key={idx} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No featured products available yet</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-sm text-gray-600 mt-1">Latest additions to our collection</p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingNew ? (
            [...Array(4)].map((_, idx) => <ProductCardSkeleton key={idx} />)
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No new products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
          <div className="relative p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Summer Sale - Up to 50% Off
            </h3>
            <p className="text-secondary-100 mb-6 max-w-2xl mx-auto">
              Limited time offer on selected items. Don't miss out on these incredible deals!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-secondary-700 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Shop the Sale
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;