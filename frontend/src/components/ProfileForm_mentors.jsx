
import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';

const initialForm = {
  name: '',
  surname: '',
  personalEmail: '',
  professionalRole: '',
  linkedin: '',
  bio: '',
  educationalQualifications: '',
  yearOfJoining: '',
  dateOfBirth: '',
  contactNumber: '',
  highestQualification: '',
  degreeSpecialization: '',
  institution: '',
  yearOfCompletion: '',
  areaOfExpertise: '',
  technicalSkills: '',
  yearsOfExperience: ''
};

export default function ProfileForm_mentors() {
  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [kalviumEmail, setKalviumEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response.profile;

        if (!profile) {
          throw new Error('Profile details were not returned.');
        }

        const profileData = {
          name: profile.name ?? '',
          surname: profile.surname ?? '',
          personalEmail: profile.personalEmail ?? '',
          professionalRole: profile.professionalRole ?? '',
          linkedin: profile.linkedin ?? '',
          bio: profile.bio ?? '',
          educationalQualifications:
            profile.educationalQualifications ?? '',
          yearOfJoining: profile.yearOfJoining ?? '',
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
            : '',
          contactNumber: profile.contactNumber ?? '',
          highestQualification: profile.highestQualification ?? '',
          degreeSpecialization: profile.degreeSpecialization ?? '',
          institution: profile.institution ?? '',
          yearOfCompletion: profile.yearOfCompletion ?? '',
          areaOfExpertise: profile.areaOfExpertise ?? '',
          technicalSkills: profile.technicalSkills ?? '',
          yearsOfExperience: profile.yearsOfExperience ?? ''
        };

        setForm(profileData);
        setSavedForm(profileData);
        setKalviumEmail(profile.email ?? '');
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Unable to load your profile. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setMessage('');
    setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setForm(savedForm);
    setIsEditing(false);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        yearOfJoining:
          form.yearOfJoining === '' ? null : Number(form.yearOfJoining),
        yearOfCompletion:
          form.yearOfCompletion === '' ? null : Number(form.yearOfCompletion),
        yearsOfExperience:
          form.yearsOfExperience === '' ? null : Number(form.yearsOfExperience)
      };

      const response = await updateProfile(payload);

      const updatedProfile = response.profile;

      const updatedForm = {
        ...form,
        ...Object.fromEntries(
          Object.keys(initialForm).map((key) => [
            key,
            updatedProfile?.[key] ?? payload[key] ?? ''
          ])
        ),
        dateOfBirth: updatedProfile?.dateOfBirth
          ? new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0]
          : form.dateOfBirth
      };

      setForm(updatedForm);
      setSavedForm(updatedForm);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-6 text-center">Loading profile...</p>;
  }

  const inputClass = (readOnly) =>
    `w-full rounded-xl border border-[#D6DCE5] p-3 outline-none focus:border-blue-500 ${
      readOnly ? 'bg-gray-100 text-gray-600' : ''
    }`;

  return (
    <section className="card space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Mentor Profile Details</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            View and manage your personal, professional and educational
            information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <Field label="Name" name="name" value={form.name}
            onChange={handleChange} readOnly={!isEditing} required />
          <Field label="Surname" name="surname" value={form.surname}
            onChange={handleChange} readOnly={!isEditing} />
          <Field label="Personal Email" name="personalEmail" type="email"
            value={form.personalEmail} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Date of Birth" name="dateOfBirth" type="date"
            value={form.dateOfBirth} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Contact Number" name="contactNumber"
            value={form.contactNumber} onChange={handleChange}
            readOnly={!isEditing} />
        </ProfileSection>

        {/* Professional Information */}
        <ProfileSection title="Professional Information">
          <Field label="Kalvium Email" value={kalviumEmail} readOnly />
          <Field label="Professional Role" name="professionalRole"
            value={form.professionalRole} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Area of Expertise" name="areaOfExpertise"
            value={form.areaOfExpertise} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Years of Experience" name="yearsOfExperience"
            type="number" value={form.yearsOfExperience}
            onChange={handleChange} readOnly={!isEditing} min="0" />
          <Field label="LinkedIn Profile URL" name="linkedin" type="url"
            value={form.linkedin} onChange={handleChange}
            readOnly={!isEditing} />
          <TextAreaField label="Technical Skills" name="technicalSkills"
            value={form.technicalSkills} onChange={handleChange}
            readOnly={!isEditing}
            placeholder="e.g. Python, JavaScript, React, MongoDB" />
        </ProfileSection>

        {/* Educational Information */}
        <ProfileSection title="Educational Information">
          <Field label="Highest Qualification" name="highestQualification"
            value={form.highestQualification} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Degree / Specialization" name="degreeSpecialization"
            value={form.degreeSpecialization} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Institution / University" name="institution"
            value={form.institution} onChange={handleChange}
            readOnly={!isEditing} />
          <Field label="Year of Completion" name="yearOfCompletion"
            type="number" value={form.yearOfCompletion}
            onChange={handleChange} readOnly={!isEditing}
            min="1900" max={new Date().getFullYear()} />
          <TextAreaField label="Educational Qualifications"
            name="educationalQualifications"
            value={form.educationalQualifications}
            onChange={handleChange} readOnly={!isEditing}
            placeholder="Enter your additional educational details..." />
        </ProfileSection>

        {/* Additional Information */}
        <ProfileSection title="Additional Information">
          <Field label="Year of Joining" name="yearOfJoining"
            type="number" value={form.yearOfJoining}
            onChange={handleChange} readOnly={!isEditing}
            min="1900" max="2100" />
          <TextAreaField label="About Me" name="bio"
            value={form.bio} onChange={handleChange}
            readOnly={!isEditing}
            placeholder="Tell us a little about yourself..." />
        </ProfileSection>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        {isEditing && (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold">
        {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  required = false,
  placeholder = '',
  min,
  max
}) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-xl border border-[#D6DCE5] p-3 outline-none focus:border-blue-500 ${
          readOnly ? 'bg-gray-100 text-gray-600' : ''
        }`}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  placeholder = ''
}) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={name} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        rows={4}
        maxLength={2000}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-[#D6DCE5] p-3 outline-none focus:border-blue-500 ${
          readOnly ? 'bg-gray-100 text-gray-600' : ''
        }`}
      />
    </div>
  );
}
