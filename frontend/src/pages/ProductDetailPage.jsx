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
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-danger-700 font-medium">{error}</p>
        <Link to="/shop" className="inline-block mt-4 text-primary-600 font-medium hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary-600">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={product.images?.[selectedImageIdx] || 'https://placehold.co/600x600?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-center object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIdx(index)}
                    className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIdx === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                {product.brand}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.avgRating > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.avgRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.avgRating} ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.comparePrice}
                  </span>
                  <span className="bg-danger-100 text-danger-700 text-xs font-bold px-2 py-1 rounded-full">
                    Save {product.discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">
                    In Stock - {product.stock} units available
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-danger-600">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description?.substring(0, 200)}
              {product.description?.length > 200 && '...'}
            </p>

            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className="space-y-4 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                      className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-gray-900 min-w-[40px] text-center">
                      {purchaseQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPurchaseQty(Math.min(product.stock, purchaseQty + 1))}
                      className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700 transform hover:scale-105'}`}
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                    {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-lg border transition-all ${isWishlisted
                      ? 'border-danger-200 bg-danger-50 text-danger-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:text-danger-600'
                      }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-danger-500' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-12">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-sm font-medium transition-all ${activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'description' && 'Product Description'}
                  {tab === 'reviews' && 'Customer Reviews'}
                  {tab === 'shipping' && 'Shipping & Returns'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {product.numReviews > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Customer reviews will be displayed here. ({product.numReviews} reviews)
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Standard free shipping on all orders over ₹500
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RefreshCcw className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">30-Day Returns</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Easy returns within 30 days of purchase
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Your payment information is protected
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
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