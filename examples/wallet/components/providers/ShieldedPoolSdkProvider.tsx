import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Api = {
  login(s: String): void;
  logout(): void;
  isLoggedIn: boolean;
};
export const ShieldedPoolSdkContext = createContext<Api>({
  isLoggedIn: false,
} as Api);

export function ShieldedPoolSdkProvider(p: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback((password: string) => {
    if (password === "test123") {
      setIsLoggedIn(true);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);
  const api = useMemo(
    () => ({ login, logout, isLoggedIn }),
    [login, logout, isLoggedIn]
  );
  return (
    <ShieldedPoolSdkContext.Provider value={api}>
      {p.children}
    </ShieldedPoolSdkContext.Provider>
  );
}

export function useShieldedPoolSdk() {
  return useContext(ShieldedPoolSdkContext);
}
