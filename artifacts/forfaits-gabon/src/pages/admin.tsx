import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type Period = '24h' | 'week' | 'month' | 'year';

interface AdminStats {
  period: string;
  since: string;
  stats: {
    totalTransactions: number;
    totalSuccess: number;
    totalFailed: number;
    totalPending: number;
    totalCollected: number;
  };
  recent: {
    id: number;
    forfaitId: string;
    operateurForfait: string;
    paymentOperator: string;
    beneficiairePhone: string;
    montant: number;
    statut: string;
    reference: string;
    createdAt: string;
  }[];
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchStats(period: Period): Promise<AdminStats> {
  const res = await fetch(`${BASE}/api/admin/stats?period=${period}`);
  if (!res.ok) throw new Error('Erreur chargement stats');
  return res.json();
}

const PERIOD_LABELS: Record<Period, string> = {
  '24h': '24 heures',
  week: '7 jours',
  month: '30 jours',
  year: '12 mois',
};

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatutBadge({ statut }: { statut: string }) {
  const s = statut.toLowerCase();
  if (s === 'success') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Succès</span>;
  if (s === 'failed') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Échec</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
}

export default function AdminPanel() {
  const [period, setPeriod] = useState<Period>('24h');

  const { data, isLoading, error, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats', period],
    queryFn: () => fetchStats(period),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={`${BASE}/logo-netforfait.png`} alt="NetForfait Gabon" className="h-8 object-contain" />
          <span className="font-bold text-lg text-gray-900">Panneau Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Actualiser
          </button>
          <a
            href={BASE || '/'}
            className="text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            ← Retour au site
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Period filter */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm font-medium text-gray-600 mr-2">Période :</span>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[#E4002B] text-white shadow-sm'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-700 text-sm">
            Erreur lors du chargement des statistiques.
          </div>
        )}

        {data && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total collecté</p>
                <p className="text-2xl font-bold text-gray-900">{formatXAF(data.stats.totalCollected)}</p>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalTransactions}</p>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Succès</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.totalSuccess}</p>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Échecs</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.totalFailed}</p>
              </div>
            </div>

            {/* Success rate bar */}
            {data.stats.totalTransactions > 0 && (
              <div className="bg-white rounded-2xl border p-6 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">Taux de succès</p>
                  <p className="text-sm font-bold text-gray-900">
                    {Math.round((data.stats.totalSuccess / data.stats.totalTransactions) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((data.stats.totalSuccess / data.stats.totalTransactions) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{data.stats.totalSuccess} réussis</span>
                  <span>{data.stats.totalFailed} échoués · {data.stats.totalPending} en attente</span>
                </div>
              </div>
            )}

            {/* Recent transactions table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">Transactions récentes</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {data.recent.length} transactions sur les {PERIOD_LABELS[period]}
                </p>
              </div>

              {data.recent.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-lg font-medium">Aucune transaction</p>
                  <p className="text-sm mt-1">Pas encore de données pour cette période.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-500">Référence</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-500">Bénéficiaire</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-500">Forfait</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-500">Paiement</th>
                        <th className="text-right px-6 py-3 font-medium text-gray-500">Montant</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-500">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.recent.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-gray-600">{tx.reference}</td>
                          <td className="px-6 py-3 text-gray-700">{tx.beneficiairePhone}</td>
                          <td className="px-6 py-3">
                            <span className={`font-medium ${tx.operateurForfait === 'airtel' ? 'text-[#E4002B]' : 'text-[#F7941D]'}`}>
                              {tx.forfaitId}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{tx.paymentOperator}</td>
                          <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatXAF(tx.montant)}</td>
                          <td className="px-6 py-3 text-center">
                            <StatutBadge statut={tx.statut} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
