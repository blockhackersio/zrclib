import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { useShield } from "@/components/forms/shield";

export default function Home() {
  const dialog = useShield();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
