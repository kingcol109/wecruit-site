// src/components/UserProfile.js
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

/* ---------- Reusable UI (Dropdown + Search) ---------- */

function DropdownChecklist({ title, options, selected, setSelected, sortNumeric = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };
  const selectAll = () => setSelected(options);

  const sortedOptions = useMemo(() => {
    const base = (options || []).filter(Boolean);
    if (sortNumeric) {
      return [...base].sort((a, b) => {
        const aNum = parseInt(String(a).split(' ')[0], 10);
        const bNum = parseInt(String(b).split(' ')[0], 10);
        return (isNaN(aNum) ? 0 : aNum) - (isNaN(bNum) ? 0 : bNum);
      });
    }
    return [...base].sort();
  }, [options, sortNumeric]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-6 py-3 font-extrabold uppercase tracking-wide text-white rounded
                   bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110 w-52"
      >
        {title}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-64 max-h-80 overflow-y-auto bg-white border-4 border-[#f6a21d] rounded shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0055a5] text-white text-sm font-bold">
            <span>{title}</span>
            <div className="space-x-3">
              <button type="button" onClick={selectAll} className="underline">All</button>
              <button type="button" onClick={() => setSelected([])} className="underline">Clear</button>
            </div>
          </div>
          <div className="p-4">
            {sortedOptions.map((option) => (
              <label key={String(option)} className="block mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 accent-[#0055a5]"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = 'Search name, school, state…' }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full px-5 py-3 rounded font-semibold bg-[#0055a5] text-white placeholder-white/80
                   border-4 border-[#f6a21d] shadow focus:outline-none focus:ring-2 focus:ring-[#f6a21d]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ---------------------- Page ---------------------- */

export default function UserProfile() {
  const { user } = useAuth();
  const [recruits, setRecruits] = useState([]);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [loading, setLoading] = useState(true);

  // filters
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]); // now "Your Grade"
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUserRecruits = async () => {
      if (!user) return;
      const myRecruitsRef = collection(db, `users/${user.uid}/myRecruits`);
      const myRecruitsSnap = await getDocs(myRecruitsRef);

      const recruitData = await Promise.all(
        myRecruitsSnap.docs.map(async (docSnap) => {
          const recruitId = docSnap.id;
          const recruitDoc = await getDoc(doc(db, 'Recruits', recruitId));
          const submissionDoc = await getDoc(
            doc(db, `recruits/${recruitId}/userSubmissions/${user.uid}`)
          );
          return {
            recruitId,
            submittedAt: docSnap.data().submittedAt?.toDate() ?? null,
            recruit: recruitDoc.exists() ? recruitDoc.data() : null,
            submission: submissionDoc.exists() ? submissionDoc.data() : null,
          };
        })
      );

      setRecruits(recruitData.filter((r) => r.recruit));
      setLoading(false);
    };

    fetchUserRecruits();
  }, [user]);

  // uniques for filters
  const uniquePositions = useMemo(
    () => [...new Set(recruits.map((r) => r.recruit?.Position))].filter(Boolean),
    [recruits]
  );

  // use submission.grade instead of KC Grade
  const uniqueGrades = useMemo(
    () => [...new Set(recruits.map((r) => r.submission?.grade))].filter(Boolean),
    [recruits]
  );

  const uniqueStates = useMemo(
    () => [...new Set(recruits.map((r) => r.recruit?.State))].filter(Boolean),
    [recruits]
  );
  const uniqueClasses = useMemo(
    () => [...new Set(recruits.map((r) => r.recruit?.Class))].filter(Boolean).sort(),
    [recruits]
  );

  // filter + search + sort
  const visible = useMemo(() => {
    const list = recruits
      .filter((row) =>
        selectedPositions.length > 0 && row.recruit?.Position
          ? selectedPositions.includes(row.recruit.Position)
          : selectedPositions.length === 0
      )
      .filter((row) =>
        selectedGrades.length > 0 && row.submission?.grade != null
          ? selectedGrades.includes(row.submission.grade)
          : selectedGrades.length === 0
      )
      .filter((row) =>
        selectedStates.length > 0 && row.recruit?.State
          ? selectedStates.includes(row.recruit.State)
          : selectedStates.length === 0
      )
      .filter((row) =>
        selectedClasses.length > 0 && row.recruit?.Class
          ? selectedClasses.includes(row.recruit.Class)
          : selectedClasses.length === 0
      )
      .filter((row) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        const r = row.recruit || {};
        const hay = [
          r.Name,
          r.School,
          r.State,
          r.Position,
          String(row.submission?.grade ?? ''),
          r.Class?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return (a.recruit?.Name || '').localeCompare(b.recruit?.Name || '');
      } else if (sortBy === 'grade') {
        return (a.submission?.grade || '').localeCompare(b.submission?.grade || '');
      } else {
        const at = a.submittedAt ? a.submittedAt.getTime() : 0;
        const bt = b.submittedAt ? b.submittedAt.getTime() : 0;
        return bt - at;
      }
    });
  }, [
    recruits,
    selectedPositions,
    selectedGrades,
    selectedStates,
    selectedClasses,
    searchQuery,
    sortBy,
  ]);

  if (!user) return <p className="p-6">Please sign in to view your profile.</p>;
  if (loading) return <p className="p-6">Loading your recruits...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="px-5 py-2 font-extrabold uppercase tracking-wide text-white rounded
                     bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110"
        >
          Board
        </Link>

        <div className="flex items-center gap-3">
          <label className="font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-2 border-[#f6a21d] rounded px-3 py-2 bg-white text-[#0055a5] font-semibold focus:outline-none"
          >
            <option value="submittedAt">Date Submitted</option>
            <option value="name">Name</option>
            <option value="grade">Grade</option>
          </select>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-[#0055a5] mb-4">
        Your Evaluations
      </h1>

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
        <div className="flex justify-center">
          <DropdownChecklist
            title="Class"
            options={uniqueClasses}
            selected={selectedClasses}
            setSelected={setSelectedClasses}
            sortNumeric
          />
        </div>
        <div className="flex justify-center">
          <DropdownChecklist
            title="Position"
            options={uniquePositions}
            selected={selectedPositions}
            setSelected={setSelectedPositions}
          />
        </div>
        <div className="flex justify-center">
          <DropdownChecklist
            title="State"
            options={uniqueStates}
            selected={selectedStates}
            setSelected={setSelectedStates}
          />
        </div>
        <div className="flex justify-center">
          <DropdownChecklist
            title="Your Grade"
            options={uniqueGrades}
            selected={selectedGrades}
            setSelected={setSelectedGrades}
            sortNumeric
          />
        </div>

        {/* Search full width */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6">
        {visible.map(({ recruitId, recruit, submission }) => (
          <div
            key={recruitId}
            className="rounded-xl border-4 border-[#f6a21d] bg-white shadow flex flex-col"
          >
            {/* Name header */}
            <div className="px-5 py-4 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide text-3xl">
              <Link to={`/recruit/${recruitId}`} className="hover:underline">
                {recruit.Name}
              </Link>
            </div>

            <div className="p-6 space-y-5 text-gray-800 text-lg">
              {/* School + State */}
              <p className="text-3xl font-bold">
                {recruit.School}
                {recruit.State ? `, ${recruit.State}` : ''}
              </p>

              {/* Class + Position */}
              <p className="text-xl text-gray-600">
                <span className="font-semibold">{recruit.Class}</span> •{' '}
                <span className="font-semibold">{recruit.Position}</span>
              </p>

              {/* Height + Weight */}
              {(recruit.Height || recruit.Weight) && (
                <p className="text-lg text-gray-700">
                  {recruit.Height ? recruit.Height : ''}
                  {recruit.Height && recruit.Weight ? ' • ' : ''}
                  {recruit.Weight ? recruit.Weight : ''}
                </p>
              )}

              {/* Grade + Predicted School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-3">
                <div>
                  <div className="text-sm uppercase text-gray-500">Grade</div>
                  <div className="font-semibold text-xl">{submission?.grade || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm uppercase text-gray-500">Predicted School</div>
                  <div className="font-semibold text-xl">{submission?.predictedSchool || 'N/A'}</div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <div className="text-sm uppercase text-gray-500">Strengths</div>
                <div className="font-semibold text-lg">
                  {submission?.strengths?.length ? submission.strengths.join(', ') : 'N/A'}
                </div>
              </div>

              {/* Comment */}
              <div>
                <div className="text-sm uppercase text-gray-500">Comment</div>
                <div className="font-semibold text-lg">{submission?.comment || 'N/A'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}