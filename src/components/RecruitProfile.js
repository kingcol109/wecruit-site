import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import RecruitSubmissionForm from './RecruitSubmissionForm';

function RecruitProfile() {
  const { id } = useParams();
  const [recruit, setRecruit] = useState(null);
  const [avgGrade, setAvgGrade] = useState(null);
  const [topStrengths, setTopStrengths] = useState([]);
  const [topSchools, setTopSchools] = useState([]);

  useEffect(() => {
    const fetchRecruit = async () => {
      const docRef = doc(db, 'Recruits', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRecruit(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    const fetchAggregateData = async () => {
      const submissionsRef = collection(db, `recruits/${id}/userSubmissions`);
      const submissionsSnap = await getDocs(submissionsRef);

      const gradeNums = [];
      const strengthCount = {};
      const schoolCount = {};

      submissionsSnap.forEach(doc => {
        const data = doc.data();

        // Grade processing
        const grade = data.grade;
        if (grade && grade[0] !== '8') {
          const num = parseInt(grade[0]);
          if (!isNaN(num)) gradeNums.push(num);
        }

        // Strengths processing
        const strengths = data.strengths || [];
        strengths.forEach(s => {
          if (!strengthCount[s]) strengthCount[s] = 0;
          strengthCount[s]++;
        });

        // School prediction processing
        const school = data.predictedSchool;
        if (school) {
          if (!schoolCount[school]) schoolCount[school] = 0;
          schoolCount[school]++;
        }
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
      }

      const sortedStrengths = Object.entries(strengthCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
      setTopStrengths(sortedStrengths);

      const sortedSchools = Object.entries(schoolCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
      setTopSchools(sortedSchools);
    };

    fetchRecruit();
    fetchAggregateData();
  }, [id]);

  if (!recruit) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="mb-4 text-[#0055a5] hover:underline"
      >
        ← Back to List
      </button>

      <h1 className="text-6xl font-bold mb-2">{recruit.Name}</h1>

      <p className="text-lg font-semibold text-gray-800 mb-1">
        {recruit.Class} {recruit.Position}
      </p>
      <p className="text-lg text-gray-700 mb-2">
        {recruit.School}, {recruit.State}
      </p>

      {(recruit.Height || recruit.Weight) && (
        <p className="text-lg text-gray-800 mb-2">
          {[recruit.Height, recruit.Weight].filter(Boolean).join(' ')}
        </p>
      )}

      <p><strong>KC Grade:</strong> {recruit['KC Grade']}</p>
      <p><strong>Archetype:</strong> {recruit.Archetype}</p>

      {recruit["KC's Take"] && (
        <div className="mt-6 bg-blue-50 border-l-4 border-[#0055a5] p-4 rounded shadow text-gray-900">
          <h3 className="text-2xl font-bold text-[#0055a5] mb-2">KC's Take</h3>
          <p className="text-base leading-relaxed">{recruit["KC's Take"]}</p>
        </div>
      )}

      {avgGrade && (
        <div className="mt-6">
          <h3 className="text-4xl font-bold mb-2">User Grades</h3>
          <p className="text-2xl font-semibold text-gray-700 mb-1">Average Grade</p>
          <p className="text-lg text-gray-800">{avgGrade}</p>
        </div>
      )}

      {topStrengths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-2">Strengths</h3>
          <ol className="list-decimal list-inside text-gray-800">
            {topStrengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {topSchools.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-2">School Prediction</h3>
          <ol className="list-decimal list-inside text-gray-800">
            {topSchools.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Your Evaluation</h3>
        <RecruitSubmissionForm recruitId={id} />
      </div>
    </div>
  );
}

export default RecruitProfile;
