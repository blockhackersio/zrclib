import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { useFaucet } from "@/components/forms/faucet";

export default function Home() {
  const dialog = useFaucet();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
