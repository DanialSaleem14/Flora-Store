import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Field, Input, Button, Card } from '../../components/ui';

interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  paymentMethod: 'card' | 'cod';
}

export default function Checkout() {
  const { items, subtotal, total, clearCart } = useCart();
  const formatPrice = useCurrency();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ defaultValues: { paymentMethod: 'card' } });

  const onSubmit = async () => {
    // NOTE: no payment gateway is wired up yet (Stripe/PayPal are future work).
    // This placeholder simulates order placement so the flow can be exercised end-to-end.
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Order placed! (Checkout is a placeholder — payments are not yet processed.)');
    clearCart();
    navigate('/');
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block underline">
          Go shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:col-span-2">
          <Card className="space-y-4">
            <h2 className="font-semibold">Shipping Details</h2>
            <Field label="Full Name">
              <Input {...register('fullName', { required: true })} />
              {errors.fullName && <span className="text-xs text-red-600">Required</span>}
            </Field>
            <Field label="Email">
              <Input type="email" {...register('email', { required: true })} />
              {errors.email && <span className="text-xs text-red-600">Required</span>}
            </Field>
            <Field label="Address">
              <Input {...register('address', { required: true })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <Input {...register('city', { required: true })} />
              </Field>
              <Field label="ZIP / Postal Code">
                <Input {...register('zip', { required: true })} />
              </Field>
            </div>
            <Field label="Country">
              <Input {...register('country', { required: true })} />
            </Field>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-semibold">Payment</h2>
            <p className="text-xs text-gray-500">
              Payment integration (Stripe / PayPal) is not yet connected — this is a placeholder for future work.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="card" {...register('paymentMethod')} defaultChecked /> Credit / Debit Card
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="cod" {...register('paymentMethod')} /> Cash on Delivery
            </label>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Placing order…' : 'Place Order'}
          </Button>
        </form>

        <Card className="h-fit space-y-3">
          <h2 className="font-semibold">Order Summary</h2>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
