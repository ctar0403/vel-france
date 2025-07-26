import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product, InsertProduct } from "@shared/schema";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
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

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/admin/products", product);
      return response.json();
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
      const response = await apiRequest("PUT", `/api/admin/products/${id}`, product);
      return response.json();
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
    switch (category.toLowerCase()) {
      case 'women': return 'bg-pink-100 text-pink-800';
      case 'men': return 'bg-blue-100 text-blue-800';
      case 'unisex': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Management
                  </CardTitle>
                  <CardDescription>
                    Manage your luxury perfume catalog - add, edit, or remove products
                  </CardDescription>
                </div>
                <Button onClick={handleCreateProduct} className="bg-gold hover:bg-gold/90 text-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
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
                        <TableHead>Price</TableHead>
                        <TableHead>In Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
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
                          <TableCell>${product.price}</TableCell>
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

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Order management coming soon...</p>
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
    shortDescription: '',
    price: '0.00',
    category: 'unisex',
    brand: '',
    notes: '',
    imageUrl: '',
    inStock: true,
  });

  // Reset form when dialog opens - use useEffect instead of useState
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price || '0.00',
          category: product.category || 'unisex',
          brand: product.brand || '',
          notes: product.notes || '',
          imageUrl: product.imageUrl || '',
          inStock: product.inStock ?? true,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          shortDescription: '',
          price: '0.00',
          category: 'unisex',
          brand: '',
          notes: '',
          imageUrl: '',
          inStock: true,
        });
      }
    }
  }, [isOpen, mode, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black Orchid"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Tom Ford"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief product description (max 500 characters)"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Fragrance Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Top notes, middle notes, base notes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/assets/product-image.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Product' : 'Update Product')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}