
import React from 'react';
import { 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Zap,
  CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminItem, MentalLoadState } from '../types';

interface DashboardProps {
  items: AdminItem[];
  stats: MentalLoadState;
  onAddClick: () => void;
}

const data = [
  { name: 'Lun', load: 85 },
  { name: 'Mar', load: 78 },
  { name: 'Mer', load: 92 },
  { name: 'Jeu', load: 60 },
  { name: 'Ven', load: 45 },
  { name: 'Sam', load: 30 },
  { name: 'Dim', load: 25 },
];

const Dashboard: React.FC<DashboardProps> = ({ items, stats, onAddClick }) => {
  const urgentItems = items.filter(i => i.status === 'urgent').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bonjour, Marc 👋</h2>
          <p className="text-slate-500">Votre charge mentale est en baisse de 15% cette semaine.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
        >
          <Zap className="w-4 h-4 fill-current group-hover:animate-pulse" />
          Ajouter un document
        </button>
      </div>

      {/* Quick Stats Grid - Expanded to 5 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          label="Charge Mentale" 
          value={`${stats.score}%`} 
          trend="-12%" 
          color="indigo" 
          icon={TrendingDown} 
        />
        <StatCard 
          label="Total Dépenses" 
          value={`${stats.totalExpenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`} 
          trend="Budget suivi" 
          color="violet" 
          icon={CreditCard} 
        />
        <StatCard 
          label="Actions Urgentes" 
          value={stats.urgentCount} 
          trend="Requis" 
          color="red" 
          icon={AlertCircle} 
        />
        <StatCard 
          label="Optimisation" 
          value={`${stats.savingsPotential}€`} 
          trend="Potentiel" 
          color="green" 
          icon={Wallet} 
        />
        <StatCard 
          label="Complété" 
          value={items.length > 0 ? `${Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100)}%` : "100%"} 
          trend="Progression" 
          color="blue" 
          icon={CheckCircle2} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Load Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Évolution de votre Charge Mentale</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Stress estimé
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="load" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            À faire d'urgence
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">TOP 3</span>
          </h3>
          <div className="flex-1 space-y-4">
            {urgentItems.length > 0 ? urgentItems.map(item => (
              <div key={item.id} className="group p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{item.category}</span>
                  <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.dueDate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.provider}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-8">
                <CheckCircle2 className="w-10 h-10 text-green-400 opacity-20" />
                <p className="text-sm font-medium">Tout est à jour !</p>
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100">
            Voir tout mon agenda
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, color, icon: Icon }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${colors[color]}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
