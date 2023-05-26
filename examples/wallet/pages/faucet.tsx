import { PageLayout } from "@/components/Layout";
import { Main } from "@/components/Main";
import { useFaucet } from "@/components/forms/faucet";

export default function Home() {
  const dialog = useFaucet();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <Main />
    </PageLayout>
  );
}
