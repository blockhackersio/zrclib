import { PageLayout } from "@/components/Layout";
import { Main } from "@/components/Main";
import { useShield } from "@/components/forms/shield";

export default function Home() {
  const dialog = useShield();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <Main />
    </PageLayout>
  );
}
