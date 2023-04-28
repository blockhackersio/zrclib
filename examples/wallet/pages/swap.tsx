import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { useSwapFlow } from "@/components/forms/swap";

export default function Home() {
  const dialog = useSwapFlow();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
