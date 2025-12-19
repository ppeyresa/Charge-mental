
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Edit2, 
  FileText,
  Calendar,
  Euro,
  Tag,
  Plus,
  Car,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Trash2,
  Inbox,
  FolderX,
  Heart,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { AdminItem, Category } from '../types';

interface InventoryProps {
  items: AdminItem[];
  categories: Category[];
  onAddClick: (category?: Category) => void;
  onEditClick: (item: AdminItem) => void;
  onDeleteClick: (id: string) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: Category, newName: string) => void;
  onDeleteCategory: (cat: Category) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  items, 
  categories, 
  onAddClick, 
  onEditClick, 
  onDeleteClick, 
  onAddCategory,
  onRenameCategory,
  onDeleteCategory 
}) => {
  const [filter, setFilter] = useState<Category | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // States for Category Management UI
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  useEffect(() => {
    setExpandedCategories(prev => {
      const next = { ...prev };
      categories.forEach(cat => {
        if (next[cat] === undefined) next[cat] = true;
      });
      return next;
    });
  }, [categories]);

  const handleCreateCategory = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setFilter(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  const handleSaveRename = (oldName: string) => {
    if (editCatName.trim() && editCatName.trim() !== oldName) {
      onRenameCategory(oldName, editCatName.trim());
    }
    setEditingCat(null);
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'Tous' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedItems: Record<string, AdminItem[]> = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) groupedItems[item.category] = [];
    groupedItems[item.category].push(item);
  });

  const activeCategories = filter === 'Tous' ? categories : categories.filter(c => c === filter);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('véhicule') || c.includes('voiture') || c.includes('auto')) return <Car className="w-4 h-4" />;
    if (c.includes('santé') || c.includes('médical') || c.includes('docteur')) return <Heart className="w-4 h-4" />;
    if (c.includes('finance') || c.includes('banque') || c.includes('argent')) return <Euro className="w-4 h-4" />;
    return <Tag className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mon Inventaire</h2>
          <p className="text-sm text-slate-500">{items.length} lignes suivies au total</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {isAdding ? (
            <div className="flex items-center gap-1 bg-white border border-indigo-200 p-1 rounded-lg shadow-sm animate-in fade-in slide-in-from-right-2">
              <input 
                autoFocus
                type="text"
                placeholder="Nom..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                className="px-2 py-1 text-xs outline-none w-24"
              />
              <button onClick={handleCreateCategory} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 p-2 px-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-bold text-xs whitespace-nowrap group"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Catégorie</span>
            </button>
          )}

          <button 
            onClick={() => onAddClick()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle ligne</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('Tous')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'Tous' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
          }`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grouped View */}
      <div className="space-y-4">
        {activeCategories.map(cat => {
          const catItems = groupedItems[cat] || [];
          const isExpanded = !!expandedCategories[cat];
          const isEditing = editingCat === cat;
          
          return (
            <div key={cat} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Category Header */}
              <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 group/cat">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => !isEditing && toggleCategory(cat)}>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-white border border-indigo-200 p-1 rounded-lg">
                      <input 
                        autoFocus
                        type="text"
                        value={editCatName}
                        onChange={e => setEditCatName(e.target.value)}
                        className="px-2 py-0.5 text-sm font-bold outline-none border-none"
                        onClick={e => e.stopPropagation()}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSaveRename(cat); }}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCat(null); }}
                        className="p-1 text-slate-400 hover:bg-slate-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      {getCategoryIcon(cat)}
                      {cat}
                      <span className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{catItems.length}</span>
                    </h3>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center opacity-0 group-hover/cat:opacity-100 transition-opacity bg-white/50 rounded-lg p-0.5 border border-slate-200 mr-2">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingCat(cat); 
                        setEditCatName(cat); 
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Renommer la catégorie"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {catItems.length === 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer la catégorie"
                      >
                        <FolderX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => onAddClick(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Category Content */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  {catItems.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-slate-100">
                        {catItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                  <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</div>
                                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                    {item.provider}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                 {item.dueDate}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-black text-slate-800 flex items-center justify-end gap-1">
                                {item.amount ? `${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€` : '-'}
                                <Euro className="w-3 h-3 text-slate-300" />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                item.status === 'urgent' 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : item.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {item.status === 'urgent' ? 'Urgent' : item.status === 'completed' ? 'Traité' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => onEditClick(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => onDeleteClick(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/20">
                      <Inbox className="w-8 h-8 text-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-600">Aucune ligne dans cette catégorie.</p>
                      </div>
                      <button 
                        onClick={() => onAddClick(cat)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                      >
                        Ajouter ma première ligne {cat}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
