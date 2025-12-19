
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle, Save, Trash2, Edit3, Sparkles } from 'lucide-react';
import { analyzeDocumentText, analyzeDocumentImage } from '../services/geminiService';
import { AdminItem, Category } from '../types';

interface DocumentModalProps {
  onClose: () => void;
  onSave: (item: AdminItem) => void;
  editItem?: AdminItem | null;
  prefilledCategory?: Category;
  availableCategories: Category[];
}

const DocumentModal: React.FC<DocumentModalProps> = ({ onClose, onSave, editItem, prefilledCategory, availableCategories }) => {
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(!!editItem || !!prefilledCategory);
  const [formData, setFormData] = useState<Partial<AdminItem>>({
    title: '',
    provider: '',
    category: prefilledCategory || 'Autre',
    dueDate: new Date().toISOString().split('T')[0],
    amount: undefined,
    status: 'pending'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
      setShowManualForm(true);
    } else if (prefilledCategory) {
      setFormData(prev => ({ ...prev, category: prefilledCategory }));
      setShowManualForm(true);
    }
  }, [editItem, prefilledCategory]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Impossible d'accéder à la caméra.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        processImage(base64, 'image/jpeg');
      }
      stopCamera();
      setIsCameraOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        processImage(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string, mimeType: string) => {
    setLoading(true);
    try {
      const data = await analyzeDocumentImage(base64, mimeType);
      setFormData(prev => ({ ...prev, ...data }));
      setShowManualForm(true);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'analyse IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItem: AdminItem = {
      id: editItem?.id || Math.random().toString(36).substr(2, 9),
      title: formData.title || 'Sans titre',
      provider: formData.provider || 'Inconnu',
      category: formData.category || 'Autre',
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      amount: formData.amount,
      status: formData.status as 'pending' | 'completed' | 'urgent' || 'pending',
      renewalDate: formData.renewalDate,
      notes: formData.notes
    };
    onSave(finalItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { stopCamera(); onClose(); }}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-slate-800">
            {editItem ? `Modifier : ${editItem.title}` : prefilledCategory ? `Nouvelle ligne (${prefilledCategory})` : 'Nouvelle ligne d\'inventaire'}
          </h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isCameraOpen ? (
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none border-dashed m-8"></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { stopCamera(); setIsCameraOpen(false); }} className="flex-1 py-3 font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Annuler</button>
                <button onClick={capturePhoto} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Prendre la photo
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                 <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                 </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Analyse IA en cours...</h4>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">Gemini extrait les informations pour vous.</p>
              </div>
            </div>
          ) : !showManualForm ? (
            <div className="space-y-6">
              <p className="text-center text-slate-500 text-sm">Comment souhaitez-vous ajouter cet élément ?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={startCamera} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs">Photo</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs">PDF/Fichier</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                </button>
                <button onClick={() => setShowManualForm(true)} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 group">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs">Saisie manuelle</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Titre de l'action / ligne</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Révision Auto 60k km"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Prestataire / Organisme</label>
                  <input 
                    type="text" 
                    value={formData.provider} 
                    onChange={e => setFormData({...formData, provider: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Garage ou Assurance"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Catégorie</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Date d'échéance</label>
                  <input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Montant estimé (€)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.amount || ''} 
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-700"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Statut</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="pending">En attente</option>
                    <option value="urgent">Urgent</option>
                    <option value="completed">Terminé / Payé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Notes (optionnel)</label>
                <textarea 
                  value={formData.notes || ''} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                  placeholder="Détails supplémentaires..."
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 bg-white py-2">
                <button 
                  type="button"
                  onClick={() => editItem || prefilledCategory ? onClose() : setShowManualForm(false)}
                  className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors border border-slate-200"
                >
                  {editItem || prefilledCategory ? 'Fermer' : 'Retour'}
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editItem ? 'Sauvegarder' : 'Ajouter à l\'inventaire'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
