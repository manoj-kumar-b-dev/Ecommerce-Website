import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Loader2 } from 'lucide-react';
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
    const nextState = await toggleWishlist(product._id);
    if (typeof nextState === 'boolean') {
      setIsWishlisted(nextState);
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
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.slug}`} className="block h-full">
          <img
            src={product.images?.[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.name || 'Product'}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x600?text=Product';
            }}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-danger-500 text-danger-500' : 'text-gray-400 hover:text-danger-500'}`} />
        </button>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-danger-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
            -{product.discountPercent}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add Button - Desktop */}
        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <button
              onClick={handleQuickAddToCart}
              disabled={isAdding}
              className={`w-full flex items-center justify-center gap-2 bg-white text-gray-900 text-xs font-semibold py-2.5 rounded-lg shadow-md transition-colors ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin text-primary-600" /> : <ShoppingBag className="h-4 w-4" />} 
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-1">
          <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider">
            {product.brand}
          </span>
          <Link to={`/product/${product.slug}`} className="block mt-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price and Rating */}
        <div className="mt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.comparePrice > product.price && (
                <span className="text-xs text-gray-400 line-through">₹{product.comparePrice}</span>
              )}
            </div>
            {product.avgRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">{renderStars(product.avgRating)}</div>
                <span className="text-xs text-gray-500">({product.numReviews})</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Add to Cart Button */}
        {product.stock > 0 && (
          <button
            onClick={handleQuickAddToCart}
            disabled={isAdding}
            className={`mt-3 w-full md:hidden flex items-center justify-center gap-2 bg-primary-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700'}`}
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} 
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
