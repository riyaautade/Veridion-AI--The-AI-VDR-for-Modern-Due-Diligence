import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('buyer_lawyer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({ email, password, full_name: fullName, role, company_name: company });
      navigate('/login');
    } catch {
      setError('Registration failed. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/95 p-8 shadow-card backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Create your account</p>
        <h1 className="mt-4 text-3xl font-semibold">Register for VDR AI Copilot</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              placeholder="Jane Doe"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Company Name</span>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              placeholder="Acme Corp"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              placeholder="name@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
            >
              <option value="seller_admin">Seller admin</option>
              <option value="buyer_lawyer">Buyer lawyer</option>
              <option value="buyer_finance">Buyer finance</option>
              <option value="buyer_executive">Buyer executive</option>
            </select>
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-3xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-white underline-offset-4 transition hover:text-brand-300"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
