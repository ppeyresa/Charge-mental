
import React, { useState } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { analyzeDocumentText } from '../services/geminiService';
import { AdminItem, Category } from '../types';

interface AddDocumentModalProps {
  onClose: () => void;
  onAdd: (item: AdminItem) => void;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [result, setResult] = useState<Partial<AdminItem> | null>(null);

  const handleSimulateOCR = async () => {
    if (!ocrText.trim()) return;
    
    setLoading(true);
    try {
      const extractedData = await analyzeDocumentText(ocrText);
      setResult(extractedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      const newItem: AdminItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || 'Nouveau Document',
        provider: result.provider || 'Inconnu',
        category: (result.category as Category) || 'Autre',
        dueDate: result.dueDate || new Date().toISOString().split('T')[0],
        amount: result.amount,
        status: 'pending',
        renewalDate: result.renewalDate
      };
      onAdd(newItem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Ajouter un document</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!result ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 group">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-sm">Prendre en photo</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 group">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-sm">Télécharger PDF</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulation d'analyse (Copiez-collez du texte ici)</label>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ex: Facture EDF n°8273... Total TTC: 82.50€... Date limite de paiement: 25/11/2024"
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSimulateOCR}
                disabled={loading || !ocrText}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyser avec l\'IA'}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Analyse terminée ! Voici ce que l'IA a détecté.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Titre</p>
                   <p className="font-semibold text-slate-800">{result.title}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Fournisseur</p>
                   <p className="font-semibold text-slate-800">{result.provider}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Catégorie</p>
                   <p className="font-semibold text-slate-800">{result.category}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Échéance</p>
                   <p className="font-semibold text-slate-800">{result.dueDate}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Montant</p>
                   <p className="font-semibold text-slate-800">{result.amount}€</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Refaire
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
