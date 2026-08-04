import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createDeal } from '../services/deals';
import useAuth from '../hooks/useAuth';

import { Company, listCompanies } from '../services/companies';
import { DealSummary } from '../services/deals';

export default function DealsPage() {
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentCompanyId = typeof user?.company === 'object' && user.company !== null ? user.company.id : undefined;
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [buyerCompanyId, setBuyerCompanyId] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<DealSummary[]>('/deals'),
      listCompanies()
    ])
      .then(([dealsRes, companiesRes]) => {
        setDeals(dealsRes.data);
        setCompanies(companiesRes.data);
      })
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const response = await createDeal({ name, buyer_company_id: Number(buyerCompanyId) });
      navigate(`/deals/${response.data.id}`);
    } catch (err: any) {
      setCreating(false);
      alert('Error creating deal: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Deal workspaces</p>
          <h1 className="text-3xl font-semibold text-slate-900">Active deals</h1>
        </div>
        <div className="flex items-center gap-3">
          {user?.role?.startsWith('seller') && (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Deal name" className="rounded-full border border-slate-200 px-3 py-2" required />
              <select
                value={buyerCompanyId}
                onChange={(e) => setBuyerCompanyId(e.target.value)}
                className="rounded-full border border-slate-200 px-3 py-2"
                required
              >
                <option value="" disabled>Select Buyer Company</option>
                {companies
                  .filter(c => c.id !== currentCompanyId)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-white" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
            </form>
          )}

          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-sm uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Deal</th>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading deals...
                </td>
              </tr>
            ) : deals.length ? (
              deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 text-sm font-medium text-slate-900">{deal.name}</td>
                  <td className="px-6 py-5 text-sm text-slate-700">{deal.buyer_company?.name}</td>
                  <td className="px-6 py-5 text-sm text-slate-700">{deal.seller_company?.name}</td>
                  <td className="px-6 py-5 text-sm text-slate-900">{deal.status}</td>
                  <td className="px-6 py-5 text-sm text-slate-700">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No deals available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
