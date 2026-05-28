import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addItemToCart } = useContext(CartContext);

  const [addingProductId, setAddingProductId] = useState(null);

  const handleMoveToCart = async (product) => {
    if (addingProductId) return;
    setAddingProductId(product._id);
    try {
      await addItemToCart(product, 1);
      await toggleWishlist(product._id);
    } catch (err) {
      // Handled by context
    } finally {
      setAddingProductId(null);
    }
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart className="h-8 w-8 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">
            Save items to your wishlist to keep track of products you're interested in.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-600 mt-1">{wishlist.length} items saved</p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={product.images?.[0] || 'https://placehold.co/400x400?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x400?text=Product';
                    }}
                  />
                </Link>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-danger-500 hover:bg-gray-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">
                  {product.brand}
                </span>
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  <Link to={`/product/${product.slug}`} className="hover:text-primary-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>

                <div className="mt-auto pt-2">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.comparePrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.comparePrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0 || addingProductId === product._id}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white disabled:text-gray-500 text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    {addingProductId === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {addingProductId === product._id ? 'Moving...' : (product.stock > 0 ? 'Move to Cart' : 'Out of Stock')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;