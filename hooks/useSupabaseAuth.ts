import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

const AUTH_TIMEOUT_MS = 5000; // 5 seconds max for auth

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const loadingCompleted = useRef(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Force complete loading after timeout (failsafe for offline)
    timeoutId = setTimeout(() => {
      if (!loadingCompleted.current) {
        console.log('Auth timeout - continuing in offline mode');
        loadingCompleted.current = true;
        setIsOffline(true);
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    // Get initial session with error handling for offline mode
    const initSession = async () => {
      if (loadingCompleted.current) return;

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!loadingCompleted.current) {
          loadingCompleted.current = true;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsOffline(false);
          setLoading(false);
        }
      } catch (error) {
        // Network error - app is offline, continue without auth
        console.log('Offline mode: Unable to fetch session');
        if (!loadingCompleted.current) {
          loadingCompleted.current = true;
          setIsOffline(true);
          setLoading(false);
        }
      }
    };

    // Setup auth listener with error handling
    const setupListener = () => {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          (_event: AuthChangeEvent, currentSession: Session | null) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (!loadingCompleted.current) {
              loadingCompleted.current = true;
              setLoading(false);
            }
            setIsOffline(false);
          }
        );
        subscription = data.subscription;
      } catch (error) {
        console.log('Could not setup auth listener (offline)');
      }
    };

    setupListener();
    initSession();

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  return { user, session, loading, isOffline };
}
