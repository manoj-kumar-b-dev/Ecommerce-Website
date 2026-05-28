import { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartIcon = () => {
  const { cartCount, setIsDrawerOpen } = useContext(CartContext);

  return (
    <button 
      onClick={() => setIsDrawerOpen(true)} 
      className="relative p-2 text-gray-700 hover:text-primary transition-colors focus:outline-none"
    >
      <ShoppingCart className="h-6 w-6" />
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm">
          {cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;