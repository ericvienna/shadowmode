'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Users, CheckCircle, AlertCircle, Lock, Map, ChevronRight, Save } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DBState { id: string; name: string; abbreviation: string; }
interface DBCity  { id: string; name: string; state_id: string; }
interface DBMilestone {
  id: string; city_id: string; type: string;
  status: string; date: string | null; value: number | null; notes: string | null;
}

const MILESTONE_TYPES: Record<string, string> = {
  tesla_insurance_available:    'Tesla Insurance Available',
  permit_applied:               'Permit Applied',
  permit_received:              'Permit Received',
  vehicle_operator_ads:         'Vehicle Operator ADS',
  robotaxi_fleet_support_ads:   'Fleet Support ADS',
  final_regulatory_approval:    'Final Regulatory Approval',
  route_validation_tests:       'Route Validation Tests',
  robotaxi_app_access_opens:    'App Access Opens',
  public_test_program_launched: 'Public Test Program',
  geofence_expanded:            'Geofence Expanded',
  vehicles_deployed_20_plus:    'Vehicles Deployed 20+',
  no_safety_monitor:            'No Safety Monitor',
};

const STATUS_OPTIONS = ['not_started', 'in_progress', 'completed'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<Status, string> = {
  not_started: 'text-neutral-500',
  in_progress: 'text-yellow-400',
  completed:   'text-green-400',
};

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={(e) => { e.preventDefault(); if (password) onAuth(password); }} className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white">Admin Access</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 mb-4"
            autoFocus
          />
          <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-neutral-200 transition-colors">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Email Tab ────────────────────────────────────────────────────────────────

function EmailTab({ password, subscriberCount }: { password: string; subscriberCount: number | null }) {
  const [subject, setSubject]   = useState('');
  const [headline, setHeadline] = useState('');
  const [body, setBody]         = useState('');
  const [ctaText, setCtaText]   = useState('View Dashboard');
  const [ctaUrl, setCtaUrl]     = useState('https://shadowmode.us');
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/send-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, subject, headline, body, ctaText: ctaText || undefined, ctaUrl: ctaUrl || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
        setSubject(''); setHeadline(''); setBody('');
      } else {
        setResult({ success: false, message: data.error || 'Failed to send' });
      }
    } catch {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Send Update</h2>
          <p className="text-neutral-500 text-sm mt-1">Broadcast to all subscribers</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2">
          <Users className="w-4 h-4 text-neutral-500" />
          <span className="text-white font-semibold">{subscriberCount ?? '...'}</span>
          <span className="text-neutral-500 text-sm">subscribers</span>
        </div>
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${result.success ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{result.message}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-neutral-400 text-sm mb-2">Email Subject Line</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Austin Goes Fully Driverless" required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
          </div>
          <div>
            <label className="block text-neutral-400 text-sm mb-2">Headline (in email body)</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g., Tesla Removes Safety Monitors in Austin" required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
          </div>
          <div>
            <label className="block text-neutral-400 text-sm mb-2">Message Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your update here..." rows={6} required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Button Text (optional)</label>
              <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="View Dashboard" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
            </div>
            <div>
              <label className="block text-neutral-400 text-sm mb-2">Button URL</label>
              <input type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://shadowmode.us" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
            </div>
          </div>
        </div>
        <button type="submit" disabled={sending} className="w-full bg-green-500 text-black font-semibold py-4 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {sending ? (<><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending...</>) : (<><Send className="w-5 h-5" />Send to {subscriberCount ?? '...'} Subscribers</>)}
        </button>
        <p className="text-neutral-600 text-xs text-center">This will immediately send an email to all subscribers. Double-check before sending.</p>
      </form>
    </div>
  );
}

// ─── Milestones Tab ───────────────────────────────────────────────────────────

function MilestonesTab({ password }: { password: string }) {
  const [states, setStates]         = useState<DBState[]>([]);
  const [cities, setCities]         = useState<DBCity[]>([]);
  const [milestones, setMilestones] = useState<DBMilestone[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity]   = useState<string | null>(null);

  // local edits: cityId+type → {status,date,value,notes}
  const [edits, setEdits] = useState<Record<string, Partial<DBMilestone>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<Record<string, 'ok' | 'err'>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/milestones', {
        headers: { 'x-admin-password': password },
      });
      if (!res.ok) { setError('Failed to load data'); return; }
      const data = await res.json();
      setStates(data.states);
      setCities(data.cities);
      setMilestones(data.milestones);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const filteredCities = selectedState
    ? cities.filter((c) => c.state_id === selectedState)
    : [];

  const cityMilestones = selectedCity
    ? Object.keys(MILESTONE_TYPES).map((type) => {
        const existing = milestones.find((m) => m.city_id === selectedCity && m.type === type);
        return existing ?? { id: '', city_id: selectedCity, type, status: 'not_started', date: null, value: null, notes: null };
      })
    : [];

  function getEdit(cityId: string, type: string): Partial<DBMilestone> {
    return edits[`${cityId}:${type}`] ?? {};
  }

  function setEdit(cityId: string, type: string, field: keyof DBMilestone, val: string | number | null) {
    const key = `${cityId}:${type}`;
    setEdits((prev) => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  }

  function getMilestoneValue(m: DBMilestone, field: keyof DBMilestone): string | number | null {
    const edit = getEdit(m.city_id, m.type);
    if (field in edit) return edit[field] as string | number | null;
    return m[field] as string | number | null;
  }

  async function save(m: DBMilestone) {
    const key = `${m.city_id}:${m.type}`;
    setSaving(key);
    try {
      const edit = getEdit(m.city_id, m.type);
      const payload = {
        city_id: m.city_id,
        type: m.type,
        status:  edit.status  !== undefined ? edit.status  : m.status,
        date:    edit.date    !== undefined ? edit.date    : m.date,
        value:   edit.value   !== undefined ? edit.value   : m.value,
        notes:   edit.notes   !== undefined ? edit.notes   : m.notes,
      };
      const res = await fetch('/api/admin/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaveResult((p) => ({ ...p, [key]: 'ok' }));
        // Update local milestones cache
        setMilestones((prev) => {
          const idx = prev.findIndex((x) => x.city_id === m.city_id && x.type === m.type);
          const updated = { ...m, ...payload };
          if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
          return [...prev, updated];
        });
        // Clear edit
        setEdits((p) => { const n = { ...p }; delete n[key]; return n; });
        setTimeout(() => setSaveResult((p) => { const n = { ...p }; delete n[key]; return n; }), 2000);
      } else {
        setSaveResult((p) => ({ ...p, [key]: 'err' }));
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="text-neutral-500 text-sm animate-pulse">Loading data...</div>;
  if (error)   return <div className="text-red-400 text-sm">{error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Milestones</h2>
        <p className="text-neutral-500 text-sm mt-1">Edit milestone status and dates per city</p>
      </div>

      {/* State + City selectors */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-neutral-500 text-xs uppercase mb-2">State</label>
          <select
            value={selectedState ?? ''}
            onChange={(e) => { setSelectedState(e.target.value || null); setSelectedCity(null); }}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-600"
          >
            <option value="">Select state…</option>
            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedState && (
          <div className="flex-1 min-w-[180px]">
            <label className="block text-neutral-500 text-xs uppercase mb-2">City</label>
            <select
              value={selectedCity ?? ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-600"
            >
              <option value="">Select city…</option>
              {filteredCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      {selectedCity && (
        <div className="flex items-center gap-1 text-xs text-neutral-500 mb-4">
          <span>{states.find((s) => s.id === selectedState)?.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{cities.find((c) => c.id === selectedCity)?.name}</span>
        </div>
      )}

      {/* Milestone rows */}
      {selectedCity ? (
        <div className="space-y-2">
          {cityMilestones.map((m) => {
            const key = `${m.city_id}:${m.type}`;
            const isDirty = key in edits;
            const isSaving = saving === key;
            const result = saveResult[key];
            const currentStatus = (getMilestoneValue(m, 'status') as Status) ?? 'not_started';

            return (
              <div key={m.type} className={`bg-neutral-900 border rounded-xl p-4 transition-colors ${isDirty ? 'border-yellow-500/40' : 'border-neutral-800'}`}>
                <div className="flex items-start gap-4">
                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-white">{MILESTONE_TYPES[m.type] ?? m.type}</span>
                      {isDirty && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">unsaved</span>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Status */}
                      <div>
                        <label className="block text-neutral-500 text-[10px] uppercase mb-1">Status</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => setEdit(m.city_id, m.type, 'status', e.target.value)}
                          className={`w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-600 ${STATUS_COLORS[currentStatus]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="text-white">{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                      {/* Date */}
                      <div>
                        <label className="block text-neutral-500 text-[10px] uppercase mb-1">Date</label>
                        <input
                          type="date"
                          value={(getMilestoneValue(m, 'date') as string) ?? ''}
                          onChange={(e) => setEdit(m.city_id, m.type, 'date', e.target.value || null)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600"
                        />
                      </div>
                      {/* Value */}
                      <div>
                        <label className="block text-neutral-500 text-[10px] uppercase mb-1">Value</label>
                        <input
                          type="number"
                          value={(getMilestoneValue(m, 'value') as number) ?? ''}
                          onChange={(e) => setEdit(m.city_id, m.type, 'value', e.target.value ? Number(e.target.value) : null)}
                          placeholder="—"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                        />
                      </div>
                      {/* Notes */}
                      <div>
                        <label className="block text-neutral-500 text-[10px] uppercase mb-1">Notes</label>
                        <input
                          type="text"
                          value={(getMilestoneValue(m, 'notes') as string) ?? ''}
                          onChange={(e) => setEdit(m.city_id, m.type, 'notes', e.target.value || null)}
                          placeholder="—"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => save(m)}
                    disabled={isSaving || !isDirty}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all mt-5 ${
                      result === 'ok' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      result === 'err' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      isDirty ? 'bg-white text-black hover:bg-neutral-200' :
                      'bg-neutral-800 text-neutral-600 border border-neutral-700 cursor-default'
                    }`}
                  >
                    {isSaving ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : result === 'ok' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    {isSaving ? 'Saving' : result === 'ok' ? 'Saved' : result === 'err' ? 'Error' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
          <Map className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Select a state and city to edit milestones</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword]             = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab]           = useState<'email' | 'milestones'>('milestones');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/subscribe')
      .then((res) => res.json())
      .then((data) => setSubscriberCount(data.count))
      .catch(() => setSubscriberCount(null));
  }, []);

  if (!isAuthenticated) {
    return <LoginGate onAuth={(pw) => { setPassword(pw); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <a href="/" className="text-neutral-500 hover:text-white text-sm transition-colors">← Dashboard</a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 mb-8 w-fit">
          {(['milestones', 'email'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab === 'email' ? 'Send Email' : 'Milestones'}
            </button>
          ))}
        </div>

        {activeTab === 'milestones' ? (
          <MilestonesTab password={password} />
        ) : (
          <EmailTab password={password} subscriberCount={subscriberCount} />
        )}
      </div>
    </div>
  );
}
