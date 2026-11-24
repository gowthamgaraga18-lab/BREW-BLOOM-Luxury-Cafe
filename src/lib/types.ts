export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  price: number;
  description: string;
  image: string;
  gallery?: string[] | null;
  available: boolean;
  vegetarian: boolean;
  featured: boolean;
  rating: number;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  address?: string | null;
  instructions?: string | null;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMode: string;
  items: OrderItem[];
  createdAt: string;
};

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string | null;
  status: string;
  createdAt: string;
};

export type DiscountResult = {
  valid: boolean;
  discount: number;
  code: string;
  message?: string;
};
