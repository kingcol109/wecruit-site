// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { user } = useAuth();
  const [recruits, setRecruits] = useState([]);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRecruits = async () => {
      if (!user) return;
      const myRecruitsRef = collection(db, `users/${user.uid}/myRecruits`);
      const myRecruitsSnap = await getDocs(myRecruitsRef);

      const recruitData = await Promise.all(
        myRecruitsSnap.docs.map(async (docSnap) => {
          const recruitId = docSnap.id;
          const recruitDoc = await getDoc(doc(db, 'Recruits', recruitId));
          const submissionDoc = await getDoc(doc(db, `recruits/${recruitId}/userSubmissions/${user.uid}`));

          return {
            recruitId,
            submittedAt: docSnap.data().submittedAt?.toDate(),
            recruit: recruitDoc.exists() ? recruitDoc.data() : null,
            submission: submissionDoc.exists() ? submissionDoc.data() : null,
          };
        })
      );

      setRecruits(recruitData.filter(r => r.recruit));
      setLoading(false);
    };

    fetchUserRecruits();
  }, [user]);

  const sorted = [...recruits].sort((a, b) => {
    if (sortBy === 'name') {
      return a.recruit.Name.localeCompare(b.recruit.Name);
    } else if (sortBy === 'grade') {
      return (a.submission?.grade || '').localeCompare(b.submission?.grade || '');
    } else {
      return b.submittedAt - a.submittedAt;
    }
  });

  if (!user) return <p className="p-4">Please sign in to view your profile.</p>;
  if (loading) return <p className="p-4">Loading your recruits...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-2xl font-bold text-blue-700 hover:underline">
          2027 Board
        </Link>
        <h1 className="text-3xl font-bold mt-2">Your Evaluations</h1>
      </div>

      <div className="mb-4">
        <label className="mr-2 font-medium">Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-1 rounded">
          <option value="submittedAt">Date Submitted</option>
          <option value="name">Name</option>
          <option value="grade">Grade</option>
        </select>
      </div>

      {sorted.map(({ recruitId, recruit, submission }) => (
        <div key={recruitId} className="border rounded p-4 mb-4 shadow">
          <Link to={`/recruit/${recruitId}`} className="text-xl font-semibold text-blue-600 hover:underline">
            {recruit.Name}
          </Link>
          <p className="text-sm text-gray-600">{recruit.Class} {recruit.Position} — {recruit.School}, {recruit.State}</p>
          <p className="mt-2"><strong>Grade:</strong> {submission?.grade || 'N/A'}</p>
          <p><strong>Strengths:</strong> {submission?.strengths?.join(', ') || 'N/A'}</p>
          <p><strong>Predicted School:</strong> {submission?.predictedSchool || 'N/A'}</p>
          <p><strong>Comment:</strong> {submission?.comment || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}
