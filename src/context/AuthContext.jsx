
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
      }
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (active) {
          setSession(newSession);
        }
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const userId = session?.user?.id;

    async function loadProfile() {
      setLoading(true);

      if (!userId) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, is_verified")
        .eq("id", userId)
        .single();

      if (active) {
        if (error) {
          console.error("Profile error:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setSession(null);
  }

  async function refreshProfile() {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, is_verified")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;
    setProfile(data);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus berada di dalam AuthProvider");
  }

  return context;
}
