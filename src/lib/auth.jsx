import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [role, setRole] = useState(null);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setRole(null);
    supabase.from("profiles").select("role").eq("id", session.user.id).single()
      .then(({ data, error }) => {
        if (error) console.error("profiles error:", error);
        setRoleError(error ? `${error.code || ""} ${error.message}` : null);
        setRole(data?.role ?? "none");
      });
  }, [session?.user?.id]);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();
  return <Ctx.Provider value={{ session, role, roleError, email: session?.user?.email, signIn, signOut }}>{children}</Ctx.Provider>;
}
