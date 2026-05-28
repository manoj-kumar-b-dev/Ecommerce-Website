import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Loader2, TrendingUp } from 'lucide-react';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItemToCart, toggleWishlist } = useContext(CartContext);
  const navigate = useNavigate();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);
    
    const nextState = await toggleWishlist(product._id);
    
    if (typeof nextState === 'boolean') {
      setIsWishlisted(nextState);
    } else {
      // Revert if failed or unauthorized
      setIsWishlisted(previousState);
    }
  };

  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addItemToCart(product, 1);
    } catch (error) {
      if (error.message === 'AUTH_REQUIRED') {
        setTimeout(() => navigate('/login'), 1500);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block h-full">
      <div className="relative bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
        {/* Product Image Wrapper */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.images?.[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.name || 'Product'}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x600?text=Product';
            }}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discountPercent > 0 && (
              <div className="bg-accent-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {product.discountPercent}% OFF
              </div>
            )}
            {product.isNew && (
              <div className="bg-primary-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-lg">
                NEW
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4.5 w-4.5 transition-all duration-300 ${isWishlisted ? 'fill-danger-500 text-danger-500' : 'text-gray-400 group-hover:text-danger-400'}`} />
          </button>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                Out of Stock
              </div>
            </div>
          )}

          {/* Quick Add Button - Desktop */}
          {product.stock > 0 && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
              <button
                onClick={handleQuickAddToCart}
                disabled={isAdding}
                className={`w-full flex items-center justify-center gap-2 bg-white text-gray-900 text-xs font-bold py-3 px-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin text-primary-600" /> : <ShoppingBag className="h-4 w-4" />} 
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
              {product.brand || 'Brand'}
            </span>
            {product.avgRating > 0 && (
              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.avgRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-heading font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 mb-2">
            {product.name}
          </h3>

          {/* Rating (optional) */}
          {product.avgRating > 0 && product.numReviews > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {renderStars(product.avgRating)}
              </div>
              <span className="text-xs text-gray-500">
                ({product.numReviews})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-3 mt-auto">
            <span className="text-lg font-heading font-bold text-gray-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through font-medium">
                ₹{product.comparePrice?.toLocaleString('en-IN')}
              </span>
            )}
            {product.comparePrice > product.price && (
              <span className="text-[11px] font-bold text-success-700 bg-success-50 px-2 py-0.5 rounded-lg">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          {product.stock > 0 && product.stock < 5 && (
            <div className="text-xs text-danger-600 font-bold mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse" />
              Only {product.stock} left
            </div>
          )}

          {/* Mobile Add to Cart Button */}
          {product.stock > 0 && (
            <button
              onClick={handleQuickAddToCart}
              disabled={isAdding}
              className={`sm:hidden w-full flex items-center justify-center gap-2 bg-primary-600 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 transform active:scale-95 ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700'}`}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} 
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
