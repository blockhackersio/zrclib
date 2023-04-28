import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { useSend } from "@/components/forms/send";

export default function Home() {
  const dialog = useSend();
  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
