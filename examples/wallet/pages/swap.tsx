import { PageLayout } from "@/components/Layout";
import { Main } from "@/components/Main";
import { useSwapFlow } from "@/components/forms/swap";

export default function Home() {
  const dialog = useSwapFlow();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <Main />
    </PageLayout>
  );
}
