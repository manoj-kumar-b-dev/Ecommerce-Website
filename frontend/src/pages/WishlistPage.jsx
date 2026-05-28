import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-100">
            <Heart className="h-10 w-10 text-gray-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 text-base mb-8 leading-relaxed">
            Save items to your wishlist to keep track of products you're interested in. Start exploring!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-primary-600/20"
          >
            Browse Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="p-3 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm"
              aria-label="Back to shopping"
              title="Back to shopping"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">My Wishlist</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <div 
              key={product._id} 
              className="group flex flex-col bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <Link to={`/product/${product.slug}`} className="absolute inset-0 z-0">
                  <img
                    src={product.images?.[0] || 'https://placehold.co/400x500?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x500?text=Product';
                    }}
                  />
                  {product.discountPercent > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-accent-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md">
                      {product.discountPercent}% OFF
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-400 hover:text-danger-500 hover:bg-white transition-all active:scale-90"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
                  {product.brand}
                </span>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
                  <Link to={`/product/${product.slug}`} className="hover:text-primary-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>

                <div className="mt-auto pt-4 flex flex-col gap-4">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.comparePrice > product.price && (
                      <span className="text-sm font-medium text-gray-400 line-through mb-1">
                        ₹{product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0 || addingProductId === product._id}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 text-white disabled:text-gray-400 font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {addingProductId === product._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
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