import React, { useEffect, useMemo, useState } from 'react';
import { LogOut, Pencil, Save, X, User, UserX } from 'lucide-react';
import {
  getMentorProfile,
  updateMentorProfile
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  dateOfBirth: '',
  contactNumber: '',
  qualification: '',
  degree: '',
  institution: '',
  completionYear: '',
  designation: '',
  expertise: '',
  technicalSkills: '',
  yearsOfExperience: ''
};

const FIELD_GROUPS = [
  {
    title: 'Personal information',
    fields: [
      { key: 'name', label: 'Full name', required: true, maxLength: 120 },
      { key: 'email', label: 'Email address', readOnly: true, type: 'email' },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { key: 'contactNumber', label: 'Contact number', type: 'tel', maxLength: 20, placeholder: '+91 98765 43210' }
    ]
  },
  {
    title: 'Education',
    fields: [
      { key: 'qualification', label: 'Highest qualification', maxLength: 160 },
      { key: 'degree', label: 'Degree / Specialization', maxLength: 160 },
      { key: 'institution', label: 'Institution / University', maxLength: 160 },
      { key: 'completionYear', label: 'Year of completion', type: 'number', min: 1950, max: new Date().getFullYear() + 10 }
    ]
  },
  {
    title: 'Professional information',
    fields: [
      { key: 'designation', label: 'Current designation / Role', maxLength: 160 },
      { key: 'expertise', label: 'Area of expertise', maxLength: 160 },
      { key: 'technicalSkills', label: 'Technical skills', maxLength: 500, multiline: true },
      { key: 'yearsOfExperience', label: 'Years of experience', type: 'number', min: 0, max: 60, step: 0.5 }
    ]
  }
];

const getProfileFromResponse = (response) => {
  const payload = response?.data ?? response;
  return payload?.mentor ?? payload?.user ?? payload;
};

const normalizeProfile = (profile) => ({
  ...EMPTY_PROFILE,
  ...Object.fromEntries(
    Object.keys(EMPTY_PROFILE).map((key) => [
      key,
      profile?.[key] == null ? '' : (
        key === 'dateOfBirth'
          ? String(profile[key]).slice(0, 10)
          : String(profile[key])
      )
    ])
  )
});

export default function Profile() {
  const { logout, user: authUser } = useAuth();
  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    getMentorProfile()
      .then((response) => {
        if (!active) return;
        const profile = normalizeProfile(getProfileFromResponse(response));
        setSavedProfile(profile);
        setDraft(profile);
      })
      .catch(() => {
        if (active) setLoadError('Could not load your profile. Please refresh and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const displayName = savedProfile.name || authUser?.name || 'Mentor';
  const photo = authUser?.avatar ?? authUser?.avatar_url ?? authUser?.photo ?? authUser?.picture ?? authUser?.photoURL ?? authUser?.imageUrl;
  const initials = useMemo(() => displayName.trim().charAt(0).toUpperCase(), [displayName]);

  const beginEdit = () => {
    setDraft({ ...savedProfile });
    setNotice(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({ ...savedProfile });
    setEditing(false);
    setNotice(null);
  };

  const changeField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNotice({ type: 'error', text: 'Full name is required.' });
      return;
    }
    if (draft.contactNumber && !/^\\+?[0-9() .-]{7,20}$/.test(draft.contactNumber.trim())) {
      setNotice({ type: 'error', text: 'Enter a valid contact number.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await updateMentorProfile({
        name: draft.name.trim(),
        dateOfBirth: draft.dateOfBirth,
        contactNumber: draft.contactNumber.trim(),
        qualification: draft.qualification.trim(),
        degree: draft.degree.trim(),
        institution: draft.institution.trim(),
        completionYear: draft.completionYear,
        designation: draft.designation.trim(),
        expertise: draft.expertise.trim(),
        technicalSkills: draft.technicalSkills.trim(),
        yearsOfExperience: draft.yearsOfExperience
      });
      const updated = normalizeProfile(getProfileFromResponse(response));
      setSavedProfile(updated);
      setDraft(updated);
      setEditing(false);
      setNotice({ type: 'success', text: response?.message || 'Profile saved successfully.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.response?.data?.message || 'Could not save your profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = draft[field.key] ?? '';
    const disabled = !editing || field.readOnly;
    const common = {
      id: field.key,
      name: field.key,
      value,
      disabled,
      required: Boolean(field.required),
      maxLength: field.maxLength,
      onChange: (event) => changeField(field.key, event.target.value),
      className: `mt-2 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition ${disabled ? 'border-[#E6EBF2] bg-[#F8FAFC] text-[#475569]' : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'}`
    };

    return (
      <div key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}>
        <label htmlFor={field.key} className="text-sm font-semibold text-[#334155]">
          {field.label}{field.required && <span className="text-red-500"> *</span>}
        </label>
        {field.multiline ? (
          <textarea {...common} rows={3} />
        ) : (
          <input
            {...common}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            maxLength={field.maxLength}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-[#64748B]">View and manage your mentor information.</p>
        </div>
        {!loading && !loadError && (
          editing ? (
            <div className="flex gap-2">
              <button type="button" onClick={cancelEdit} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50">
                <X size={16} /> Cancel
              </button>
              <button type="submit" form="mentor-profile-form" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60">
                <Save size={16} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={beginEdit} className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
              <Pencil size={16} /> Edit profile
            </button>
          )
        )}
      </div>

      {notice && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="card space-y-5">
          <div className="skeleton h-20 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-16 w-full" />)}</div>
        </div>
      ) : loadError ? (
        <div className="card py-12 text-center text-sm text-red-600">{loadError}</div>
      ) : (
        <>
          <div className="grid-hero flex items-center gap-4 rounded-[20px] border border-[#D6E4FA] p-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-extrabold text-[#2563EB] shadow-sm">
              {photo ? <img src={photo} alt={displayName} className="h-full w-full object-cover" /> : initials || <User size={26} />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-extrabold text-[#0F172A]">{displayName}</h2>
              <p className="text-sm text-[#475569]">{savedProfile.email || authUser?.email || 'Mentor account'}</p>
            </div>
          </div>

          <form id="mentor-profile-form" onSubmit={saveProfile} className="space-y-5">
            {FIELD_GROUPS.map((group) => (
              <section key={group.title} className="card space-y-5">
                <h3 className="text-lg font-bold text-[#0F172A]">{group.title}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.fields.map(renderField)}
                </div>
              </section>
            ))}
          </form>
        </>
      )}

      <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
