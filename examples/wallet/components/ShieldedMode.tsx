import { Tabs } from "flowbite-react";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";

export const ShieldedContext = createContext<{
  isShielded: boolean;
  setShielded: Dispatch<SetStateAction<boolean>>;
}>({
  isShielded: false,
  setShielded() {},
});

export function useShieldedApi() {
  return useContext(ShieldedContext);
}

export function ShieldedProvider(p: { children: ReactNode }) {
  const [isShielded, setShielded] = useState(false);
  const value = useMemo(() => ({ isShielded, setShielded }), [isShielded]);
  return (
    <div>
      <ShieldedContext.Provider value={value}>
        {p.children}
      </ShieldedContext.Provider>
    </div>
  );
}

export function ShieldedTabs(p: { public: ReactNode; private: ReactNode }) {
  const { isShielded, setShielded } = useShieldedApi();
  return (
    <Tabs.Group aria-label="Select privacy mode" style={"underline"}>
      <Tabs.Item
        active={!isShielded}
        title="Public"
        onClick={() => setShielded(false)}
      >
        {p.public}
      </Tabs.Item>
      <Tabs.Item
        active={isShielded}
        title="Private"
        onClick={() => setShielded(true)}
      >
        {p.private}
      </Tabs.Item>
    </Tabs.Group>
  );
}
