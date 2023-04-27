import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Faucet from "@/components/forms/faucet";
import { useAccount } from "wagmi";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Faucet.FaucetData>();
  const { address } = useAccount();

  const router = useRouter();
  const submit = useCallback((data: Faucet.FaucetData) => {
    setData(data);
    setPageId("inflight");
    // Trigger mint
    setTimeout(() => {
      setPageId("success");
    }, 5000);
  }, []);

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Faucet.Edit next={submit} back={close} />,
    inflight: <Faucet.Inflight data={data!} />,
    success: <Faucet.Success next={close} />,
    fail: <Faucet.Error next={close} />,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={address && dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
