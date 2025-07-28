import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function RecruitProfile() {
  const { id } = useParams();
  const [recruit, setRecruit] = useState(null);

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

    fetchRecruit();
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
   <h1 className="text-3xl font-bold mb-2">{recruit.Name}</h1>

<p className="text-lg font-semibold text-gray-800 mb-1">
  {recruit.Class} {recruit.Position}
</p>
<p className="text-lg text-gray-700 mb-2">
  {recruit.School}, {recruit.State}
</p>
<p><strong>KC Grade:</strong> {recruit['KC Grade']}</p>
<p><strong>Archetype:</strong> {recruit.Archetype}</p>


      {/* KC's Take section */}
      {recruit["KC's Take"] && (
        <div className="mt-6 bg-blue-50 border-l-4 border-[#0055a5] p-4 rounded shadow text-gray-900">
          <h3 className="text-2xl font-bold text-[#0055a5] mb-2">KC's Take</h3>
          <p className="text-base leading-relaxed">{recruit["KC's Take"]}</p>
        </div>
      )}
    </div>
  );
}

export default RecruitProfile;
