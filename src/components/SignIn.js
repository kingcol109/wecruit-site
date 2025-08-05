import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";

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
        <>
          <p className="mb-2">Signed in as {user.displayName}</p>
          <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </>
      ) : (
        <button onClick={handleSignIn} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign In with Google
        </button>
      )}
    </div>
  );
}
