// src/pages/InternUpdateRequests/InternUpdateRequests.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { internService, internUpdateRequestService } from '../../services/api';
import styles from './InternUpdateRequests.module.css';

const LS_KEY = 'pending_update_requests:v1';

export default function InternUpdateRequests() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [internsById, setInternsById] = useState({});
  const [error, setError] = useState('');

  if (!isAdmin) return null;

  // util
  const tryCall = async (svc, fn, ...args) => {
    try {
      if (svc && typeof svc[fn] === 'function') {
        return await svc[fn](...args);
      }
    } catch {}
    return null;
  };
  const takeArray = (res) => {
    if (!res) return [];
    const cands = [res, res?.data, res?.data?.items, res?.data?.content, res?.items, res?.content, res?.results];
    for (const c of cands) if (Array.isArray(c)) return c;
    return [];
  };
  const normalize = (r) => {
    const id = r?.id ?? r?.requestId ?? r?._id ?? r?.uuid ?? `LS-${r?.internId}-${r?.requestedEndDate}`;
    const status = String(r?.status ?? r?.requestStatus ?? 'PENDING').toUpperCase();
    const type = String(r?.type ?? r?.requestType ?? 'END_DATE').toUpperCase();
    const internId = r?.internId ?? r?.traineeId ?? r?.userId ?? r?.intern?.internId ?? r?.intern?.id;
    const requestedEndDate =
      r?.requestedEndDate ?? r?.newEndDate ?? r?.endDate ?? r?.fields?.trainingEndDate ?? null;
    const reason = r?.reason ?? r?.comment ?? r?.note ?? '';
    const submittedAt = r?.submittedAt ?? r?.createdAt ?? r?.created_on ?? null;
    return { id, status, type, internId, requestedEndDate, reason, submittedAt, raw: r };
  };
  const isPending = (n) => !n.status || ['PENDING', 'OPEN', 'NEW', 'REQUESTED'].includes(n.status);
  const looksLikeEndDate = (n) => n?.requestedEndDate || (n?.type && (n.type.includes('END_DATE') || n.type.includes('END DATE')));

  const loadFromLS = () => {
    try {
      const s = localStorage.getItem(LS_KEY);
      const arr = s ? JSON.parse(s) : [];
      return Array.isArray(arr) ? arr.map(normalize) : [];
    } catch {
      return [];
    }
  };
  const saveToLS = (arr) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr || [])); } catch {}
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Preferred: API
      let list = takeArray(await tryCall(internUpdateRequestService, 'listPending'));
      if (!list.length) {
        // Fallback: listAll then filter client-side
        list = takeArray(await tryCall(internUpdateRequestService, 'listAll'));
      }
      // Merge with local storage (shadow requests from interns)
      const ls = loadFromLS();
      const normalized = [...list.map(normalize), ...ls];
      const pendingEnd = normalized.filter((n) => isPending(n) && looksLikeEndDate(n));

      // pre-fetch intern info
      const map = {};
      await Promise.all(
        pendingEnd.map(async (n) => {
          if (!n.internId || map[n.internId]) return;
          const info = await tryCall(internService, 'getInternById', n.internId);
          map[n.internId] = info?.data ?? info ?? {};
        })
      );

      setInternsById(map);
      setItems(pendingEnd);
    } catch (e) {
      setError('Failed to load update requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
  const fmtDT = (d) => (d ? new Date(d).toLocaleString() : '—');

  const removeFromLS = (req) => {
    const curr = loadFromLS();
    const next = curr.filter((x) => !(x.internId === req.internId && x.requestedEndDate === req.requestedEndDate));
    saveToLS(next);
  };

  const approve = async (r) => {
    try {
      if (r.internId && r.requestedEndDate) {
        await tryCall(internService, 'updateIntern', r.internId, { trainingEndDate: r.requestedEndDate });
      }
      await tryCall(internUpdateRequestService, 'approve', r.id); // if API exists
      removeFromLS(r);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      await load();
    } catch {
      alert('Approve failed. Please try again.');
    }
  };

  const reject = async (r) => {
    try {
      const reason = window.prompt('Reason for rejection? (optional)') || '';
      await tryCall(internUpdateRequestService, 'reject', r.id, reason); // if API exists
      removeFromLS(r);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      await load();
    } catch {
      alert('Reject failed. Please try again.');
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Pending Profile Update Requests</h2>

      {loading && <p>Loading…</p>}
      {!loading && error && <p className={styles.error}>{error}</p>}
      {!loading && !error && items.length === 0 && <p>No pending requests.</p>}

      {!loading && !error && items.map((r) => {
        const i = internsById[r.internId] || {};
        return (
          <div key={r.id || `${r.internId}-${r.requestedEndDate}`} className={styles.card} style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
            <div className={styles.header}>
              <div>
                <div className={styles.internName}>{i.name || 'Unknown intern'}</div>
                <div className={styles.internMeta}>
                  {`ID: ${i.internCode || i.internId || r.internId || '—'}`} {i.institute ? `| ${i.institute}` : ''}
                </div>
              </div>
              <span className={styles.badge}>Pending</span>
            </div>

            <div className={styles.body}>
              <p><strong>Request Type:</strong> End Date Change</p>
              <p><strong>Current End Date:</strong> {fmtDate(i.trainingEndDate)}</p>
              <p><strong>Requested End Date:</strong> {fmtDate(r.requestedEndDate)}</p>
              {r.reason && <p><strong>Reason:</strong> {r.reason}</p>}
              {r.submittedAt && <p><strong>Submitted:</strong> {fmtDT(r.submittedAt)}</p>}
            </div>

            <div className={styles.actions}>
              <button className={styles.approve} onClick={() => approve(r)}>✓ Approve</button>
              <button className={styles.reject} onClick={() => reject(r)}>✕ Reject</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
