import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { updateMe } from '../services/users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setError('');

    try {
      await updateMe({
        full_name: fullName,
        password: password ? password : undefined,
      });
      setMessage('Profile updated successfully!');
      setPassword('');
      // In a real app, we might need to refresh the token or global user state here
    } catch (err: any) {
      setError(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Profile</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              {user.company && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Company</p>
                  <p className="font-medium">{(user.company as any).name || user.company}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information or password.</CardDescription>
          </CardHeader>
          <CardContent>
            {message && <div className="mb-4 rounded p-3 bg-green-50 text-green-700 text-sm font-medium border border-green-200">{message}</div>}
            {error && <div className="mb-4 rounded p-3 bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">{error}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <Button type="submit" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
