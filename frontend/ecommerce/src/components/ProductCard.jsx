import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItemToCart, toggleWishlist } = useContext(CartContext);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    const nextState = await toggleWishlist(product._id);
    if (typeof nextState === 'boolean') {
      setIsWishlisted(nextState);
    }
  };

  const executeQuickAddToCart = async (e) => {
    e.preventDefault();
    await addItemToCart(product, 1);
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images?.[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.name || 'Product'}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src = 'https://placehold.co/600x600?text=Product';
            }}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* Dynamic Discount Indicator Tag */}
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded">
            -{product.discountPercent}%
          </span>
        )}

        {/* Add to Cart Hover Overlay Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/40 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
          <button
            onClick={executeQuickAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-xs font-semibold py-2 px-4 rounded-md shadow hover:bg-primary-dark transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
          </button>
        </div>
      </div>

      {/* Typography & Details Container */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
          {product.brand}
        </span>
        <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">{product.name}</h3>
        </Link>

        {/* Financial Info & Metrics */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">${product.price}</span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">${product.comparePrice}</span>
            )}
          </div>
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
              ★ <span>{product.avgRating}</span>
            </div>
          )}
        </div>

        {/* Responsive Mobile-Only Add to Cart Callout */}
        <button
          onClick={executeQuickAddToCart}
          className="mt-4 w-full md:hidden flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold py-2 rounded focus:outline-none"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
