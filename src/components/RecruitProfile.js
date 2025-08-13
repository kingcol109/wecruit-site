// src/components/RecruitProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import RecruitSubmissionForm from './RecruitSubmissionForm';
import kcsLogo from '../Assets/kcs-logo.png'; // <-- header logo

function RecruitProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recruit, setRecruit] = useState(null);
  const [avgGrade, setAvgGrade] = useState(null);
  const [topStrengths, setTopStrengths] = useState([]);
  const [topSchools, setTopSchools] = useState([]);

  useEffect(() => {
    const fetchRecruit = async () => {
      const docRef = doc(db, 'Recruits', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setRecruit(docSnap.data());
    };

    const fetchAggregateData = async () => {
      const submissionsRef = collection(db, `recruits/${id}/userSubmissions`);
      const submissionsSnap = await getDocs(submissionsRef);

      const gradeNums = [];
      const strengthCount = {};
      const schoolCount = {};

      submissionsSnap.forEach((d) => {
        const data = d.data();

        // Grade (exclude 8 - Watchlist)
        const grade = data.grade;
        if (grade && grade[0] !== '8') {
          const num = parseInt(grade[0], 10);
          if (!isNaN(num)) gradeNums.push(num);
        }

        // Strengths
        (data.strengths || []).forEach((s) => {
          strengthCount[s] = (strengthCount[s] || 0) + 1;
        });

        // School prediction
        const school = data.predictedSchool;
        if (school) schoolCount[school] = (schoolCount[school] || 0) + 1;
      });

      if (gradeNums.length > 0) {
        const avg = gradeNums.reduce((a, b) => a + b, 0) / gradeNums.length;
        const rounded = Math.round(avg);
        const labelMap = {
          1: '1 - Early Impact',
          2: '2 - Early Contributor',
          3: '3 - Year 2 Contributor',
          4: '4 - High Developmental',
          5: '5 - Medium Developmental',
          6: '6 - High End Depth',
          7: '7 - Depth',
          8: '8 - Watchlist',
        };
        setAvgGrade(labelMap[rounded] || 'N/A');
      } else {
        setAvgGrade(null);
      }

      setTopStrengths(
        Object.entries(strengthCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name)
      );

      setTopSchools(
        Object.entries(schoolCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name)
      );
    };

    fetchRecruit();
    fetchAggregateData();
  }, [id]);

  if (!recruit) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Site Header */}
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-6xl font-black text-[#0055a5]">WeCruit</h1>
        <div className="mt-2 text-xl font-extrabold text-[#0055a5]">by</div>
        <div className="mt-2 flex justify-center">
          <img src={kcsLogo} alt="King Cold Sports" className="h-20 md:h-24 drop-shadow" />
        </div>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 font-extrabold uppercase tracking-wide text-white rounded
                     bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110"
        >
          ← Board
        </button>
      </div>

      {/* Identity */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-black text-[#0055a5] leading-tight">
          {recruit.Name}
        </h1>
        <p className="text-xl font-semibold text-gray-900 mt-1">
          {recruit.Class} • {recruit.Position}
        </p>
        <p className="text-2xl font-bold text-gray-700">
          {recruit.School}
          {recruit.State ? `, ${recruit.State}` : ''}
        </p>
        {(recruit.Height || recruit.Weight) && (
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {[recruit.Height, recruit.Weight].filter(Boolean).join(' ')}
          </p>
        )}
      </div>

      {/* KC Grade + Archetype cards (same size) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="flex flex-col h-full rounded-xl border-4 border-[#f6a21d] bg-white shadow">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            KC Grade
          </div>
          <div className="p-5 flex-1 flex items-center">
            <span className="text-xl font-bold text-gray-900">
              {recruit['KC Grade'] || '—'}
            </span>
          </div>
        </div>

        <div className="flex flex-col h-full rounded-xl border-4 border-[#f6a21d] bg-white shadow">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            Archetype
          </div>
          <div className="p-5 flex-1 flex items-center">
            <span className="text-xl font-bold text-gray-900">
              {recruit.Archetype || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-4xl md:text-5xl font-black text-[#0055a5] mb-4">
        User Grades
      </h2>

      {/* Three equal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Average Grade */}
        <div className="flex flex-col justify-between rounded-xl border-4 border-[#f6a21d] bg-white shadow h-full">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            Average Grade
          </div>
          <div className="p-5 flex-1 flex items-center justify-center text-center">
            {avgGrade ? (
              <span className="text-2xl font-bold text-gray-900">{avgGrade}</span>
            ) : (
              <span className="text-gray-600">No user grades yet.</span>
            )}
          </div>
        </div>

        {/* Strengths */}
        <div className="flex flex-col justify-between rounded-xl border-4 border-[#f6a21d] bg-white shadow h-full">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            Strengths
          </div>
          <div className="p-5 flex-1">
            {topStrengths.length ? (
              <ol className="list-decimal list-inside text-gray-900 space-y-1">
                {topStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : (
              <span className="text-gray-600">No strengths yet.</span>
            )}
          </div>
        </div>

        {/* School Prediction */}
        <div className="flex flex-col justify-between rounded-xl border-4 border-[#f6a21d] bg-white shadow h-full">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            School Prediction
          </div>
          <div className="p-5 flex-1">
            {topSchools.length ? (
              <ol className="list-decimal list-inside text-gray-900 space-y-1">
                {topSchools.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : (
              <span className="text-gray-600">No predictions yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* KC's Take */}
      {recruit["KC's Take"] && (
        <div className="mt-6 rounded-xl border-4 border-[#f6a21d] bg-blue-50 shadow">
          <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
            KC's Take
          </div>
          <div className="p-5 text-gray-900 leading-relaxed">{recruit["KC's Take"]}</div>
        </div>
      )}

      {/* Submission Form */}
      <div className="mt-8 rounded-xl border-4 border-[#f6a21d] bg-white shadow">
        <div className="px-5 py-3 bg-[#0055a5] text-white rounded-t-lg font-extrabold uppercase tracking-wide">
          Your Evaluation
        </div>
        <div className="p-5">
          <RecruitSubmissionForm recruitId={id} />
        </div>
      </div>

      {/* Bottom Board button */}
      <div className="mt-6 flex justify-end">
        <Link
          to="/"
          className="px-5 py-2 font-extrabold uppercase tracking-wide text-white rounded
                     bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110"
        >
          Board
        </Link>
      </div>
    </div>
  );
}

export default RecruitProfile;