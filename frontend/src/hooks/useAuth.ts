import { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company?: { id: number; name: string } | string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('vdr_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => {
        window.localStorage.removeItem('vdr_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, setUser };
}
