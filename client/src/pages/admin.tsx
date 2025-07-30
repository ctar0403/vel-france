import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product, InsertProduct } from "@shared/schema";
import { Plus, Edit, Trash2, Package, Search, Upload, X, ArrowUpDown, ShoppingCart, Calendar, DollarSign, User, Mail, MapPin, CreditCard, Eye, Phone, Loader2 } from "lucide-react";

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
}

function OrderDetailsDialog({ isOpen, onOpenChange, order }: OrderDetailsDialogProps) {
  if (!order) return null;

  const orderTotal = parseFloat(order.total || '0');
  const itemsTotal = order.orderItems?.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.price || '0') * item.quantity), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Order Details - {order.orderCode}</span>
          </DialogTitle>
          <DialogDescription>
            Complete order information and customer details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Badge 
                    className={`mb-2 ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {order.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Badge 
                    className={`mb-2 ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {order.paymentStatus}
                  </Badge>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1">₾{orderTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                  <p className="text-gray-900 font-medium">
                    {order.user?.firstName || order.user?.lastName 
                      ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {order.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Order Date</Label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-900">
                  {(() => {
                    try {
                      const address = typeof order.shippingAddress === 'string' 
                        ? JSON.parse(order.shippingAddress) 
                        : order.shippingAddress;
                      
                      return (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                              <p>{address.firstName} {address.lastName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Phone</Label>
                              <p>{address.phone}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Address</Label>
                              <p>{address.address}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">City</Label>
                              <p>{address.city}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Postal Code</Label>
                              <p>{address.postalCode}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Country</Label>
                              <p>{address.country}</p>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return <div className="whitespace-pre-line">{order.shippingAddress}</div>;
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                    {item.product?.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.product?.name || `Product ${item.productId}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.product?.brand && `${item.product.brand} • `}
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₾{(parseFloat(item.price || '0') * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₾{parseFloat(item.price || '0').toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({order.orderItems?.length || 0} items)</span>
                    <span>₾{itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 text-lg">
                    <span>Total</span>
                    <span>₾{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Method</Label>
                  <p className="text-gray-900">BOG Payment Gateway</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment ID</Label>
                  <p className="text-gray-900 font-mono text-sm">
                    {order.paymentId || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                  <Badge 
                    className={`${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Date</Label>
                  <p className="text-gray-900">
                    {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'brand' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bulkDiscountPercentage, setBulkDiscountPercentage] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Check if user is authenticated as admin
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem("adminAuthenticated");
    if (!isAdminAuthenticated) {
      setLocation("/admin");
      return;
    }
  }, [setLocation]);

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  // Fetch orders for admin
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    if (!products) return [];
    
    // Filter by search query
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort products
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'brand':
          aValue = a.brand || '';
          bValue = b.brand || '';
          break;
        case 'price':
          aValue = parseFloat(a.price || '0');
          bValue = parseFloat(b.price || '0');
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
    
    return filtered;
  }, [products, searchQuery, sortBy, sortOrder]);

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      return await apiRequest("POST", "/api/admin/products", product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create product", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Partial<InsertProduct> }) => {
      return await apiRequest("PUT", `/api/admin/products/${id}`, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      toast({ title: "Product updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update product", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete product", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Bulk pricing mutations
  const bulkUpdatePricingMutation = useMutation({
    mutationFn: async ({ productIds, discountPercentage }: { productIds: string[]; discountPercentage: number }) => {
      return await apiRequest("POST", "/api/admin/products/bulk-pricing", { productIds, discountPercentage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedProducts(new Set());
      setBulkDiscountPercentage(0);
      toast({ title: "Bulk pricing updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update pricing", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const resetAllDiscountsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/products/reset-discounts", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "All discounts reset successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to reset discounts", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Order status update mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus?: string }) => {
      return await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status, paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update order status", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete order", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(id);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    // Handle both Georgian and English category names
    switch (category.toLowerCase()) {
      case 'ქალის': 
      case 'women\'s': 
      case 'women': return 'bg-pink-100 text-pink-800';
      case 'კაცის': 
      case 'men\'s': 
      case 'men': return 'bg-blue-100 text-blue-800';
      case 'უნისექსი': 
      case 'unisex': return 'bg-purple-100 text-purple-800';
      case 'ნიშური': 
      case 'niche': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: string, paymentStatus?: string) => {
    updateOrderStatusMutation.mutate({ orderId, status, paymentStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  // Bulk pricing handlers
  const handleBulkPricingUpdate = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No products selected",
        description: "Please select products to update pricing for.",
        variant: "destructive",
      });
      return;
    }

    if (bulkDiscountPercentage < 0 || bulkDiscountPercentage > 100) {
      toast({
        title: "Invalid discount",
        description: "Discount percentage must be between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    bulkUpdatePricingMutation.mutate({
      productIds: Array.from(selectedProducts),
      discountPercentage: bulkDiscountPercentage,
    });
  };

  const handleResetAllDiscounts = () => {
    if (confirm('Are you sure you want to reset all product discounts to 0%? This action cannot be undone.')) {
      resetAllDiscountsMutation.mutate();
    }
  };

  const handleSelectProduct = (productId: string, selected: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (selected) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAllProducts = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy font-roboto">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Admin Panel</h1>
          <p className="text-navy/70">Manage your luxury perfume catalog</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products, brands, descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Sort Controls */}
                  <div className="flex gap-2 items-center">
                    <Select value={sortBy} onValueChange={(value: 'name' | 'brand' | 'price' | 'category') => setSortBy(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </Button>
                  </div>
                  
                  {/* Add Product Button */}
                  <Button onClick={handleCreateProduct} className="bg-gold hover:bg-gold/90 text-navy">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
                
                {/* Results Count */}
                <div className="mt-4 text-sm text-navy/70">
                  Showing {filteredAndSortedProducts.length} of {products.length} products
                  {searchQuery && (
                    <span className="ml-2">
                      • Filtered by "{searchQuery}"
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSearchQuery('')}
                        className="ml-1 h-auto p-1 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Products Catalog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>In Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryBadgeColor(product.category)}>
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">₾{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell className="font-medium">
                            {product.discountPercentage && product.discountPercentage > 0 ? (
                              <span className="text-green-600">
                                ₾{(parseFloat(product.price) * (1 - product.discountPercentage / 100)).toFixed(2)}
                              </span>
                            ) : (
                              <span>₾{parseFloat(product.price).toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.discountPercentage && product.discountPercentage > 0 ? (
                              <Badge className="bg-red-100 text-red-800">
                                -{product.discountPercentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">No discount</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.inStock ? "default" : "destructive"}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Bulk Pricing Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Bulk Pricing Management
                </CardTitle>
                <CardDescription>
                  Manage discounts for multiple products at once or reset all discounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bulk Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="bulk-discount">Discount Percentage</Label>
                    <Input
                      id="bulk-discount"
                      type="number"
                      min="0"
                      max="100"
                      value={bulkDiscountPercentage}
                      onChange={(e) => setBulkDiscountPercentage(Number(e.target.value))}
                      placeholder="Enter discount percentage (0-100)"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkPricingUpdate}
                      disabled={bulkUpdatePricingMutation.isPending || selectedProducts.size === 0}
                      className="bg-gold hover:bg-gold/90 text-navy"
                    >
                      {bulkUpdatePricingMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Apply Discount ({selectedProducts.size} products)
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetAllDiscounts}
                      disabled={resetAllDiscountsMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {resetAllDiscountsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Reset All Discounts
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {selectedProducts.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedProducts.size}</strong> products selected for bulk pricing update.
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProducts(new Set())}
                        className="ml-2 h-auto p-1 text-blue-600 hover:bg-blue-100"
                      >
                        Clear selection
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Selection Table */}
            <Card>
              <CardHeader>
                <CardTitle>Select Products for Pricing Updates</CardTitle>
                <CardDescription>
                  Check the products you want to apply bulk discount pricing to.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedProducts.size === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                            onChange={(e) => handleSelectAllProducts(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Current Discount</TableHead>
                        <TableHead>Current Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell className="font-medium">₾{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            {product.discountPercentage && product.discountPercentage > 0 ? (
                              <Badge className="bg-red-100 text-red-800">
                                -{product.discountPercentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">No discount</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.discountPercentage && product.discountPercentage > 0 ? (
                              <span className="text-green-600">
                                ₾{(parseFloat(product.price) * (1 - product.discountPercentage / 100)).toFixed(2)}
                              </span>
                            ) : (
                              <span>₾{parseFloat(product.price).toFixed(2)}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Order Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(order => {
                          const today = new Date().toDateString();
                          const orderDate = new Date(order.createdAt).toDateString();
                          return today === orderDate;
                        }).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₾{orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(order => order.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Orders Management
                </CardTitle>
                <CardDescription>
                  Manage customer orders, update statuses, and process shipments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-navy">Loading orders...</div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Code</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono font-medium">
                              {order.orderCode}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">
                                    {order.user?.firstName || order.user?.lastName 
                                      ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
                                      : order.user?.email || 'Unknown User'
                                    }
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {order.user?.email || 'No email'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {order.orderItems?.slice(0, 2).map((item: any) => (
                                  <div key={item.id} className="text-sm">
                                    {item.quantity}x {item.product?.name || `Product ${item.productId}`}
                                  </div>
                                ))}
                                {order.orderItems?.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{order.orderItems.length - 2} more items
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₾{parseFloat(order.total || '0').toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getOrderStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => handleUpdateOrderStatus(order.id, status)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">User management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View sales and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <ProductDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode={dialogMode}
          product={selectedProduct}
          onSubmit={(product) => {
            if (dialogMode === 'create') {
              createProductMutation.mutate(product);
            } else if (selectedProduct) {
              updateProductMutation.mutate({ id: selectedProduct.id, product });
            }
          }}
          isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
        />

        {/* Order Details Dialog */}
        <OrderDetailsDialog
          isOpen={isOrderDialogOpen}
          onOpenChange={setIsOrderDialogOpen}
          order={selectedOrder}
        />
      </div>
    </div>
  );
}

// Product Dialog Component
interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  product: Product | null;
  onSubmit: (product: InsertProduct) => void;
  isSubmitting: boolean;
}

function ProductDialog({ isOpen, onOpenChange, mode, product, onSubmit, isSubmitting }: ProductDialogProps) {
  const [formData, setFormData] = useState<InsertProduct>({
    name: '',
    description: '',
    price: '0.00',
    category: 'Unisex',
    brand: '',
    imageUrl: '',
    inStock: true,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Unisex']);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert('Image file is too large. Please choose an image under 2MB.');
        return;
      }

      // Compress and resize the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions (max 800x800)
        const maxDimension = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        setFormData({ ...formData, imageUrl: compressedBase64 });
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    // For now, we'll use the first selected category as the main category
    const newCategories = selectedCategories.includes(category) 
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    if (newCategories.length > 0) {
      setFormData({ ...formData, category: newCategories[0] });
    }
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '0.00',
          category: product.category || 'Unisex',
          brand: product.brand || '',
          imageUrl: product.imageUrl || '',
          inStock: product.inStock ?? true,
        });
        // Initialize with all categories from both category and categories array
        const allCategories: string[] = [];
        if (product.category) allCategories.push(product.category);
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach((cat: string) => {
            if (!allCategories.includes(cat)) allCategories.push(cat);
          });
        }
        setSelectedCategories(allCategories.length > 0 ? allCategories : ['Unisex']);
      } else {
        setFormData({
          name: '',
          description: '',
          price: '0.00',
          category: 'Unisex',
          brand: '',

          imageUrl: '',
          inStock: true,
        });
        setSelectedCategories(['Unisex']);
      }
    }
  }, [isOpen, mode, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include categories array in the form data
    const dataWithCategories = {
      ...formData,
      categories: selectedCategories
    };
    onSubmit(dataWithCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new luxury perfume product for your catalog' 
              : 'Update the product information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image Management */}
          <div className="space-y-4">
            <Label>Product Image</Label>
            <div className="flex items-start gap-4">
              {formData.imageUrl && (
                <div className="relative">
                  <img 
                    src={formData.imageUrl} 
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={handleImageDelete}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a high-quality product image (JPG, PNG). Max 2MB, will be automatically resized to 800x800.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Product Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black Orchid"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Tom Ford"
                required
              />
            </div>
          </div>

          {/* Pricing and Stock Management */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Current Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99.99"
                required
                className="text-lg font-medium"
              />
              <p className="text-xs text-gray-500">Set the current retail price</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inStock">Stock Status</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  id="inStock"
                  checked={formData.inStock || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
                <Label htmlFor="inStock" className="text-sm">
                  {formData.inStock ? 'In Stock' : 'Out of Stock'}
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                >
                  Toggle Stock
                </Button>
              </div>
            </div>
          </div>

          {/* Multiple Category Selection */}
          <div className="space-y-3">
            <Label>Product Categories *</Label>
            <div className="grid grid-cols-4 gap-3">
              {['Men\'s', 'Women\'s', 'Unisex', 'Niche'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`category-${category}`} className="capitalize">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Primary category: <span className="font-medium capitalize">{formData.category}</span>
              {selectedCategories.length > 1 && (
                <span className="ml-2">
                  (+{selectedCategories.length - 1} additional)
                </span>
              )}
            </p>
          </div>

          {/* Product Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed product description, story, and features..."
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Current Product Info Display (Edit Mode) */}
          {mode === 'edit' && product && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-900">Current Product Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Current Price:</span>
                  <span className="ml-2">${product.price}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Stock Status:</span>
                  <span className="ml-2">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Category:</span>
                  <span className="ml-2 capitalize">{product.category}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Brand:</span>
                  <span className="ml-2">{product.brand}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Product' : 'Update Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}