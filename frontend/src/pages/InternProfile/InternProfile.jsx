// src/pages/InternProfile/InternProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  internService,
  teamMemberService,
  projectService,
  teamService,
  internUpdateRequestService, // used for end-date approval
} from '../../services/api';
import { academicService } from '../../services/universityCatalog';
import { useAuth } from '../../contexts/AuthContext';
import { TeamForm, ProjectForm } from '../../components';
import { FiUsers, FiFolder, FiSearch } from 'react-icons/fi';
import styles from './InternProfile.module.css';

const LS_KEY = 'pending_update_requests:v1';

/* ========================================================================== */
/*                              WIZARD (MODAL)                                 */
/* ========================================================================== */
const Wizard = ({ isOpen, onClose, intern, onAfterSubmit }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState('overview');
  const [picks, setPicks] = useState({
    specializations: false,
    academic: false,
    skills: false,
    enddate: false,
  });

  // immediate update fields
  const [specializations, setSpecializations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // end date request
  const [newEndDate, setNewEndDate] = useState('');
  const [endDateReason, setEndDateReason] = useState('');

  const [busy, setBusy] = useState(false);

  // ---------- Academic (live) ----------
  const [universityQuery, setUniversityQuery] = useState('');
  const [university, setUniversity] = useState(''); // chosen university name
  const [universities, setUniversities] = useState([]);
  const [uLoading, setULoading] = useState(false);
  const [uOpen, setUOpen] = useState(false); // suggestions visible
  const [uHi, setUHi] = useState(-1);

  const [faculty, setFaculty] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [fLoading, setFLoading] = useState(false);

  const [degreeProgram, setDegreeProgram] = useState('');
  const [programs, setPrograms] = useState([]);
  const [pLoading, setPLoading] = useState(false);

  // caches (avoid refetch)
  const facultiesCache = useMemo(() => new Map(), []);
  const programsCache = useMemo(() => new Map(), []);

  // today (yyyy-mm-dd)
  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  // ---------------- helpers ----------------
  const toTitleCase = (s = '') =>
    s
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  const norm = (s = '') => s.trim().toLowerCase();

  // --------- University typeahead (debounced) ----------
  useEffect(() => {
    if (!picks.academic) return;
    if (!universityQuery || university) return;

    const t = setTimeout(async () => {
      try {
        setULoading(true);
        const list = await academicService.searchUniversitiesLK(universityQuery);
        setUniversities(Array.isArray(list) ? list : []);
        setUOpen(true);
        setUHi(-1);
      } catch {
        setUniversities([]);
        setUOpen(false);
      } finally {
        setULoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [universityQuery, university, picks.academic]);

  // --------- Faculties for selected university ----------
  const loadFaculties = async (uniName) => {
    setFaculty('');
    setDegreeProgram('');
    setPrograms([]);
    if (!uniName) {
      setFaculties([]);
      return;
    }
    if (facultiesCache.has(uniName)) {
      setFaculties(facultiesCache.get(uniName));
      return;
    }
    try {
      setFLoading(true);
      const list = await academicService.getFacultiesLK(uniName);
      const items = Array.isArray(list) ? list : [];
      facultiesCache.set(uniName, items);
      setFaculties(items);
    } catch {
      setFaculties([]);
    } finally {
      setFLoading(false);
    }
  };

  // keep faculties in sync if university changes elsewhere
  useEffect(() => {
    if (!university) return;
    if (faculties.length > 0) return;
    loadFaculties(university);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [university]);

  // --------- Programs for selected faculty ----------
  const loadPrograms = async (uniName, facName) => {
    setDegreeProgram('');
    if (!uniName || !facName) {
      setPrograms([]);
      return;
    }
    const key = `${uniName}::${facName}::ug`;
    if (programsCache.has(key)) {
      setPrograms(programsCache.get(key));
      return;
    }
    try {
      setPLoading(true);
      const list = await academicService.getProgramsLK(uniName, facName, 'ug');
      const items = Array.isArray(list) ? list : [];
      programsCache.set(key, items);
      setPrograms(items);
    } catch {
      setPrograms([]);
    } finally {
      setPLoading(false);
    }
  };

  // specialization catalog
  const SPEC = [
    'MERN',
    'Java',
    'Flutter',
    'Python',
    'React',
    'Node.js',
    'Android',
    'iOS',
    'DevOps',
    'Cloud',
    'Machine Learning',
    'Data Analytics',
  ];

  const togglePick = (k) => setPicks((p) => ({ ...p, [k]: !p[k] }));
  const toggleSpec = (s) =>
    setSpecializations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const addSkill = () => {
    const v = newSkill.trim();
    if (!v || skills.includes(v)) return;
    setSkills((p) => [...p, v]);
    setNewSkill('');
  };
  const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));

  // local shadow for admin page
  const safeGetArray = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const safeSetArray = (arr) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(arr || []));
    } catch {}
  };

  const submit = async () => {
    if (!Object.values(picks).some(Boolean)) {
      alert('Select at least one section to update.');
      return;
    }
    if (picks.academic && (!university || !faculty || !degreeProgram)) {
      alert('Please complete academic details.');
      return;
    }
    if (picks.enddate) {
      if (!newEndDate || !endDateReason.trim()) {
        alert('Please provide a new end date and a reason.');
        return;
      }
      const chosen = new Date(newEndDate);
      const today = new Date(todayISO);
      if (chosen < today) {
        alert('End date cannot be in the past.');
        return;
      }
    }

    try {
      setBusy(true);

      const immediatePayload = {};
      if (picks.specializations) immediatePayload.specializations = specializations;
      if (picks.academic) {
        immediatePayload.university = university;
        immediatePayload.faculty = faculty;
        immediatePayload.degreeProgram = degreeProgram;
      }
      if (picks.skills) immediatePayload.skills = skills;

      if (Object.keys(immediatePayload).length > 0) {
        await internService.updateIntern(intern.internId, immediatePayload);
      }

      if (picks.enddate) {
        try {
          await internUpdateRequestService.createForIntern(intern.internId, {
            type: 'END_DATE',
            requestedEndDate: newEndDate,
            reason: endDateReason,
          });
        } catch {}
        const now = new Date().toISOString();
        const shadow = {
          id: `LS-${Date.now()}`,
          status: 'PENDING',
          type: 'END_DATE',
          internId: intern.internId,
          requestedEndDate: newEndDate,
          reason: endDateReason,
          submittedAt: now,
        };
        const arr = safeGetArray();
        arr.push(shadow);
        safeSetArray(arr);
      }

      alert('Submitted successfully.');
      onClose();
      onAfterSubmit?.();
    } catch (e) {
      console.error(e);
      alert('Something went wrong while saving. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  /* --------------------------- UI helpers / styles -------------------------- */
  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 16,
  };
  const card = {
    width: 'min(960px, 92vw)',
    maxHeight: '90vh',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 24px 60px rgba(2,8,23,.35)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };
  const header = {
    padding: 20,
    borderBottom: '1px solid #e6eaf3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: '0 0 auto',
  };
  const body = { padding: 20, overflowY: 'auto', flex: '1 1 auto' };
  const btn = { padding: '10px 14px', borderRadius: 10, border: '1px solid #d6dbe7', fontWeight: 700 };
  const btnPri = { ...btn, background: '#2563eb', color: '#fff', borderColor: '#2563eb' };
  const pick = (on) => ({
    border: '2px solid',
    borderColor: on ? '#2563eb' : '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    cursor: 'pointer',
    background: on ? '#eff6ff' : '#fff',
  });

  /* ----------------- University Search (typeahead + browse) ---------------- */
  const UniversitySearch = () => {
    // local input state (separate from chosen value)
    const [q, setQ] = useState(university || '');
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [busySearch, setBusySearch] = useState(false);
    const [hi, setHi] = useState(-1);

    // debounce
    const [debouncedQ, setDebouncedQ] = useState(q);
    useEffect(() => {
      const t = setTimeout(() => setDebouncedQ(q), 300);
      return () => clearTimeout(t);
    }, [q]);

    // live search (only if not selected yet)
    useEffect(() => {
      let cancel = false;
      if (!picks.academic || university) return;

      const run = async () => {
        const query = debouncedQ.trim();
        if (!query) {
          setOptions([]);
          setOpen(false);
          return;
        }
        try {
          setBusySearch(true);
          const list = await academicService.searchUniversitiesLK(query);
          if (cancel) return;
          const items = Array.isArray(list) ? list : [];
          setOptions(items);

          const exact = items.find((u) => norm(u?.name) === norm(query));
          if (exact?.name) {
            await choose(exact.name);
            return;
          }
          if (items.length === 1 && items[0]?.name) {
            await choose(items[0].name);
            return;
          }

          setOpen(true);
          setHi(-1);
        } catch {
          if (!cancel) {
            setOptions([]);
            setOpen(false);
          }
        } finally {
          if (!cancel) setBusySearch(false);
        }
      };

      run();
      return () => {
        cancel = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQ, university, picks.academic]);

    const choose = async (name) => {
      setUniversity(name);
      setQ(name);
      setOpen(false);
      setOptions([]);
      setHi(-1);
      await loadFaculties(name); // load faculties immediately
    };

    const browse = async () => {
      const raw = q.trim();
      const normalized = toTitleCase(raw);
      try {
        setBusySearch(true);

        if (university) {
          await loadFaculties(university);
          return;
        }

        const list = await academicService.searchUniversitiesLK(raw);
        const items = Array.isArray(list) ? list : [];
        setOptions(items);

        const exact = items.find((u) => norm(u?.name) === norm(raw));
        if (exact?.name) {
          await choose(exact.name);
          return;
        }
        if (items.length === 1 && items[0]?.name) {
          await choose(items[0].name);
          return;
        }

        // fallback: try normalized name even if search is empty
        if (!items.length && normalized.length >= 3) {
          await choose(normalized);
          return;
        }

        setOpen(true);
        setHi(-1);
      } finally {
        setBusySearch(false);
      }
    };

    return (
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>University *</div>

        {!university && (
          <div style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="wizard-input"
                style={{ paddingLeft: 36 }}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  if (options.length) setOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    browse();
                    return;
                  }
                  if (!open || !options.length) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHi((i) => Math.min(i + 1, options.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHi((i) => Math.max(i - 1, 0));
                  } else if (e.key === 'Tab' && hi >= 0) {
                    e.preventDefault();
                    choose(options[hi].name);
                  } else if (e.key === 'Escape') {
                    setOpen(false);
                  }
                }}
                placeholder="Type a Sri Lankan university (e.g., University of Colombo)"
              />
              <FiSearch
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.25,
                }}
              />
            </div>

            <button
              type="button"
              onClick={browse}
              style={{
                padding: '8px 12px',
                border: '1px solid #d6dbe7',
                borderRadius: 8,
                background: '#f3f4f6',
                fontWeight: 600,
              }}
            >
              {busySearch ? '…' : 'Browse'}
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 6px)',
                  zIndex: 30,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {busySearch && <div style={{ padding: 10, fontSize: 12 }}>Searching…</div>}
                {!busySearch && options.length === 0 && (
                  <div style={{ padding: 10, fontSize: 12, color: '#64748b' }}>No matches</div>
                )}
                {!busySearch &&
                  options.map((u, idx) => (
                    <div
                      key={u.name}
                      onClick={() => choose(u.name)}
                      onMouseEnter={() => setHi(idx)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: hi === idx ? '#f1f5f9' : '#fff',
                      }}
                    >
                      {u.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {university && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="wizard-input" value={university} readOnly />
            <button
              type="button"
              onClick={() => {
                setUniversity('');
                setFaculties([]);
                setFaculty('');
                setPrograms([]);
                setDegreeProgram('');
                setUniversityQuery('');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d6dbe7',
                fontWeight: 700,
                background: '#fff',
              }}
            >
              Change
            </button>
          </div>
        )}
      </div>
    );
  };

  const FacultySelect = () => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Faculty *</div>

      {university && !fLoading && faculties.length === 0 && (
        <div style={{ marginBottom: 8, fontSize: 12, color: '#64748b' }}>
          {`No faculties returned for “${university}”. `}
          <button
            type="button"
            onClick={() => loadFaculties(university)}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              border: 0,
              background: 'transparent',
              padding: 0,
            }}
          >
            Reload
          </button>
        </div>
      )}

      <select
        className="wizard-select"
        value={faculty}
        onChange={(e) => {
          const v = e.target.value;
          setFaculty(v);
          loadPrograms(university, v);
        }}
        disabled={!university || fLoading}
        onFocus={() => {
          if (university && faculties.length === 0 && !fLoading) loadFaculties(university);
        }}
      >
        <option value="">{fLoading ? 'Loading faculties…' : 'Select Faculty'}</option>
        {faculties.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );

  const ProgramSelect = () => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Undergraduate Program *</div>
      <select
        className="wizard-select"
        value={degreeProgram}
        onChange={(e) => setDegreeProgram(e.target.value)}
        disabled={!faculty || pLoading}
      >
        <option value="">{pLoading ? 'Loading programs…' : 'Select Program'}</option>
        {programs.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );

  /* ------------------------------ Render modal ----------------------------- */
  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={card}>
        <div style={header}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Update Profile</div>
          <button style={btn} onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        <div style={body}>
          {step === 'overview' ? (
            <>
              <p style={{ color: '#475569', marginBottom: 12 }}>
                Select what you'd like to update. All sections are optional.
              </p>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <label style={pick(picks.specializations)} onClick={() => togglePick('specializations')}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input type="checkbox" readOnly checked={picks.specializations} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Update Specializations</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Select your field of specialization</div>
                    </div>
                  </div>
                </label>

                <label style={pick(picks.academic)} onClick={() => togglePick('academic')}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input type="checkbox" readOnly checked={picks.academic} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Update Academic Details</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>University, Faculty, Program (SL · UG)</div>
                    </div>
                  </div>
                </label>

                <label style={pick(picks.skills)} onClick={() => togglePick('skills')}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input type="checkbox" readOnly checked={picks.skills} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Update Skills</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Add or modify your technical skills</div>
                    </div>
                  </div>
                </label>

                <label style={pick(picks.enddate)} onClick={() => togglePick('enddate')}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input type="checkbox" readOnly checked={picks.enddate} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Update End Date</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Request a change to internship end date (needs admin approval)
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button style={btn} onClick={onClose} disabled={busy}>
                  Back
                </button>
                <button
                  style={btnPri}
                  onClick={() => setStep('update')}
                  disabled={!Object.values(picks).some(Boolean) || busy}
                >
                  Proceed with Selected Updates
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Specializations */}
              {picks.specializations && (
                <section>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Field of Specialization</h3>
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {SPEC.map((s) => {
                      const on = specializations.includes(s);
                      return (
                        <label
                          key={s}
                          style={{
                            border: '2px solid',
                            borderColor: on ? '#2563eb' : '#e5e7eb',
                            borderRadius: 10,
                            padding: 10,
                            cursor: 'pointer',
                            background: on ? '#eff6ff' : '#fff',
                          }}
                          onClick={() => toggleSpec(s)}
                        >
                          <input type="checkbox" readOnly checked={on} />{' '}
                          <span style={{ marginLeft: 6 }}>{s}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Academic (Sri Lanka · UG) */}
              {picks.academic && (
                <section>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Academic Details (Sri Lanka · Undergraduate)</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <UniversitySearch />
                    {university && <FacultySelect />}
                    {faculty && <ProgramSelect />}
                  </div>
                </section>
              )}

              {/* Skills */}
              {picks.skills && (
                <section>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Add Your Skills</h3>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    {skills.length === 0 ? (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>No skills added yet</span>
                    ) : (
                      skills.map((s) => (
                        <span
                          key={s}
                          style={{ background: '#2563eb', color: '#fff', borderRadius: 999, padding: '6px 12px' }}
                        >
                          {s}{' '}
                          <button
                            onClick={() => removeSkill(s)}
                            style={{ color: '#cfe0ff', background: 'transparent', border: 0, cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., TypeScript, SQL"
                      className="wizard-input"
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button style={btnPri} onClick={addSkill}>
                      Add
                    </button>
                  </div>
                </section>
              )}

              {/* End date */}
              {picks.enddate && (
                <section>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Internship End Date</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>New End Date *</div>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        min={todayISO}
                        className="wizard-input"
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Reason for Change *</div>
                      <textarea
                        rows={3}
                        value={endDateReason}
                        onChange={(e) => setEndDateReason(e.target.value)}
                        className="wizard-input"
                        placeholder="Provide a brief reason..."
                      />
                    </div>
                  </div>
                </section>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button style={btn} onClick={() => setStep('overview')} disabled={busy}>
                  Back
                </button>
                <button style={btnPri} onClick={submit} disabled={busy}>
                  {busy ? 'Saving…' : 'Submit Updates'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* input look */}
      <style>{`
        .wizard-input, .wizard-select {
          width: 100%; border: 2px solid #e5e7eb; border-radius: 10px;
          padding: 10px 12px; outline: none;
        }
        .wizard-input:focus, .wizard-select:focus { border-color: #2563eb; }
      `}</style>
    </div>
  );
};

/* ========================================================================== */
/*                             PAGE: Intern Profile                           */
/* ========================================================================== */
const InternProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isIntern, isProjectManager, isTeamLeader, loading: authLoading } = useAuth();

  const [intern, setIntern] = useState(null);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const [showWizard, setShowWizard] = useState(false);

  // intern’s own profile route?
  const isProfileRoute = location.pathname === '/profile' && isIntern && !isAdmin;

  useEffect(() => {
    if (user && !authLoading) fetchIntern();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, location.pathname]);

  const fetchIntern = async () => {
    try {
      setLoading(true);
      setError(null);

      let internResponse;
      if (isProfileRoute && user?.traineeId) {
        internResponse = await internService.getInternByCode(user.traineeId);
      } else if (id) {
        internResponse = await internService.getInternById(id);
      } else {
        throw new Error('No intern identifier provided');
      }

      const internData = internResponse.data;
      setIntern(internData);

      const internId = internData.internId;

      // Teams
      const teamMembersResponse = await teamMemberService.getAllTeamMembers();
      const internTeams = (teamMembersResponse.data || []).filter((m) => m.internId === internId);
      setTeams(internTeams);

      // Projects
      const projectsResponse = await projectService.getAllProjects();
      const internProjects = (projectsResponse.data || []).filter((project) =>
        internTeams.some((team) => project.assignedTeamIds && project.assignedTeamIds.includes(team.teamId)),
      );
      setProjects(internProjects);
    } catch (err) {
      console.error('Error fetching intern:', err);
      setError(err?.message || 'Failed to load intern details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = async (team) => {
    try {
      const teamResponse = await teamService.getTeamById(team.teamId);
      setSelectedTeam(teamResponse.data);
      setShowTeamForm(true);
    } catch (err) {
      console.error('Error fetching team details:', err);
      alert('Failed to load team details. Please try again.');
    }
  };

  const handleTeamFormSubmit = async (teamData) => {
    try {
      setIsEditingTeam(true);
      await teamService.updateTeam(selectedTeam.teamId, teamData);
      setShowTeamForm(false);
      setSelectedTeam(null);
      fetchIntern();
    } catch (err) {
      console.error('Error updating team:', err);
      throw err;
    } finally {
      setIsEditingTeam(false);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleProjectFormSubmit = async (projectData) => {
    try {
      setIsEditingProject(true);
      await projectService.updateProject(selectedProject.projectId, projectData);
      setShowProjectForm(false);
      setSelectedProject(null);
      fetchIntern();
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    } finally {
      setIsEditingProject(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTrainingDuration = () => {
    if (!intern?.trainingStartDate || !intern?.trainingEndDate) return '-';
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    if (weeks > 0 && days > 0) return `${weeks} weeks, ${days} days`;
    if (weeks > 0) return `${weeks} weeks`;
    return `${days} days`;
  };

  const getTrainingStatus = () => {
    if (!intern?.trainingStartDate || !intern?.trainingEndDate) return null;
    const today = new Date();
    const start = new Date(intern.trainingStartDate);
    const end = new Date(intern.trainingEndDate);

    if (today < start) {
      const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
      return { status: 'upcoming', message: `Starts in ${daysUntilStart} days`, class: styles.statusUpcoming };
    }
    if (today > end) {
      const daysSinceEnd = Math.ceil((today - end) / (1000 * 60 * 60 * 24));
      return { status: 'completed', message: `Completed ${daysSinceEnd} days ago`, class: styles.statusCompleted };
    }
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return { status: 'active', message: `${daysRemaining} days remaining`, class: styles.statusActive };
  };

  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading intern details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Intern</h2>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchIntern}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>👤</div>
          <h2>Intern Not Found</h2>
          <p>The intern you're looking for could not be found.</p>
          <button className={styles.retryBtn} onClick={() => navigate('/interns')}>
            Back to Interns
          </button>
        </div>
      </div>
    );
  }

  const trainingStatus = getTrainingStatus();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {!isProfileRoute && (
          <button className={styles.backButton} onClick={() => navigate(isAdmin ? '/interns' : '/profile')}>
            ← Back to {isAdmin ? 'Interns' : 'Profile'}
          </button>
        )}

        {isProfileRoute && (
          <div className={styles.actions}>
            <button className={styles.primaryBtn} onClick={() => setShowWizard(true)}>
              Request Profile Update
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <div className={styles.internInfo}>
            <h1 className={styles.internName}>{intern.name}</h1>
            <div className={styles.internCode}>{intern.internCode}</div>
            {trainingStatus && (
              <span className={`${styles.statusBadge} ${trainingStatus.class}`}>{trainingStatus.message}</span>
            )}
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{intern.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Institute:</span>
                    <span className={styles.infoValue}>{intern.institute}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Training Period</h3>
              <div className={styles.scrollableContent}>
                <div className={styles.timelineGrid}>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Start Date:</span>
                    <span className={styles.timelineValue}>{formatDate(intern.trainingStartDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>End Date:</span>
                    <span className={styles.timelineValue}>{formatDate(intern.trainingEndDate)}</span>
                  </div>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>Duration:</span>
                    <span className={styles.timelineValue}>{getTrainingDuration()}</span>
                  </div>
                  {trainingStatus && (
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineLabel}>Status:</span>
                      <span className={styles.timelineValue}>{trainingStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Team Assignments</h3>
              <div className={styles.scrollableContent}>
                {teams.length > 0 ? (
                  <div className={styles.assignmentsList}>
                    {teams.map((team, index) => (
                      <div key={team.teamMemberId || index} className={styles.assignmentCard}>
                        <div
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/teams/${team.teamId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view team profile"
                        >
                          <div className={styles.teamIcon}>
                            <FiUsers />
                          </div>
                          <div className={styles.assignmentInfo}>
                            <div className={styles.assignmentName}>{team.teamName}</div>
                            <div className={styles.assignmentRole}>Team Member</div>
                          </div>
                        </div>
                        {(isProjectManager || isTeamLeader) && (
                          <div className={styles.assignmentActions}>
                            <button className={styles.actionBtn} onClick={() => handleEditTeam(team)} title="Edit team">
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No team assignments</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Project Assignments</h3>
              <div className={styles.scrollableContent}>
                {projects.length > 0 ? (
                  <div className={styles.assignmentsList}>
                    {projects.map((project, index) => (
                      <div key={project.projectId || index} className={styles.assignmentCard}>
                        <div
                          className={styles.assignmentMainContent}
                          onClick={() => navigate(`/projects/${project.projectId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view project profile"
                        >
                          <div className={styles.projectIcon}>
                            <FiFolder />
                          </div>
                          <div className={styles.assignmentInfo}>
                            <div className={styles.assignmentName}>{project.projectName}</div>
                            <div className={styles.assignmentRole}>
                              Status: {project.status?.replace('_', ' ') || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        {isProjectManager && (
                          <div className={styles.assignmentActions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleEditProject(project)}
                              title="Edit project"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.unassigned}>
                    <div className={styles.unassignedIcon}>❓</div>
                    <span>No project assignments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERN wizard modal */}
      <Wizard isOpen={showWizard} onClose={() => setShowWizard(false)} intern={intern} onAfterSubmit={fetchIntern} />

      {/* Team / Project modals */}
      <TeamForm
        isOpen={showTeamForm}
        onClose={() => {
          setShowTeamForm(false);
          setSelectedTeam(null);
        }}
        onSubmit={handleTeamFormSubmit}
        team={selectedTeam}
        isLoading={isEditingTeam}
      />
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setSelectedProject(null);
        }}
        onSubmit={handleProjectFormSubmit}
        project={selectedProject}
        isLoading={isEditingProject}
      />
    </div>
  );
};

export default InternProfile;
