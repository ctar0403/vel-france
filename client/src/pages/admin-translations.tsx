import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Translation {
  id: string;
  key: string;
  englishText: string;
  georgianText: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTranslations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTranslations, setEditingTranslations] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all translations
  const { data: translations = [], isLoading } = useQuery<Translation[]>({
    queryKey: ["/api/translations"],
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async ({ key, georgianText }: { key: string; georgianText: string }) => {
      return apiRequest(`/api/admin/translations/${encodeURIComponent(key)}`, "PUT", { georgianText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({
        title: "Success",
        description: "Translation updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update translation",
        variant: "destructive",
      });
    },
  });

  // Bulk create translations mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (translationsData: { key: string; englishText: string }[]) => {
      return apiRequest("/api/admin/translations/bulk", "POST", { translations: translationsData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({
        title: "Success",
        description: "Translations imported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import translations",
        variant: "destructive",
      });
    },
  });

  // Handle importing scanned translations
  const handleImportScannedTranslations = async () => {
    try {
      const response = await fetch('/translations-scan-result.json');
      const scannedTranslations = await response.json();
      bulkCreateMutation.mutate(scannedTranslations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load scanned translations",
        variant: "destructive",
      });
    }
  };

  // Handle updating a translation
  const handleUpdateTranslation = (key: string) => {
    const georgianText = editingTranslations[key] || "";
    updateTranslationMutation.mutate({ key, georgianText });
    
    // Remove from editing state
    setEditingTranslations(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Handle input change for editing
  const handleInputChange = (key: string, value: string) => {
    setEditingTranslations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter translations based on search term
  const filteredTranslations = translations.filter((translation: Translation) =>
    translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.englishText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.georgianText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTranslations = filteredTranslations.filter((t: Translation) => !t.georgianText);
  const completedTranslations = filteredTranslations.filter((t: Translation) => t.georgianText);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading translations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Management</h1>
          <p className="text-gray-600 mt-2">
            Manage Georgian translations for all UI text elements
          </p>
        </div>
        <Button 
          onClick={handleImportScannedTranslations}
          disabled={bulkCreateMutation.isPending}
        >
          {bulkCreateMutation.isPending ? "Importing..." : "Import Scanned Translations"}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">{filteredTranslations.length}</p>
              </div>
              <Badge variant="secondary">{filteredTranslations.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">{pendingTranslations.length}</p>
              </div>
              <Badge variant="destructive">{pendingTranslations.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTranslations.length}</p>
              </div>
              <Badge variant="default" className="bg-green-600">{completedTranslations.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search translations by key, English text, or Georgian text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Translation List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Translations ({filteredTranslations.length})
        </h2>
        
        {filteredTranslations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No translations found. Import scanned translations to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTranslations.map((translation: Translation) => (
            <Card key={translation.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono text-blue-600">
                    {translation.key}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {translation.georgianText ? (
                      <Badge variant="default" className="bg-green-600">Completed</Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* English Text (Read-only) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    English Text
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">{translation.englishText}</p>
                  </div>
                </div>

                {/* Georgian Text (Editable) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Georgian Translation
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      value={editingTranslations[translation.key] ?? translation.georgianText}
                      onChange={(e) => handleInputChange(translation.key, e.target.value)}
                      placeholder="Enter Georgian translation..."
                      className="flex-1 min-h-[80px]"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                    <Button
                      onClick={() => handleUpdateTranslation(translation.key)}
                      disabled={updateTranslationMutation.isPending}
                      size="sm"
                      className="self-end"
                    >
                      {updateTranslationMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>Created: {new Date(translation.createdAt).toLocaleDateString()}</p>
                  {translation.updatedAt !== translation.createdAt && (
                    <p>Updated: {new Date(translation.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}