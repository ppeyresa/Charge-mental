
import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  TrendingDown, 
  ShieldCheck, 
  Zap,
  RefreshCw,
  ExternalLink,
  Gift,
  Tag
} from 'lucide-react';
import { Insight } from '../types';

interface InsightsProps {
  insights: Insight[];
  advisorMessage: string;
  onRefresh: () => void;
  isLoading: boolean;
}

const Insights: React.FC<InsightsProps> = ({ insights, advisorMessage, onRefresh, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Intelligence & Économies
            <Sparkles className="w-6 h-6 text-amber-400 fill-current" />
          </h2>
          <p className="text-sm text-slate-500">Votre IA analyse le marché pour optimiser vos contrats.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl border border-indigo-100 transition-all shadow-sm disabled:opacity-50 font-bold text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Mettre à jour les offres
        </button>
      </div>

      {/* Advisor Message */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
               <Lightbulb className="w-5 h-5" />
             </div>
             <span className="text-sm font-semibold uppercase tracking-widest text-indigo-100">Flash Conseil</span>
          </div>
          <p className="text-lg md:text-xl font-medium leading-relaxed italic">
            "{advisorMessage}"
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Insights Section Titles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.length > 0 ? insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        )) : !isLoading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Zap className="w-8 h-8 opacity-20" />
             </div>
             <p className="font-medium">Analyse en cours ou aucun abonnement détecté.</p>
             <p className="text-xs mt-1">Ajoutez vos contrats dans l'inventaire pour activer l'IA.</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      )}
    </div>
  );
};

interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const isDeal = insight.type === 'deal';

  const getIcon = () => {
    switch(insight.type) {
      case 'deal': return <Gift className="w-5 h-5 text-pink-600" />;
      case 'optimization': return <TrendingDown className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      default: return <Tag className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getTheme = () => {
    switch(insight.type) {
      case 'deal': return 'border-pink-100 hover:border-pink-200 bg-pink-50/20';
      case 'optimization': return 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/20';
      case 'warning': return 'border-amber-100 hover:border-amber-200 bg-amber-50/20';
      default: return 'border-indigo-100 hover:border-indigo-200 bg-indigo-50/20';
    }
  };

  const handleAction = () => {
    if (insight.url) {
      window.open(insight.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${getTheme()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {getIcon()}
          </div>
          <h4 className="font-bold text-slate-800 leading-tight">{insight.title}</h4>
        </div>
        {insight.savings && (
          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
            -{insight.savings}
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-600 leading-relaxed mb-8 flex-1">
        {insight.description}
      </p>

      <button 
        onClick={handleAction}
        className={`flex items-center justify-between w-full py-3.5 px-5 rounded-2xl text-sm font-bold shadow-sm transition-all group-hover:shadow-md ${
          isDeal 
          ? 'bg-pink-600 text-white hover:bg-pink-700' 
          : 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'
        }`}
      >
        <span className="flex items-center gap-2">
          {insight.actionLabel}
          {isDeal && <ExternalLink className="w-3.5 h-3.5" />}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Insights;
