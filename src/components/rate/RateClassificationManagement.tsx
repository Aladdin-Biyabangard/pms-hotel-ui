import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    ChevronDown,
    ChevronRight,
    Edit,
    FileText,
    Folder,
    FolderOpen,
    FolderTree,
    Grid3X3,
    Info,
    ListTree,
    Plus,
    RefreshCw,
    Save,
    Search,
    Tag,
    Trash2
} from 'lucide-react';
import {
    CreateRateCategoryRequest,
    rateCategoryApi,
    RateCategoryResponse,
    UpdateRateCategoryRequest
} from '@/api/rateCategory';
import {CreateRateClassRequest, rateClassApi, RateClassResponse, UpdateRateClassRequest} from '@/api/rateClass';
import {CreateRateTypeRequest, rateTypeApi, RateTypeResponse, UpdateRateTypeRequest} from '@/api/rateType';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Types
type EntityType = 'CATEGORY' | 'CLASS' | 'TYPE';

interface TreeNode {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: EntityType;
  parentId?: number;
  children?: TreeNode[];
  status: string;
}

interface RateClassificationManagementProps {
  onSelect?: (entity: { type: EntityType; id: number; code: string; name: string }) => void;
}

export function RateClassificationManagement({ onSelect }: RateClassificationManagementProps) {
  // State
  const [categories, setCategories] = useState<RateCategoryResponse[]>([]);
  const [classes, setClasses] = useState<RateClassResponse[]>([]);
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [dialogEntityType, setDialogEntityType] = useState<EntityType>('CATEGORY');
  const [editingEntity, setEditingEntity] = useState<RateCategoryResponse | RateClassResponse | RateTypeResponse | null>(null);
  const [parentCategory, setParentCategory] = useState<RateCategoryResponse | null>(null);
  const [entityForm, setEntityForm] = useState<{
    code: string;
    name: string;
    description?: string;
  }>({ code: '', name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, classesData, typesData] = await Promise.all([
        rateCategoryApi.getAllRateCategories(0, 1000),
        rateClassApi.getAllRateClasses(0, 1000),
        rateTypeApi.getAllRateTypes(0, 1000)
      ]);
      setCategories(categoriesData.content);
      setClasses(classesData.content);
      setRateTypes(typesData.content);
      
      // Auto-expand all categories
      const expanded = new Set<string>();
      categoriesData.content.forEach(c => expanded.add(`category-${c.id}`));
      setExpandedNodes(expanded);
    } catch (error) {
      toast.error('Failed to load classification data');
    } finally {
      setIsLoading(false);
    }
  };

  // Build tree structure
  const treeData = useMemo(() => {
    const categoryNodes: TreeNode[] = categories.map(category => {
      const categoryClasses = classes.filter(c => c.rateCategoryId === category.id);
      return {
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        type: 'CATEGORY' as EntityType,
        status: category.status,
        children: categoryClasses.map(cls => ({
          id: cls.id,
          code: cls.code,
          name: cls.name,
          description: cls.description,
          type: 'CLASS' as EntityType,
          parentId: category.id,
          status: cls.status,
        }))
      };
    });
    return categoryNodes;
  }, [categories, classes]);

  // Filter by search
  const filteredTree = useMemo(() => {
    if (!searchTerm) return treeData;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    return treeData.filter(category => {
      const categoryMatch = 
        category.name.toLowerCase().includes(lowerSearch) ||
        category.code.toLowerCase().includes(lowerSearch);
      
      const childrenMatch = category.children?.some(child =>
        child.name.toLowerCase().includes(lowerSearch) ||
        child.code.toLowerCase().includes(lowerSearch)
      );
      
      return categoryMatch || childrenMatch;
    }).map(category => ({
      ...category,
      children: category.children?.filter(child =>
        child.name.toLowerCase().includes(lowerSearch) ||
        child.code.toLowerCase().includes(lowerSearch) ||
        category.name.toLowerCase().includes(lowerSearch) ||
        category.code.toLowerCase().includes(lowerSearch)
      )
    }));
  }, [treeData, searchTerm]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return rateTypes;
    const lowerSearch = searchTerm.toLowerCase();
    return rateTypes.filter(rt =>
      rt.name.toLowerCase().includes(lowerSearch) ||
      rt.code.toLowerCase().includes(lowerSearch)
    );
  }, [rateTypes, searchTerm]);

  // Toggle node expansion
  const toggleNode = (nodeKey: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeKey)) {
      newExpanded.delete(nodeKey);
    } else {
      newExpanded.add(nodeKey);
    }
    setExpandedNodes(newExpanded);
  };

  // Select node
  const handleSelectNode = (node: TreeNode) => {
    const key = `${node.type.toLowerCase()}-${node.id}`;
    setSelectedNode(key);
    onSelect?.({ type: node.type, id: node.id, code: node.code, name: node.name });
  };

  // CRUD operations
  const openCreateDialog = (entityType: EntityType, parent?: RateCategoryResponse) => {
    setDialogMode('CREATE');
    setDialogEntityType(entityType);
    setParentCategory(parent || null);
    setEditingEntity(null);
    setEntityForm({ code: '', name: '', description: '' });
    setShowDialog(true);
  };

  const openEditDialog = (entity: RateCategoryResponse | RateClassResponse | RateTypeResponse, entityType: EntityType) => {
    setDialogMode('EDIT');
    setDialogEntityType(entityType);
    setEditingEntity(entity);
    setParentCategory(null);
    setEntityForm({
      code: entity.code,
      name: entity.name,
      description: entity.description || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!entityForm.code || !entityForm.name) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (dialogEntityType === 'CATEGORY') {
        if (dialogMode === 'CREATE') {
          await rateCategoryApi.createRateCategory(entityForm as CreateRateCategoryRequest);
          toast.success('Category created');
        } else {
          await rateCategoryApi.updateRateCategory(editingEntity!.id, entityForm as UpdateRateCategoryRequest);
          toast.success('Category updated');
        }
      } else if (dialogEntityType === 'CLASS') {
        if (dialogMode === 'CREATE') {
          if (!parentCategory) {
            toast.error('Please select a parent category');
            return;
          }
          await rateClassApi.createRateClass({
            ...entityForm,
            rateCategoryId: parentCategory.id
          } as CreateRateClassRequest);
          toast.success('Class created');
        } else {
          await rateClassApi.updateRateClass(editingEntity!.id, entityForm as UpdateRateClassRequest);
          toast.success('Class updated');
        }
      } else if (dialogEntityType === 'TYPE') {
        if (dialogMode === 'CREATE') {
          await rateTypeApi.createRateType(entityForm as CreateRateTypeRequest);
          toast.success('Rate type created');
        } else {
          await rateTypeApi.updateRateType(editingEntity!.id, entityForm as UpdateRateTypeRequest);
          toast.success('Rate type updated');
        }
      }
      
      setShowDialog(false);
      loadAllData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entity: any, entityType: EntityType) => {
    const entityName = entityType === 'CATEGORY' ? 'category' : entityType === 'CLASS' ? 'class' : 'rate type';
    
    if (!window.confirm(`Delete ${entityName} "${entity.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (entityType === 'CATEGORY') {
        await rateCategoryApi.deleteRateCategory(entity.id);
      } else if (entityType === 'CLASS') {
        await rateClassApi.deleteRateClass(entity.id);
      } else {
        await rateTypeApi.deleteRateType(entity.id);
      }
      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted`);
      loadAllData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to delete ${entityName}`);
    }
  };

  // Render tree node
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const nodeKey = `${node.type.toLowerCase()}-${node.id}`;
    const isExpanded = expandedNodes.has(nodeKey);
    const isSelected = selectedNode === nodeKey;
    const hasChildren = node.children && node.children.length > 0;
    const parentCategory = node.type === 'CATEGORY' ? categories.find(c => c.id === node.id) : null;

    return (
      <div key={nodeKey}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/30"
              )}
              style={{ paddingLeft: `${level * 20 + 12}px` }}
              onClick={() => handleSelectNode(node)}
            >
              {/* Expand/Collapse button */}
              {node.type === 'CATEGORY' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(nodeKey);
                  }}
                >
                  {hasChildren ? (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  ) : (
                    <div className="w-4" />
                  )}
                </Button>
              )}

              {/* Icon */}
              {node.type === 'CATEGORY' ? (
                isExpanded ? (
                  <FolderOpen className="h-5 w-5 text-amber-500" />
                ) : (
                  <Folder className="h-5 w-5 text-amber-500" />
                )
              ) : (
                <FileText className="h-5 w-5 text-blue-500" />
              )}

              {/* Name & Code */}
              <div className="flex-1 min-w-0">
                <span className="font-medium">{node.name}</span>
                <span className="text-xs text-muted-foreground ml-2">({node.code})</span>
              </div>

              {/* Status badge */}
              <Badge 
                variant={node.status === 'ACTIVE' ? 'default' : 'secondary'}
                className={cn(
                  "text-[10px] h-5",
                  node.status === 'ACTIVE' && "bg-emerald-500"
                )}
              >
                {node.status}
              </Badge>

              {/* Children count */}
              {node.type === 'CATEGORY' && hasChildren && (
                <Badge variant="outline" className="text-[10px]">
                  {node.children?.length}
                </Badge>
              )}
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent>
            <ContextMenuItem onClick={() => openEditDialog(node as any, node.type)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </ContextMenuItem>
            {node.type === 'CATEGORY' && (
              <ContextMenuItem onClick={() => openCreateDialog('CLASS', parentCategory!)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={() => handleDelete(node, node.type)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Children */}
        {node.type === 'CATEGORY' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTree.map(category => (
        <Card key={category.id} className="overflow-hidden">
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-amber-500" />
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">{category.code}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEditDialog(category as any, 'CATEGORY')}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openCreateDialog('CLASS', categories.find(c => c.id === category.id))}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {category.children && category.children.length > 0 ? (
              <div className="space-y-2">
                {category.children.map(cls => (
                  <div 
                    key={cls.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{cls.name}</span>
                      <span className="text-xs text-muted-foreground">({cls.code})</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openEditDialog(cls as any, 'CLASS')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(cls, 'CLASS')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No classes defined
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-indigo-600" />
              Rate Classification Management
            </CardTitle>
            <CardDescription>
              Organize rate plans with categories, classes, and types
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="hierarchy" className="w-full">
          <div className="border-b px-4 py-2 flex items-center gap-4 bg-muted/30">
            <TabsList>
              <TabsTrigger value="hierarchy" className="gap-2">
                <ListTree className="h-4 w-4" />
                Category → Class
              </TabsTrigger>
              <TabsTrigger value="types" className="gap-2">
                <Tag className="h-4 w-4" />
                Rate Types
              </TabsTrigger>
            </TabsList>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-9"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'tree' ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('tree')}
              >
                <ListTree className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hierarchy Tab */}
          <TabsContent value="hierarchy" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                Loading...
              </div>
            ) : (
              <div className="p-4">
                {/* Quick actions */}
                <div className="flex items-center gap-3 mb-4">
                  <Button size="sm" onClick={() => openCreateDialog('CATEGORY')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const allKeys = categories.map(c => `category-${c.id}`);
                    setExpandedNodes(new Set(allKeys));
                  }}>
                    Expand All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setExpandedNodes(new Set())}>
                    Collapse All
                  </Button>
                </div>

                {viewMode === 'tree' ? (
                  <ScrollArea className="h-[500px] rounded-md border p-3">
                    {filteredTree.length > 0 ? (
                      <div className="space-y-1">
                        {filteredTree.map(node => renderTreeNode(node))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <FolderTree className="h-12 w-12 mb-4 opacity-30" />
                        <p className="text-lg font-medium">No Categories</p>
                        <p className="text-sm mb-4">Create your first category to organize rate plans</p>
                        <Button onClick={() => openCreateDialog('CATEGORY')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Category
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  renderGridView()
                )}

                {/* Info */}
                <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5" />
                    <div>
                      <p>Right-click on items for context menu options.</p>
                      <p>Categories contain classes. Rate plans can be assigned to categories and classes for organization.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Rate Types Tab */}
          <TabsContent value="types" className="m-0">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Button size="sm" onClick={() => openCreateDialog('TYPE')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate Type
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTypes.map(type => (
                  <Card key={type.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Tag className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-semibold">{type.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{type.code}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={type.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className={type.status === 'ACTIVE' ? 'bg-emerald-500' : ''}
                        >
                          {type.status}
                        </Badge>
                      </div>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mt-3">{type.description}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(type, 'TYPE')}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(type, 'TYPE')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTypes.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Tag className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No Rate Types</p>
                    <p className="text-sm mb-4">Rate types categorize the nature of rates (e.g., Standard, Corporate, Promotional)</p>
                    <Button onClick={() => openCreateDialog('TYPE')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rate Type
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'CREATE' ? 'Create' : 'Edit'}{' '}
              {dialogEntityType === 'CATEGORY' ? 'Category' : dialogEntityType === 'CLASS' ? 'Class' : 'Rate Type'}
            </DialogTitle>
            <DialogDescription>
              {dialogEntityType === 'CATEGORY' && 'Categories group related rate classes together'}
              {dialogEntityType === 'CLASS' && parentCategory && `Adding class under category: ${parentCategory.name}`}
              {dialogEntityType === 'TYPE' && 'Rate types define the nature of rate plans'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Name *</Label>
                <Input
                  value={entityForm.name}
                  onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                  placeholder={
                    dialogEntityType === 'CATEGORY' ? 'e.g., Corporate Rates' :
                    dialogEntityType === 'CLASS' ? 'e.g., Negotiated' :
                    'e.g., Standard'
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={entityForm.code}
                  onChange={(e) => setEntityForm({ ...entityForm, code: e.target.value.toUpperCase() })}
                  placeholder="CODE"
                  className="font-mono uppercase"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={entityForm.description || ''}
                onChange={(e) => setEntityForm({ ...entityForm, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {dialogMode === 'CREATE' ? 'Create' : 'Update'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

