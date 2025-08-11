import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

export default function SignIn() {
  const { user } = useAuth();

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
    </div>
  );
}