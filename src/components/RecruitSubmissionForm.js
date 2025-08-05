// src/components/RecruitSubmissionForm.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

const gradeOptions = [
  '1 - Early Impact',
  '2 - Early Contributor',
  '3 - Year 2 Contributor',
  '4 - High Developmental',
  '5 - Medium Developmental',
  '6 - High End Depth',
  '7 - Depth',
  '8 - Watchlist',
];

const strengthsList = [
  'Arm Strength', 'Deep Accuracy', 'Explosiveness', 'Long Speed', 'Change of Direction',
  'Feel for the Game', 'Quick Release', 'Off Script', 'Physicality', 'Big Frame',
  'Playing Strength', 'Ball Skills', 'Route Running', 'Vision/Patience', 'Natural Hands Catcher',
  'RAC Ability', 'Ball Tracking', 'Bend/Flexibility', 'Pass Rush Moves', 'Contact Balance',
  'Ball Placement', 'Elusiveness', 'Position Versatility', 'Low Pad Level', 'Lateral Agility',
  'Block Finishes', 'Zone Instincts', 'Press Man', 'Fluid Hips'
];

const schools = [
  'Akron', 'Alabama', 'Appalachian State', 'Arizona', 'Arkansas State', 'Arizona State', 'Arkansas', 'Auburn',
  'Ball State', 'Baylor', 'Boise State', 'Boston College', 'Bowling Green', 'Buffalo', 'BYU', 'Cal', 'CMU',
  'Charlotte', 'Cincinatti', 'Clemson', 'Coastal Carolina', 'Colorado', 'Colorado State', 'Duke', 'ECU', 'EMU',
  'FAU', 'FIU', 'Florida', 'Florida State', 'Fresno State', 'UGA', 'Georgia Southern', 'Georgia State',
  'Georgia Tech', 'Hawaii', 'Houston', 'Illinois', 'Indiana', 'Iowa', 'Iowa State', 'Kansas', 'Kansas State',
  'Kent State', 'Kentucky', 'Liberty', 'Louisiana', 'Louisiana-Monroe', 'Lousiana Tech', 'LSU', 'Marshall',
  'Maryland', 'Memphis', 'Miami (FL)', 'Miami (OH)', 'Michigan', 'Michigan State', 'Middle Tennessee',
  'Minnesota', 'Mississippi State', 'Missouri', 'NC State', 'Nebraska', 'Nevada', 'New Mexico',
  'New Mexico State', 'North Carolina', 'North Texas', 'Northern Illinois', 'Northwestern', 'Notre Dame',
  'Ohio', 'Ohio State', 'Oklahoma', 'Oklahoma State', 'Old Dominion', 'Ole Miss', 'Oregon', 'Oregon State',
  'Penn State', 'Pittsburgh', 'Purdue', 'Rice', 'Rutgers', 'San Diego State', 'San Jose State', 'SMU',
  'South Alabama', 'South Carolina', 'South Florida', 'Southern Miss', 'Stanford', 'Syracuse', 'TCU', 'Temple',
  'Tennessee', 'Texas', 'Texas A&M', 'Texas State', 'Texas Tech', 'Toledo', 'Troy', 'Tulane', 'Tulsa', 'UAB',
  'UCF', 'UCLA', 'Uconn', 'Umass', 'UNLV', 'USC', 'UTEP', 'UTSA', 'Utah', 'Utah State', 'Vanderbilt',
  'Virginia', 'Virginia Tech', 'Wake Forest', 'Washington', 'Washington State', 'West Virginia',
  'Western Kentucky', 'Western Michigan', 'Wisconsin', 'Wyoming'
];

export default function RecruitSubmissionForm({ recruitId }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    grade: '',
    strengths: [],
    predictedSchool: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const ref = doc(db, `recruits/${recruitId}/userSubmissions/${user.uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFormData(snap.data());
        setExisting(true);
      }
      setLoading(false);
    };
    fetch();
  }, [user, recruitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStrengthChange = (e) => {
    const { value } = e.target;
    setFormData(prev => {
      const exists = prev.strengths.includes(value);
      if (exists) {
        return { ...prev, strengths: prev.strengths.filter(s => s !== value) };
      } else if (prev.strengths.length < 3) {
        return { ...prev, strengths: [...prev.strengths, value] };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const ref = doc(db, `recruits/${recruitId}/userSubmissions/${user.uid}`);
    await setDoc(ref, {
      ...formData,
      submittedAt: new Date(),
      editedAt: new Date()
    });
    setExisting(true);
    alert('Submission saved!');
  };

  const handleDelete = async () => {
    if (!user) return;
    const ref = doc(db, `recruits/${recruitId}/userSubmissions/${user.uid}`);
    await deleteDoc(ref);
    setFormData({ grade: '', strengths: [], predictedSchool: '', comment: '' });
    setExisting(false);
    alert('Submission deleted.');
  };

  if (!user) return <p className="p-4">Please sign in to submit your evaluation.</p>;
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white shadow rounded">
      <div>
        <label className="block mb-1 font-medium">Grade</label>
        <select name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">Select grade...</option>
          {gradeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Strengths (max 3)</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-scroll">
          {strengthsList.map(str => (
            <label key={str} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={str}
                checked={formData.strengths.includes(str)}
                onChange={handleStrengthChange}
              />
              <span>{str}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Predicted School</label>
        <select
          name="predictedSchool"
          value={formData.predictedSchool}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select school...</option>
          {schools.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Comment</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {existing ? 'Update Submission' : 'Submit Evaluation'}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
