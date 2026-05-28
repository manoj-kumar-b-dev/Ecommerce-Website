import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronRight, Truck, ShieldCheck, RefreshCcw, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ProductCardSkeleton } from '../components/SkeletonLoaders';
import axiosInstance from '../utils/axiosInstance';

// Scroll reveal hook
const useScrollReveal = (dependencies = []) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Stop observing once revealed
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Give DOM a tick to update before querying elements
    const timeout = setTimeout(() => {
      const elements = ref.current?.querySelectorAll('.reveal-on-scroll');
      elements?.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, dependencies);

  return ref;
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useScrollReveal([featuredProducts, newArrivals, categories]);

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
    <div className="min-h-screen bg-white" ref={scrollRef}>
      <Helmet>
        <title>ShopFlow - Premium E-commerce Store</title>
        <meta name="description" content="Discover premium products with secure transactions. Shop the latest collections with free shipping and easy returns." />
        <meta property="og:title" content="ShopFlow - Premium E-commerce Store" />
        <meta property="og:description" content="Premium products, secure checkout, fast delivery." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.06] bg-[size:60px_60px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent-300" />
              <span className="text-sm font-semibold text-white">Summer Collection is Here</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold tracking-tight mb-6 animate-fade-in leading-[1.1]">
              Premium Quality,<br className="hidden sm:block" />
              <span className="text-gradient bg-gradient-to-r from-accent-300 via-white to-primary-200">Unbeatable Prices</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-100">
              Discover our curated collection of premium products with fast, free shipping and hassle-free 30-day returns.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in animation-delay-200">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-heading font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-200 transform hover:shadow-2xl shadow-lg text-base"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/shop?sort=featured"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/15 text-white font-heading font-semibold rounded-xl hover:bg-white/25 backdrop-blur-sm border border-white/25 transition-all duration-200 text-base"
              >
                Explore Featured
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </section>

      {/* Trust Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {/* Free Shipping */}
            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-success-50 group-hover:bg-success-100 transition-colors duration-300">
                  <Truck className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500 mt-0.5">On orders over ₹500</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-50 group-hover:bg-primary-100 transition-colors duration-300">
                  <ShieldCheck className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500 mt-0.5">100% encrypted & protected</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center gap-4 group">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-accent-50 group-hover:bg-accent-100 transition-colors duration-300">
                  <RefreshCcw className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-gray-900">Easy Returns</h3>
                <p className="text-sm text-gray-500 mt-0.5">30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4 reveal-on-scroll">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
                Shop by Category
              </h2>
              <p className="text-gray-500">Explore our wide range of product categories</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
            >
              View All
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, idx) => (
              <Link
                key={category._id}
                to={`/shop?category=${category._id}`}
                className="reveal-on-scroll group bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 transition-all">
                  <ShoppingBag className="h-5 w-5 text-primary-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {category.name}
                </h3>
                {category.productCount && (
                  <p className="text-xs text-gray-400 mt-1">{category.productCount} items</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="bg-gradient-to-b from-gray-50/50 via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4 reveal-on-scroll">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-500">Handpicked favorites curated just for you</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
            >
              View All
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {error ? (
            <div className="bg-danger-50 border border-danger-200 rounded-2xl p-6 text-danger-700 text-sm font-medium flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {loadingFeatured ? (
                [...Array(4)].map((_, idx) => <ProductCardSkeleton key={idx} />)
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product, idx) => (
                  <div key={product._id} className="reveal-on-scroll" style={{ transitionDelay: `${idx * 80}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No featured products available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4 reveal-on-scroll">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              New Arrivals
            </h2>
            <p className="text-gray-500">Fresh additions to our collection</p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="hidden sm:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
          >
            Shop All New
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loadingNew ? (
            [...Array(4)].map((_, idx) => <ProductCardSkeleton key={idx} />)
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product, idx) => (
              <div key={product._id} className="reveal-on-scroll" style={{ transitionDelay: `${idx * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No new products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="reveal-on-scroll relative bg-gradient-to-r from-accent-600 via-accent-500 to-secondary-500 rounded-3xl overflow-hidden shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-white/[0.06] bg-[size:50px_50px]" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative px-6 sm:px-8 md:px-12 py-12 md:py-16 lg:py-20 text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 leading-tight">
              Summer Sale — Up to 50% Off
            </h3>
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Limited time offer on selected items. Don't miss out on these incredible deals!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-accent-700 font-heading font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl text-base"
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