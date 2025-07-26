import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Order, CartItem } from "@shared/schema";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard,
  Truck,
  CheckCircle,
  Clock
} from "lucide-react";

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuth();

  // Fetch cart items for header
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Fetch specific order details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Please log in to view order details</h1>
          <Link href="/auth">
            <Button className="bg-gold hover:bg-deep-gold text-navy">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={() => {}}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/profile">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-navy font-roboto">Loading order details...</div>
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-navy mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link href="/profile">
                <Button className="bg-gold hover:bg-deep-gold text-navy">
                  Back to Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-navy">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-gray-600 flex items-center mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(order.createdAt!).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gold">€{order.total}</p>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 mt-2`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 whitespace-pre-line">
                      {order.shippingAddress}
                    </p>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-semibold text-gold">€{order.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {order.paymentStatus || 'pending'}
                        </Badge>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="capitalize">{order.paymentMethod}</span>
                        </div>
                      )}
                      {order.paymentId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment ID:</span>
                          <span className="font-mono text-sm">{order.paymentId.slice(0, 16)}...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Order Placed</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? (
                      <div className="flex items-center space-x-3 text-blue-600">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Confirmed</p>
                          <p className="text-sm text-gray-600">Your order has been confirmed</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-gray-400">
                        <Clock className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Confirmed</p>
                          <p className="text-sm text-gray-600">Pending confirmation</p>
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'shipped' || order.status === 'delivered' ? (
                      <div className="flex items-center space-x-3 text-purple-600">
                        <Truck className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Shipped</p>
                          <p className="text-sm text-gray-600">Your order is on its way</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-gray-400">
                        <Truck className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Shipped</p>
                          <p className="text-sm text-gray-600">Not yet shipped</p>
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'delivered' ? (
                      <div className="flex items-center space-x-3 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Delivered</p>
                          <p className="text-sm text-gray-600">Successfully delivered</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-gray-400">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Order Delivered</p>
                          <p className="text-sm text-gray-600">Not yet delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-lg font-semibold text-navy">Total</span>
                      <span className="text-2xl font-bold text-gold">€{order.total}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Order placed on {new Date(order.createdAt!).toLocaleDateString()}</p>
                      <p>Order ID: {order.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}