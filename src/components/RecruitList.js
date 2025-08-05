import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function DropdownChecklist({ title, options, selected, setSelected, sortNumeric = false }) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const selectAll = () => setSelected(options);

  const sortedOptions = sortNumeric
    ? [...options].sort((a, b) => {
        const aNum = parseInt(a.split(' ')[0]);
        const bNum = parseInt(b.split(' ')[0]);
        return aNum - bNum;
      })
    : [...options].sort();

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="border px-4 py-2 rounded bg-white shadow hover:bg-gray-100"
      >
        {title}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 bg-white border rounded shadow-md w-64 p-4 max-h-80 overflow-y-auto">
          <button
            onClick={selectAll}
            className="text-blue-600 text-sm mb-2 block hover:underline"
          >
            Select All
          </button>
          {sortedOptions.map((option) => (
            <label key={option} className="block mb-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function RecruitList() {
  const [recruits, setRecruits] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [sortKey, setSortKey] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');

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

  const uniquePositions = [...new Set(recruits.map((r) => r.Position))];
  const uniqueGrades = [...new Set(recruits.map((r) => r['KC Grade']))];

  const filteredRecruits = recruits
    .filter((r) =>
      selectedPositions.length > 0 ? selectedPositions.includes(r.Position) : true
    )
    .filter((r) =>
      selectedGrades.length > 0 ? selectedGrades.includes(r['KC Grade']) : true
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-[#0055a5] text-center mb-6">
        Wecruit – Class of 2027
      </h1>

      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <DropdownChecklist
          title="Filter by Position"
          options={uniquePositions}
          selected={selectedPositions}
          setSelected={setSelectedPositions}
        />
        <DropdownChecklist
          title="Filter by KC Grade"
          options={uniqueGrades}
          selected={selectedGrades}
          setSelected={setSelectedGrades}
          sortNumeric={true}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              {['Name', 'Class', 'Position', 'School', 'State', 'KC Grade'].map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer p-2 font-semibold"
                >
                  {key}
                  {sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecruits.map((recruit) => (
              <tr key={recruit.id} className="hover:bg-gray-100">
                <td className="p-2">
                  <Link to={`/recruit/${recruit.id}`} className="text-blue-600 underline">
                    {recruit.Name}
                  </Link>
                </td>
                <td className="p-2">{recruit.Class}</td>
                <td className="p-2">{recruit.Position}</td>
                <td className="p-2">{recruit.School}</td>
                <td className="p-2">{recruit.State}</td>
                <td className="p-2">{recruit['KC Grade']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecruitList;
