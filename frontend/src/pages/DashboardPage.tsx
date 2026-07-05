import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../services/dashboard';
import useAuth from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then((res) => {
      setStats(res.data);
    }).catch((err) => {
      console.error('Failed to fetch dashboard stats', err);
    });
  }, []);

  const cards = [
    { title: 'Total Deals', value: stats?.total_deals.toString() ?? '0', tone: 'slate' },
    { title: 'Total Documents', value: stats?.total_documents.toString() ?? '0', tone: 'slate' },
    { title: 'Total Risks Found', value: stats?.total_risks.toString() ?? '0', tone: 'amber' },
    { title: 'Active Deal Members', value: stats?.active_deal_members.toString() ?? '0', tone: 'blue' },
  ];

  const handleSignOut = () => {
    window.localStorage.removeItem('vdr_token');
    navigate('/login');
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">VDR AI Copilot</p>
          <h1 className="text-3xl font-semibold text-slate-900">Deal Workspace Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A secure due diligence workspace for deal documents, AI search, and risk tracking.
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role?.startsWith('seller') && (
            <Link
              to="/company"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50"
            >
              Company
            </Link>
          )}
          <Link
            to="/deals"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
          >
            View deals
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50"
          >
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">
              {stats === null ? <span className="animate-pulse text-slate-300">...</span> : card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900">Ask the AI</h2>
          <p className="mt-3 text-sm text-slate-600 flex-1">
            Use our RAG-powered assistant to ask legal questions based on uploaded deal documents.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/deals"
              className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
            >
              Open a deal to ask AI
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900">Risk Summary</h2>
          <p className="mt-3 text-sm text-slate-600 flex-1">
            Review high-risk contracts, missing clause alerts, and evidence-backed findings across your deals.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/deals"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50"
            >
              Open a deal to view risks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
