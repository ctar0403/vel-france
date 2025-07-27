import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    brand: string;
    imageUrl: string;
    price: string;
  };
};

type Order = {
  id: string;
  orderCode: string;
  userId: string;
  total: string;
  status: string;
  paymentStatus: string;
  paymentId: string | null;
  shippingAddress: string;
  billingAddress: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
};

export default function OrderPage() {
  const [match, params] = useRoute("/order/:orderCode");
  const orderCode = params?.orderCode;

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['/api/orders/code', orderCode],
    enabled: !!orderCode,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!orderCode || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair text-navy mb-4">Invalid Order</h1>
          <p className="text-gray-600 mb-6">The order code you provided is invalid.</p>
          <Link href="/">
            <Button className="bg-gold hover:bg-gold/90 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair text-navy mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or hasn't been paid yet.</p>
          <Link href="/">
            <Button className="bg-gold hover:bg-gold/90 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddress = JSON.parse(order.shippingAddress);
  const billingAddress = JSON.parse(order.billingAddress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-navy hover:text-gold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-playfair text-navy mb-2">
                Order #{order.orderCode}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Badge className={getStatusColor(order.status)}>
                <Package className="h-3 w-3 mr-1" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                <CreditCard className="h-3 w-3 mr-1" />
                Payment {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-cream shadow-lg">
              <CardHeader>
                <CardTitle className="font-playfair text-navy">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-cream/30 rounded-lg">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-playfair font-semibold text-navy">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        by {item.product.brand}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </span>
                        <span className="font-semibold text-gold">
                          ₾{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-playfair font-semibold text-navy">
                    Total Amount
                  </span>
                  <span className="text-xl font-playfair font-bold text-gold">
                    ₾{parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping & Billing Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="bg-white/80 backdrop-blur-sm border-cream shadow-lg">
              <CardHeader>
                <CardTitle className="font-playfair text-navy flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                {shippingAddress.phone && (
                  <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-cream shadow-lg">
              <CardHeader>
                <CardTitle className="font-playfair text-navy flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold">Bank of Georgia</span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono text-xs">{order.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="bg-white/80 backdrop-blur-sm border-cream shadow-lg">
              <CardHeader>
                <CardTitle className="font-playfair text-navy flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-sm">Order Confirmed</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  {order.status === 'shipped' && (
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-sm">Shipped</p>
                        <p className="text-xs text-gray-600">In transit</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}