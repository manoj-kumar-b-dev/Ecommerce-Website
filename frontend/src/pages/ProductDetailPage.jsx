import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck, Truck, RefreshCcw, Star, Share2, Minus, Plus, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoaders';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItemToCart, toggleWishlist } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullProductViewData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productRes = await axiosInstance.get(`/api/products/slug/${slug}`);
        const currentProduct = productRes.data.product;
        setProduct(currentProduct);
        setSelectedImageIdx(0);
        setPurchaseQty(1);

        // Fetch related products
        const relatedRes = await axiosInstance.get(`/api/products/related/${currentProduct._id}`);
        setRelated(relatedRes.data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchFullProductViewData();
  }, [slug]);

  const handleWishlistToggle = async () => {
    if (product) {
      const nextState = await toggleWishlist(product._id);
      if (typeof nextState === 'boolean') {
        setIsWishlisted(nextState);
      }
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      if (isAdding) return;
      setIsAdding(true);
      try {
        await addItemToCart(product, purchaseQty);
      } catch (err) {
        if (err.message === 'AUTH_REQUIRED') {
          setTimeout(() => navigate('/login'), 1500);
        }
      } finally {
        setIsAdding(false);
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-amber-400/50 text-amber-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white border border-danger-200 rounded-2xl p-8 max-w-md mx-auto text-center shadow-sm">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/shop" className="btn btn-primary w-full">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto hide-scrollbar pb-2">
          <Link to="/" className="hover:text-primary-600 whitespace-nowrap">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/shop" className="hover:text-primary-600 whitespace-nowrap">Shop</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-6 lg:p-10 mb-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
                <img
                  src={product.images?.[selectedImageIdx] || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-center object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-accent-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {product.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIdx(index)}
                      className={`h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl overflow-hidden transition-all ${selectedImageIdx === index
                        ? 'border-2 border-primary-600 ring-2 ring-primary-100 ring-offset-2 opacity-100'
                        : 'border border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'
                        }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                  {product.brand}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {product.avgRating > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      {renderStars(product.avgRating)}
                    </div>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      {product.avgRating.toFixed(1)} / 5
                    </span>
                    <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4">
                      {product.numReviews} Reviews
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">No reviews yet</span>
                )}
              </div>

              <div className="h-px bg-gray-100 w-full mb-6" />

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-heading font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.comparePrice > product.price && (
                  <span className="text-xl text-gray-400 line-through font-medium mb-1">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
                    </div>
                    <span className="text-sm font-semibold text-success-700">
                      In Stock ({product.stock} available)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-danger-50 text-danger-700 px-3 py-2 rounded-lg w-fit">
                    <span className="text-sm font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description Preview */}
              <p className="text-base text-gray-600 leading-relaxed mb-8">
                {product.description?.substring(0, 250)}
                {product.description?.length > 250 && '...'}
              </p>

              {/* Add to Cart Section */}
              {product.stock > 0 && (
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl bg-gray-50 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                        className="p-3 sm:p-4 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="px-6 text-lg font-bold text-gray-900 min-w-[60px] text-center bg-white h-full flex items-center justify-center border-x-2 border-gray-200">
                        {purchaseQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPurchaseQty(Math.min(product.stock, purchaseQty + 1))}
                        className="p-3 sm:p-4 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className={`flex-1 flex items-center justify-center gap-3 bg-primary-600 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-xl hover:shadow-primary-600/20 active:scale-95 ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700'}`}
                    >
                      {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShoppingBag className="h-6 w-6" />}
                      {isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={handleWishlistToggle}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center ${isWishlisted
                        ? 'border-danger-200 bg-danger-50 text-danger-600 shadow-inner'
                        : 'border-gray-200 bg-white text-gray-500 hover:text-danger-500 hover:border-danger-200'
                        }`}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-danger-500' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-95 shadow-md"
                  >
                    Buy It Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm mb-16 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <div className="flex w-max sm:w-full">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[150px] py-5 px-6 text-sm sm:text-base font-bold transition-all relative outline-none ${activeTab === tab
                    ? 'text-primary-600 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab === 'description' && 'Description'}
                  {tab === 'reviews' && 'Reviews'}
                  {tab === 'shipping' && 'Shipping'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-10">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-4xl">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base sm:text-lg">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl">
                {product.numReviews > 0 ? (
                  <div className="space-y-4">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map(review => (
                        <div key={review._id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-gray-900">{review.name}</div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <div className="text-sm text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-lg">
                        Customer reviews will be displayed here. ({product.numReviews} reviews)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500">Be the first to review this product and share your thoughts!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <div className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Free Shipping</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Standard free shipping on all orders over ₹500. Delivery typically takes 3-5 business days.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RefreshCcw className="h-6 w-6 text-accent-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">30-Day Returns</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Not satisfied? Return it within 30 days for a full refund or exchange. No questions asked.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Secure Payment</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your payment information is processed securely. We never store credit card details.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;