import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getMyCompany, CompanyDetail } from '../services/companies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function CompanyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyCompany()
      .then(res => setCompany(res.data))
      .catch(err => console.error("Failed to fetch company", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="p-10 text-center">Loading company details...</div>;
  }

  if (!company) {
    return <div className="p-10 text-center">Failed to load company.</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Organization Settings</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{company.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Details about your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <p className="text-sm font-semibold text-slate-500">Company Name</p>
                <p className="text-base text-slate-900">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Registered On</p>
                <p className="text-base text-slate-900">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Roster</CardTitle>
            <CardDescription>Users registered under {company.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {company.employees.map((emp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{emp.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.email}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.role}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${emp.is_active ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {company.employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
