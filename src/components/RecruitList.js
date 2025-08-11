import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import kcsLogo from '../Assets/kcs-logo.png'; // <- put your logo here (adjust path)

const BLUE = '#0055a5';
const GOLD = '#f6a21d';

function DropdownChecklist({ title, options, selected, setSelected, sortNumeric = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const selectAll = () => setSelected(options);

  const sortedOptions = (sortNumeric
    ? [...options].sort((a, b) => {
        const aNum = parseInt(String(a).split(' ')[0]);
        const bNum = parseInt(String(b).split(' ')[0]);
        return (isNaN(aNum) ? 0 : aNum) - (isNaN(bNum) ? 0 : bNum);
      })
    : [...options].sort()
  ).filter(Boolean);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="
          px-6 py-3 font-extrabold uppercase tracking-wide text-white rounded
          bg-[#0055a5] border-4 border-[#f6a21d] shadow
          hover:brightness-110 transition
          w-52
        "
      >
        {title}
      </button>

      {open && (
        <div
          className="
            absolute z-20 mt-2 w-64 max-h-80 overflow-y-auto
            bg-white border-4 border-[#f6a21d] rounded shadow-lg
          "
        >
          <div className="flex items-center justify-between px-4 py-2 bg-[#0055a5] text-white text-sm font-bold">
            <span>{title}</span>
            <div className="space-x-3">
              <button onClick={selectAll} type="button" className="underline">All</button>
              <button onClick={() => setSelected([])} type="button" className="underline">Clear</button>
            </div>
          </div>
          <div className="p-4">
            {sortedOptions.map((option) => (
              <label key={String(option)} className="block mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2 accent-[#0055a5]"
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

function SearchBox({
  value,
  onChange,
  placeholder = 'Search name, school, state…',
  containerClassName = '',
  inputClassName = '',
}) {
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-5 py-3 rounded font-semibold
          bg-[#0055a5] text-white placeholder-white/80
          border-4 border-[#f6a21d] shadow
          focus:outline-none focus:ring-2 focus:ring-[#f6a21d]
          ${inputClassName}
        `}
        aria-label="Search recruits"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear"
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xl"
        >
          ×
        </button>
      )}
    </div>
  );
}

function RecruitList() {
  const [recruits, setRecruits] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [sortKey, setSortKey] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecruits = async () => {
      const querySnapshot = await getDocs(collection(db, 'Recruits'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecruits(data);
    };
    fetchRecruits();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const uniquePositions = [...new Set(recruits.map((r) => r.Position))].filter(Boolean);
  const uniqueGrades = [...new Set(recruits.map((r) => r['KC Grade']))].filter(Boolean);
  const uniqueStates = [...new Set(recruits.map((r) => r.State))].filter(Boolean);
  const uniqueClasses = [...new Set(recruits.map((r) => r.Class))].filter(Boolean).sort();

  const filteredRecruits = recruits
    .filter((r) =>
      selectedPositions.length > 0 && r.Position
        ? selectedPositions.includes(r.Position)
        : selectedPositions.length === 0
    )
    .filter((r) =>
      selectedGrades.length > 0 && r['KC Grade'] !== undefined && r['KC Grade'] !== null
        ? selectedGrades.includes(r['KC Grade'])
        : selectedGrades.length === 0
    )
    .filter((r) =>
      selectedStates.length > 0 && r.State
        ? selectedStates.includes(r.State)
        : selectedStates.length === 0
    )
    .filter((r) =>
      selectedClasses.length > 0 && r.Class
        ? selectedClasses.includes(r.Class)
        : selectedClasses.length === 0
    )
    .filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const haystack = [
        r.Name,
        r.School,
        r.State,
        r.Position,
        String(r['KC Grade'] ?? ''),
        r.Class?.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HERO */}
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-6xl font-black text-[#0055a5]">WeCruit</h1>
        <div className="mt-2 text-xl font-extrabold text-[#0055a5]">by</div>
        <div className="mt-2 flex justify-center">
          <img src={kcsLogo} alt="King Cold Sports" className="h-20 md:h-24 drop-shadow" />

        </div>
      </div>

      {/* FILTERS ROW */}
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
            title="KC Grade"
            options={uniqueGrades}
            selected={selectedGrades}
            setSelected={setSelectedGrades}
            sortNumeric
          />
        </div>

        {/* SEARCH spans full width of 4 columns */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            containerClassName="w-full"
            inputClassName="w-full"
            placeholder="Search"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#0055a5] text-white">
              {['Name', 'Class', 'Position', 'School', 'State', 'KC Grade'].map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="
                    p-3 font-extrabold uppercase tracking-wide text-left
                    border-b-4 border-[#f6a21d] cursor-pointer select-none
                  "
                >
                  {key}
                  {sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecruits.map((recruit) => (
              <tr key={recruit.id} className="even:bg-white odd:bg-white hover:bg-blue-50">
                <td className="p-3 border-b border-[#f6a21d]">
                  <Link to={`/recruit/${recruit.id}`} className="text-[#0055a5] underline font-semibold">
                    {recruit.Name}
                  </Link>
                </td>
                <td className="p-3 border-b border-[#f6a21d]">{recruit.Class}</td>
                <td className="p-3 border-b border-[#f6a21d]">{recruit.Position}</td>
                <td className="p-3 border-b border-[#f6a21d]">{recruit.School}</td>
                <td className="p-3 border-b border-[#f6a21d]">{recruit.State}</td>
                <td className="p-3 border-b border-[#f6a21d]">{recruit['KC Grade']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecruitList;
