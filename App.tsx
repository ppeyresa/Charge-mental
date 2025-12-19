
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Insights from './components/Insights';
import DocumentModal from './components/DocumentModal';
import { AdminItem, MentalLoadState, Insight, Category } from './types';
import { getMentalLoadAdvisor, getOptimizationInsights } from './services/geminiService';

const DEFAULT_CATEGORIES: Category[] = ['Finance', 'Santé', 'Logement', 'Abonnements', 'Impôts', 'Véhicule', 'Autre'];

const INITIAL_ITEMS: AdminItem[] = [
  {
    id: '1',
    title: 'Facture Électricité',
    provider: 'EDF',
    category: 'Logement',
    dueDate: '2024-11-25',
    amount: 142.50,
    status: 'urgent',
    renewalDate: '2025-05-10'
  },
  {
    id: '2',
    title: 'Assurance Voiture',
    provider: 'Allianz',
    category: 'Véhicule',
    dueDate: '2024-12-01',
    amount: 540.00,
    status: 'pending',
    renewalDate: '2024-12-01'
  },
  {
    id: '3',
    title: 'Révision Technique Annuelle',
    provider: 'Garage Renault',
    category: 'Véhicule',
    dueDate: '2025-02-15',
    amount: 250.00,
    status: 'pending',
    notes: 'Prévoir le changement des filtres'
  },
  {
    id: '4',
    title: 'Abonnement Netflix',
    provider: 'Netflix',
    category: 'Abonnements',
    dueDate: '2024-11-15',
    amount: 17.99,
    status: 'completed',
    renewalDate: '2024-12-15'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<AdminItem[]>(INITIAL_ITEMS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [prefilledCategory, setPrefilledCategory] = useState<Category | undefined>();
  const [advisorMessage, setAdvisorMessage] = useState('Analyse de votre situation en cours...');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const stats: MentalLoadState = {
    score: Math.min(100, (items.filter(i => i.status !== 'completed').length * 15) + 10),
    pendingCount: items.filter(i => i.status === 'pending').length,
    urgentCount: items.filter(i => i.status === 'urgent').length,
    savingsPotential: 285,
    totalExpenses: items.reduce((acc, item) => acc + (item.amount || 0), 0)
  };

  const updateAIInsights = useCallback(async () => {
    if (items.length === 0) return;
    setIsLoadingInsights(true);
    try {
      const [msg, ins] = await Promise.all([
        getMentalLoadAdvisor(items),
        getOptimizationInsights(items)
      ]);
      setAdvisorMessage(msg);
      setInsights(ins);
    } catch (e) {
      console.error("AI Insights failed", e);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [items]);

  useEffect(() => {
    updateAIInsights();
  }, [updateAIInsights]);

  const handleSaveItem = (item: AdminItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setShowModal(false);
    setEditingItem(null);
    setPrefilledCategory(undefined);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette ligne ?")) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const openAddModal = (category?: Category) => {
    setEditingItem(null);
    setPrefilledCategory(category);
    setShowModal(true);
  };

  const openEditModal = (item: AdminItem) => {
    setEditingItem(item);
    setPrefilledCategory(undefined);
    setShowModal(true);
  };

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories(prev => [...prev, trimmed]);
    } else {
      alert("Cette catégorie existe déjà.");
    }
  };

  const handleRenameCategory = (oldName: Category, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName) {
      setCategories(prev => prev.map(c => c === oldName ? trimmed : c));
      setItems(prev => prev.map(item => 
        item.category === oldName ? { ...item, category: trimmed } : item
      ));
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const hasItems = items.some(item => item.category === cat);
    if (hasItems) {
      alert("Supprimez d'abord les lignes associées à cette catégorie.");
      return;
    }
    if (window.confirm(`Supprimer la catégorie "${cat}" ?`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={items} stats={stats} onAddClick={() => openAddModal()} />;
      case 'inventory':
        return (
          <Inventory 
            items={items} 
            categories={categories}
            onAddClick={openAddModal} 
            onEditClick={openEditModal} 
            onDeleteClick={handleDeleteItem}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'insights':
        return (
          <Insights 
            insights={insights} 
            advisorMessage={advisorMessage} 
            onRefresh={updateAIInsights} 
            isLoading={isLoadingInsights}
          />
        );
      default:
        return <Dashboard items={items} stats={stats} onAddClick={() => openAddModal()} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      
      {showModal && (
        <DocumentModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveItem}
          editItem={editingItem}
          prefilledCategory={prefilledCategory}
          availableCategories={categories}
        />
      )}
    </Layout>
  );
};

export default App;
