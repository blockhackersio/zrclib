import { PageLayout } from "@/components/Layout";
import { Main } from "@/components/Main";
import { useSend } from "@/components/forms/send";

export default function Home() {
  const dialog = useSend(false);
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <Main />
    </PageLayout>
  );
}
