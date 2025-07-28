import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function RecruitList() {
  const [recruits, setRecruits] = useState([]);
  const [positionFilter, setPositionFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
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

  const filteredRecruits = recruits
    .filter((r) => (positionFilter ? r.Position === positionFilter : true))
    .filter((r) => (gradeFilter ? r['KC Grade'] === gradeFilter : true))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const uniquePositions = [...new Set(recruits.map((r) => r.Position))];
  const uniqueGrades = [...new Set(recruits.map((r) => r['KC Grade']))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-[#0055a5] text-center mb-6">
        Wecruit – Class of 2027
      </h1>

      <div className="flex justify-center gap-4 mb-4">
        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setPositionFilter(e.target.value)}
          value={positionFilter}
        >
          <option value="">All Positions</option>
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setGradeFilter(e.target.value)}
          value={gradeFilter}
        >
          <option value="">All Grades</option>
          {uniqueGrades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
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
