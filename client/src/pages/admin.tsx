import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Order, ContactMessage, InsertProduct } from "@shared/schema";
import { Plus, Edit, Trash2, Package, Users, MessageSquare, Settings } from "lucide-react";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const typedUser = user as any;
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("products");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<InsertProduct>({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    category: "women",
    notes: "",
    imageUrl: "",
    inStock: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!typedUser || !typedUser.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You do not have administrator permissions.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, authLoading, toast]);

  // Fetch products
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<(Order & { user: any, orderItems: any[] })[]>({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  // Fetch contact messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contacts"],
    retry: false,
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (editingProduct) {
        await apiRequest("PUT", `/api/admin/products/${editingProduct.id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Succès",
        description: editingProduct ? "Produit modifié avec succès" : "Produit créé avec succès",
      });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été modifié.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("PUT", `/api/admin/contacts/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
    },
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      category: "women",
      notes: "",
      imageUrl: "",
      inStock: true,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || "",
      price: product.price,
      category: product.category,
      notes: product.notes || "",
      imageUrl: product.imageUrl || "",
      inStock: product.inStock,
    });
    setIsProductDialogOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    productMutation.mutate(productForm);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="font-playfair text-navy">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!typedUser || !typedUser.isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="font-playfair text-2xl text-navy mb-4">Access Denied</h1>
            <p className="text-gray-600">You do not have administrator permissions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadMessages = messages.filter(m => !m.isRead).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-vibes text-3xl text-navy">Vel France</h1>
              <p className="text-gray-600">Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-playfair text-navy">
                Hello, {typedUser.firstName || typedUser.email}
              </span>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="border-gold text-navy hover:bg-gold hover:text-navy"
              >
                Back to Site
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
                className="border-navy text-navy hover:bg-navy hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { key: 'products', label: 'Products', icon: Package, count: products.length },
            { key: 'orders', label: 'Orders', icon: Settings, count: pendingOrders },
            { key: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages },
          ].map(({ key, label, icon: Icon, count }) => (
            <Button
              key={key}
              variant={selectedTab === key ? 'default' : 'outline'}
              className={`flex items-center space-x-2 ${
                selectedTab === key 
                  ? 'bg-gold text-navy hover:bg-deep-gold' 
                  : 'border-gold text-navy hover:bg-gold hover:text-navy'
              }`}
              onClick={() => setSelectedTab(key)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 bg-navy text-white">
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Products Tab */}
        {selectedTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-3xl text-navy">Gestion des Produits</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gold hover:bg-deep-gold text-navy"
                    onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Produit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-playfair text-2xl text-navy">
                      {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-navy font-playfair mb-2">Nom</label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="border-gold/30 focus:border-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-navy font-playfair mb-2">Prix (€)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          className="border-gold/30 focus:border-gold"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-navy font-playfair mb-2">Category</label>
                      <Select
                        value={productForm.category}
                        onValueChange={(value: 'women' | 'men' | 'unisex') => 
                          setProductForm({...productForm, category: value})
                        }
                      >
                        <SelectTrigger className="border-gold/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-navy font-playfair mb-2">Short Description</label>
                      <Input
                        value={productForm.shortDescription || ""}
                        onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})}
                        className="border-gold/30 focus:border-gold"
                        placeholder="Brief perfume summary"
                      />
                    </div>

                    <div>
                      <label className="block text-navy font-playfair mb-2">Full Description</label>
                      <Textarea
                        value={productForm.description || ""}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="border-gold/30 focus:border-gold resize-none"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-navy font-playfair mb-2">Fragrance Notes</label>
                      <Textarea
                        value={productForm.notes || ""}
                        onChange={(e) => setProductForm({...productForm, notes: e.target.value})}
                        className="border-gold/30 focus:border-gold resize-none"
                        rows={3}
                        placeholder="Top: ... • Heart: ... • Base: ..."
                      />
                    </div>

                    <div>
                      <label className="block text-navy font-playfair mb-2">Image URL</label>
                      <Input
                        type="url"
                        value={productForm.imageUrl || ""}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        className="border-gold/30 focus:border-gold"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={productForm.inStock || false}
                        onChange={(e) => setProductForm({...productForm, inStock: e.target.checked})}
                        className="rounded border-gold"
                      />
                      <label htmlFor="inStock" className="text-navy font-playfair">
                        In Stock
                      </label>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductDialogOpen(false)}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy hover:bg-navy/90 text-white"
                        disabled={productMutation.isPending}
                      >
                        {productMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-3 bg-gray-300 rounded mb-4 w-2/3" />
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-300 rounded w-16" />
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-300 rounded" />
                          <div className="h-8 w-8 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-playfair text-lg">
                    Aucun produit créé pour le moment
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Commencez par ajouter votre premier parfum
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-playfair text-lg text-navy">{product.name}</h3>
                        <Badge variant={product.category === 'women' ? 'default' : product.category === 'men' ? 'secondary' : 'outline'}>
                          {product.category === 'women' && 'Femme'}
                          {product.category === 'men' && 'Homme'}
                          {product.category === 'unisex' && 'Mixte'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-playfair text-xl font-bold text-gold">€{product.price}</span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="border-gold text-navy hover:bg-gold hover:text-navy"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            disabled={deleteProductMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {!product.inStock && (
                        <Badge variant="destructive" className="mt-2">
                          Rupture de stock
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-playfair text-3xl text-navy mb-6">Gestion des Commandes</h2>
            
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-24" />
                          <div className="h-3 bg-gray-300 rounded w-32" />
                        </div>
                        <div className="h-6 bg-gray-300 rounded w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-playfair text-lg">
                  No orders yet
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-playfair text-lg text-navy">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-gray-600">
                            {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Date not available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-playfair text-2xl font-bold text-gold">€{order.total}</p>
                          <Select
                            value={order.status}
                            onValueChange={(status) => updateOrderMutation.mutate({ orderId: order.id, status })}
                          >
                            <SelectTrigger className="w-40 mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-playfair text-navy mb-2">Ordered Items:</h4>
                        <div className="space-y-2">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span>{item.product?.name || 'Deleted Product'}</span>
                              <span>
                                {item.quantity}x €{item.price} = €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-playfair text-navy mb-2">Adresse de livraison:</h4>
                        <p className="text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Messages Tab */}
        {selectedTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-playfair text-3xl text-navy mb-6">Messages de Contact</h2>
            
            {messagesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-300 rounded w-48" />
                          <div className="h-3 bg-gray-300 rounded w-32" />
                          <div className="h-12 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-playfair text-lg">
                  No messages yet
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      !message.isRead 
                        ? 'border-gold shadow-lg' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => !message.isRead && markAsReadMutation.mutate(message.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-playfair text-lg text-navy">
                              {message.firstName} {message.lastName}
                            </h3>
                            {!message.isRead && (
                              <Badge className="bg-gold text-navy">New</Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{message.email}</p>
                          <p className="text-sm text-gray-500">
                            {message.createdAt ? new Date(message.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Date not available'}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-navy text-navy">
                          {message.subject}
                        </Badge>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
