import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { internService, internUpdateRequestService } from '../../services/api';
import styles from './InternUpdateRequests.module.css';

const DiffRow = ({ label, beforeV, afterV }) => {
  const changed = (beforeV ?? '') !== (afterV ?? '');
  return (
    <tr className={changed ? styles.changed : ''}>
      <td>{label}</td>
      <td>{beforeV ?? '-'}</td>
      <td>{afterV ?? '-'}</td>
    </tr>
  );
};

export default function InternUpdateRequests() {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState([]);
  const [internsById, setInternsById] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await internUpdateRequestService.listPending();
    const list = res.data;
    setPending(list);

    // fetch current intern data for diffs
    const byId = {};
    await Promise.all(list.map(async r => {
      const i = await internService.getInternById(r.internId);
      byId[r.internId] = i.data;
    }));
    setInternsById(byId);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!isAdmin) return <p>Admins only.</p>;
  if (loading) return <p>Loading…</p>;

  const approve = async (id) => {
    await internUpdateRequestService.approve(id);
    await load();
  };
  const reject = async (id) => {
    const reason = prompt('Reason for rejection? (optional)');
    await internUpdateRequestService.reject(id, reason || '');
    await load();
  };

  return (
    <div className={styles.wrap}>
      <h2>Pending Intern Profile Update Requests</h2>
      {pending.length === 0 ? <p>No pending requests.</p> : pending.map(r => {
        const cur = internsById[r.internId] || {};
        return (
          <div key={r.id} className={styles.card}>
            <div className={styles.header}>
              <div>
                <strong>Intern:</strong> {cur.name} ({cur.internCode})<br/>
                <strong>Requested:</strong> {new Date(r.submittedAt).toLocaleString()}
              </div>
              <div className={styles.actions}>
                <button onClick={() => approve(r.id)} className={styles.approve}>Approve</button>
                <button onClick={() => reject(r.id)} className={styles.reject}>Reject</button>
              </div>
            </div>
            <table className={styles.diffTable}>
              <thead>
                <tr><th>Field</th><th>Current</th><th>Proposed</th></tr>
              </thead>
              <tbody>
                <DiffRow label="Name" beforeV={cur.name} afterV={r.name}/>
                <DiffRow label="Email" beforeV={cur.email} afterV={r.email}/>
                <DiffRow label="Institute" beforeV={cur.institute} afterV={r.institute}/>
                <DiffRow label="Training Start" beforeV={cur.trainingStartDate} afterV={r.trainingStartDate}/>
                <DiffRow label="Training End" beforeV={cur.trainingEndDate} afterV={r.trainingEndDate}/>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
