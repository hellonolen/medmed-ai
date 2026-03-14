import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Users, Building2, TrendingUp, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { AIKeySetup } from "@/components/AIKeySetup";
import { useToast } from "@/hooks/use-toast";

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

const ADMIN_TOKEN_KEY = 'medmed_admin_jwt';

interface Sponsor {
  id: string;
  email: string;
  name: string | null;
  companyName: string;
  package: string;
  isActive: boolean;
  isOnWaitlist: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  role: string;
  plan: string;
  trial_ends_at: number | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalSponsors: number;
  activeSponsors: number;
  paidUsers: number;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner } = useAdmin();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem(ADMIN_TOKEN_KEY));
  const [adminSecret, setAdminSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sponsors' | 'users'>('overview');

  useEffect(() => {
    if (!isAdmin && !isOwner) navigate("/");
  }, [isAdmin, isOwner, navigate]);

  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [statsRes, sponsorsRes, usersRes] = await Promise.all([
        fetch(`${WORKER_URL}/api/admin/stats`, { headers }),
        fetch(`${WORKER_URL}/api/sponsor/list`),
        fetch(`${WORKER_URL}/api/admin/users`, { headers }),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
        return;
      }

      const [statsData, sponsorsData, usersData] = await Promise.all([
        statsRes.json() as any,
        sponsorsRes.json() as any,
        usersRes.json() as any,
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (sponsorsData.success) setSponsors(sponsorsData.sponsors || []);
      if (usersData.success) setUsers(usersData.users || []);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [adminToken, toast]);

  useEffect(() => {
    if (adminToken) fetchData();
  }, [adminToken, fetchData]);

  const verifyAdmin = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecret }),
      });
      const data: any = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setAdminToken(data.token);
        setAdminSecret('');
        toast({ title: 'Admin access granted' });
      } else {
        toast({ title: 'Invalid admin secret', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Verification failed', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleSponsor = async (sponsor: Sponsor) => {
    if (!adminToken) return;
    setActivatingId(sponsor.id);
    try {
      const res = await fetch(`${WORKER_URL}/api/admin/activate-sponsor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ sponsorId: sponsor.id, activate: !sponsor.isActive }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, isActive: !s.isActive, isOnWaitlist: false } : s));
        toast({ title: !sponsor.isActive ? `${sponsor.companyName} activated — email sent` : `${sponsor.companyName} deactivated` });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update sponsor', variant: 'destructive' });
    } finally {
      setActivatingId(null);
    }
  };

  const exportCSV = (data: any[], headers: string[], filename: string) => {
    const rows = [headers.join(','), ...data.map(r => Object.values(r).map(v => `"${v}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
  };

  if (!isAdmin && !isOwner) return null;

  // Admin secret gate — shown only when no valid token
  if (!adminToken) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{isOwner ? 'Owner Dashboard' : 'Admin Dashboard'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Enter your admin secret to access real-time data.</p>
            <Input
              type="password"
              placeholder="Admin secret..."
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
            />
            <Button className="w-full" onClick={verifyAdmin} disabled={isVerifying || !adminSecret}>
              {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Access Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isOwner ? t("owner.dashboard.owner_title", "Owner Dashboard") : t("owner.dashboard.title", "Admin Dashboard")}
          </h1>
          <p className="text-gray-500 mt-1">Real-time platform data from Cloudflare D1</p>
        </div>
        <div className="flex items-center gap-2">
          <AIKeySetup />
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-5 w-5 text-primary" /> },
            { label: 'Paid Users', value: stats.paidUsers, icon: <TrendingUp className="h-5 w-5 text-green-500" /> },
            { label: 'Total Sponsors', value: stats.totalSponsors, icon: <Building2 className="h-5 w-5 text-blue-500" /> },
            { label: 'Active Sponsors', value: stats.activeSponsors, icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-3xl font-bold">{s.value}</p>
                  </div>
                  {s.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'sponsors', 'users'] as const).map(tab => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)} className="capitalize">
            {tab}
          </Button>
        ))}
      </div>

      {/* Sponsors Tab */}
      {activeTab === 'sponsors' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sponsors ({sponsors.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV(sponsors, ['ID', 'Email', 'Company', 'Package', 'Active', 'Created'], 'sponsors.csv')}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? <p className="text-gray-500 text-sm">Loading...</p> : sponsors.length === 0 ? <p className="text-gray-500 text-sm italic">No sponsors yet.</p> : sponsors.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{s.companyName}</p>
                    <p className="text-sm text-gray-500">{s.email} · {s.package}</p>
                    <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.isActive ? 'default' : s.isOnWaitlist ? 'secondary' : 'outline'}>
                      {s.isActive ? 'Active' : s.isOnWaitlist ? 'Waitlist' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant={s.isActive ? 'outline' : 'default'}
                      disabled={activatingId === s.id}
                      onClick={() => toggleSponsor(s)}
                    >
                      {activatingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : s.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      <span className="ml-1">{s.isActive ? 'Deactivate' : 'Activate'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Users ({users.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV(users, ['ID','Email','Name','Plan','Role','Trial Ends','Joined'], 'users.csv')}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? <p className="text-gray-500 text-sm">Loading...</p> : users.length === 0 ? <p className="text-gray-500 text-sm italic">No users yet.</p> : users.map(u => {
                const now = Math.floor(Date.now() / 1000);
                const trialSecs = u.trial_ends_at ? u.trial_ends_at - now : null;
                const trialDays = trialSecs !== null ? Math.ceil(trialSecs / 86400) : null;
                const trialLabel = trialDays === null ? null : trialDays <= 0 ? 'Trial ended' : `${trialDays}d left`;
                const trialColor = trialDays !== null && trialDays <= 0 ? 'text-red-500' : trialDays !== null && trialDays <= 2 ? 'text-amber-500 font-semibold' : 'text-gray-400';
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.name || 'No name'} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                      {trialLabel && <p className={`text-xs mt-0.5 ${trialColor}`}>{trialLabel}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' && <Badge variant="secondary" className="text-xs">admin</Badge>}
                      <Badge variant={u.plan === 'free' || !u.plan ? 'outline' : 'default'} className="capitalize text-xs">{u.plan || u.tier}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Pending Activations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sponsors.filter(s => s.isOnWaitlist && !s.isActive).length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No pending sponsors.</p>
                ) : sponsors.filter(s => s.isOnWaitlist && !s.isActive).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{s.companyName}</p>
                      <p className="text-xs text-gray-500">{s.package} · {s.email}</p>
                    </div>
                    <Button size="sm" disabled={activatingId === s.id} onClick={() => toggleSponsor(s)}>
                      {activatingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Activate'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <p className="text-sm">{u.email}</p>
                    <Badge variant="outline" className="capitalize text-xs">{u.tier}</Badge>
                  </div>
                ))}
                {users.length === 0 && <p className="text-gray-500 text-sm italic">No users yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
