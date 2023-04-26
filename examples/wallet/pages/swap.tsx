import { PageLayout } from "@/components/Layout";
import { BaseStack } from "@/components/BaseStack";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Swap from "@/components/forms/swap";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Swap.SwapData>();

  const router = useRouter();
  const submit = useCallback((data: Swap.SwapData) => {
    setData(data);
    setPageId("inflight");
    // Trigger send
    setTimeout(() => {
      setPageId("success");
    }, 5000);
  }, []);

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Swap.Edit next={submit} back={close} />,
    inflight: <Swap.Inflight data={data!} />,
    success: <Swap.Success next={close} />,
    fail: <Swap.Error next={close} />,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <BaseStack />
    </PageLayout>
  );
}
