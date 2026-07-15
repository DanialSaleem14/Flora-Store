import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  startAfter,
  serverTimestamp,
  Timestamp,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  type DocumentSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Order, OrderItem, OrderStatus } from '../types';

const ORDERS = collection(db, 'orders');

const toOrder = (snap: DocumentSnapshot<DocumentData>): Order => {
  const data = snap.data();
  if (!data) throw new Error('Order not found');
  return {
    _id: snap.id,
    customerId: data.customerId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    items: data.items || [],
    subtotal: data.subtotal,
    total: data.total,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    status: data.status,
    createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()).toISOString(),
    deliveredAt: data.deliveredAt instanceof Timestamp ? data.deliveredAt.toDate().toISOString() : null,
  };
};

export interface PlaceOrderInput {
  items: { productId: string; quantity: number }[];
  shippingAddress: Order['shippingAddress'];
  paymentMethod: 'card' | 'cod';
}

// Note: this does not decrement product stock — that would require letting
// customers write to `products` from the client, which is a meaningfully
// bigger security-rules surface to get right safely. For now, stock stays a
// manually-managed field the admin adjusts from what they see come through
// in the Orders page.
//
// Prices are re-fetched from the live product docs here rather than trusted
// from the client's cart (which is plain localStorage the browser fully
// controls) — this closes both stale-price-after-a-price-change and
// straightforward "edit localStorage to submit a fake total" tampering.
// It's not a full server-side guarantee (there's no server), but it means an
// order always reflects the product's real price at the moment it was
// placed, not whatever the client claims.
let submitInFlight = false;

export const placeOrder = async (input: PlaceOrderInput) => {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to place an order');
  if (submitInFlight) throw new Error('Your order is already being placed — please wait.');
  if (!input.items.length) throw new Error('Your cart is empty');

  submitInFlight = true;
  try {
    const items: OrderItem[] = [];
    for (const line of input.items) {
      // eslint-disable-next-line no-await-in-loop
      const snap = await getDoc(doc(db, 'products', line.productId));
      if (!snap.exists() || snap.data().archived) {
        throw new Error(`One of the items in your cart is no longer available. Please remove it and try again.`);
      }
      const product = snap.data();
      if (product.stock < line.quantity) {
        throw new Error(`Only ${product.stock} left of "${product.name}" — please adjust the quantity in your cart.`);
      }
      const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
      items.push({ productId: line.productId, name: product.name, image: product.images?.[0] || '', price, quantity: line.quantity });
    }

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const payload = {
      customerId: user.uid,
      customerName: input.shippingAddress.fullName || user.displayName || 'Customer',
      customerEmail: user.email || '',
      items,
      subtotal,
      total: subtotal,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      status: 'pending' as OrderStatus,
      createdAt: serverTimestamp(),
      deliveredAt: null,
    };

    const ref = await addDoc(ORDERS, payload);
    const snap = await getDoc(ref);
    return { success: true, order: toOrder(snap) };
  } finally {
    submitInFlight = false;
  }
};

export const getMyOrders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const snap = await getDocs(query(ORDERS, where('customerId', '==', user.uid), orderBy('createdAt', 'desc')));
  return { success: true, orders: snap.docs.map(toOrder) };
};

export interface OrderPage {
  success: true;
  orders: Order[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const getOrders = async (opts: { status?: OrderStatus; limit?: number; cursor?: QueryDocumentSnapshot<DocumentData> | null } = {}): Promise<OrderPage> => {
  const pageSize = opts.limit || 15;
  const constraints: QueryConstraint[] = [];
  if (opts.status) constraints.push(where('status', '==', opts.status));
  constraints.push(orderBy('createdAt', 'desc'));
  if (opts.cursor) constraints.push(startAfter(opts.cursor));
  constraints.push(fbLimit(pageSize));

  const snap = await getDocs(query(ORDERS, ...constraints));
  const orders = snap.docs.map(toOrder);
  const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;
  return { success: true, orders, nextCursor, hasMore: !!nextCursor };
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const payload: Record<string, unknown> = { status };
  if (status === 'delivered') payload.deliveredAt = serverTimestamp();
  await updateDoc(doc(ORDERS, id), payload);
  const snap = await getDoc(doc(ORDERS, id));
  return { success: true, order: toOrder(snap) };
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const startOfWeek = () => {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday-start week
  d.setDate(d.getDate() - diff);
  return d;
};
const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const startOfYear = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
};

export interface OrderStats {
  revenue: number;
  currentOrders: number;
  outForDelivery: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  deliveredThisYear: number;
}

export const getOrderStats = async (): Promise<OrderStats> => {
  const deliveredQuery = query(ORDERS, where('status', '==', 'delivered'));

  const [revenueAgg, currentOrdersCount, outForDeliveryCount, weekCount, monthCount, yearCount] = await Promise.all([
    getAggregateFromServer(deliveredQuery, { revenue: sum('total') }),
    getCountFromServer(query(ORDERS, where('status', 'in', ['pending', 'processing']))),
    getCountFromServer(query(ORDERS, where('status', '==', 'out_for_delivery'))),
    getCountFromServer(query(ORDERS, where('status', '==', 'delivered'), where('deliveredAt', '>=', Timestamp.fromDate(startOfWeek())))),
    getCountFromServer(query(ORDERS, where('status', '==', 'delivered'), where('deliveredAt', '>=', Timestamp.fromDate(startOfMonth())))),
    getCountFromServer(query(ORDERS, where('status', '==', 'delivered'), where('deliveredAt', '>=', Timestamp.fromDate(startOfYear())))),
  ]);

  return {
    revenue: revenueAgg.data().revenue || 0,
    currentOrders: currentOrdersCount.data().count,
    outForDelivery: outForDeliveryCount.data().count,
    deliveredThisWeek: weekCount.data().count,
    deliveredThisMonth: monthCount.data().count,
    deliveredThisYear: yearCount.data().count,
  };
};

export const getRecentOrders = async (max = 8) => {
  const snap = await getDocs(query(ORDERS, orderBy('createdAt', 'desc'), fbLimit(max)));
  return snap.docs.map(toOrder);
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

export const getOrderStatusBreakdown = async (): Promise<Record<OrderStatus, number>> => {
  const counts = await Promise.all(ALL_STATUSES.map((status) => getCountFromServer(query(ORDERS, where('status', '==', status)))));
  return Object.fromEntries(ALL_STATUSES.map((status, i) => [status, counts[i].data().count])) as Record<OrderStatus, number>;
};

// Tallies quantities sold per product from actual order line items — real
// sales data instead of the featured-flag-based placeholder this replaced.
// Fine to pull a bounded recent batch client-side at this store's scale
// rather than maintaining a running aggregate.
export const getTopSellingProducts = async (max = 5, sampleSize = 200) => {
  const snap = await getDocs(query(ORDERS, orderBy('createdAt', 'desc'), fbLimit(sampleSize)));
  const totals = new Map<string, { name: string; quantity: number; revenue: number }>();

  snap.docs.forEach((d) => {
    const items: OrderItem[] = d.data().items || [];
    items.forEach((item) => {
      const existing = totals.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      totals.set(item.productId, existing);
    });
  });

  return Array.from(totals.entries())
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, max);
};
