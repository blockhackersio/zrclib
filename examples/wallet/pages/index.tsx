import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { getWasmFileLocation, getZkeyFileLocation } from "@zrclib/sdk";
export default function Home() {
  console.log(getWasmFileLocation());
  console.log(getZkeyFileLocation());
  return (
    <PageLayout title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
