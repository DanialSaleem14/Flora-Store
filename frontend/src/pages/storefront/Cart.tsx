import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../hooks/useCurrency';
import { EmptyState, Button } from '../../components/ui';

export default function Cart() {
  const { items, increaseQty, decreaseQty, removeItem, clearCart, subtotal, total } = useCart();
  const formatPrice = useCurrency();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Your cart is empty" subtitle="Browse products and add something you love." />
        <div className="mt-6 text-center">
          <Link to="/products" className="store-btn inline-block px-5 py-2.5 text-sm font-medium">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
              <img
                src={item.image || 'https://placehold.co/100x100'}
                alt={item.name}
                className="h-20 w-20 rounded-md object-cover"
              />
              <div className="flex-1">
                <Link to={`/products/${item.slug}`} className="font-medium">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-gray-300">
                    <button onClick={() => decreaseQty(item.productId)} className="px-2 py-1">
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => increaseQty(item.productId)} className="px-2 py-1">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-xs text-red-600 underline">
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-gray-500 underline">
            Empty cart
          </button>
        </div>

        <div className="h-fit rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link to="/checkout">
            <Button className="mt-4 w-full">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
