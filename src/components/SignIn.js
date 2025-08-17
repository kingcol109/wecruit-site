import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

export default function SignIn() {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="p-4">
      {user ? (
        <div className="space-y-2">
          <p className="mb-2 font-semibold text-gray-800">
            Signed in as {user.displayName}
          </p>
          <div className="flex space-x-4 items-center">
            <Link
              to="/profile"
              className="px-4 py-2 font-extrabold uppercase tracking-wide text-white rounded
                         bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110"
            >
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 font-extrabold uppercase tracking-wide text-white rounded
                         bg-red-600 border-4 border-[#f6a21d] shadow hover:brightness-110"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 font-extrabold uppercase tracking-wide text-white rounded
                         bg-green-600 border-4 border-[#f6a21d] shadow hover:brightness-110"
            >
              Request Player
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-6 py-3 font-extrabold uppercase tracking-wide text-white rounded
                     bg-[#0055a5] border-4 border-[#f6a21d] shadow hover:brightness-110"
        >
          Sign In with Google
        </button>
      )}

      {showRequestForm && (
        <RequestPlayerForm onClose={() => setShowRequestForm(false)} user={user} />
      )}
    </div>
  );
}

function RequestPlayerForm({ onClose, user }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [school, setSchool] = useState("");
  const [classYear, setClassYear] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await addDoc(collection(db, "requestesRecruits"), {
      name,
      position,
      school,
      class: classYear,
      comment,
      requestedBy: user.uid,
      timestamp: serverTimestamp(),
    });

    setLoading(false);
    onClose();
    alert("Player request submitted!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Request a Player</h2>
        <input
          className="w-full border p-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full border p-2"
          placeholder="Position (optional)"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <input
          className="w-full border p-2"
          placeholder="High School (optional)"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
        />
        <input
          className="w-full border p-2"
          placeholder="Class (e.g. 2026)"
          value={classYear}
          onChange={(e) => setClassYear(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            className="text-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}