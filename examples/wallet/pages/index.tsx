import { PageLayout } from "@/components/Layout";
import { BaseStack } from "@/components/BaseStack";
import { getWasmFileLocation, getZkeyFileLocation } from "@zrclib/sdk";
export default function Home() {
  console.log(getWasmFileLocation());
  console.log(getZkeyFileLocation());
  return (
    <PageLayout title="coinshield">
      <BaseStack />
    </PageLayout>
  );
}
