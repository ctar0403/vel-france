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
import { Plus, Edit, Trash2, Package, Search, Upload, X, ArrowUpDown } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'brand' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
                        <TableHead>Price</TableHead>
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
                          <TableCell className="font-medium">${product.price}</TableCell>
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['unisex']);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFormData({ ...formData, imageUrl: base64String });
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
          shortDescription: product.shortDescription || '',
          price: product.price || '0.00',
          category: product.category || 'unisex',
          brand: product.brand || '',
          notes: product.notes || '',
          imageUrl: product.imageUrl || '',
          inStock: product.inStock ?? true,
        });
        setSelectedCategories([product.category || 'unisex']);
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
        setSelectedCategories(['unisex']);
      }
    }
  }, [isOpen, mode, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
                  Upload a high-quality product image (JPG, PNG)
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
                value={formData.brand}
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
                  checked={formData.inStock}
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
            <div className="grid grid-cols-3 gap-3">
              {['women', 'men', 'unisex'].map((category) => (
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

          {/* Product Descriptions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief, catchy description for product cards"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed product description, story, and features..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Fragrance Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Top notes, heart notes, base notes..."
                className="min-h-[80px]"
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