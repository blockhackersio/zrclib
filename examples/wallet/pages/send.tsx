import { PageLayout } from "@/components/Layout";
import { BaseStack } from "@/components/BaseStack";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Send from "@/components/forms/send";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Send.SendData>();

  const router = useRouter();
  const submit = useCallback((data: Send.SendData) => {
    setData(data);
    setPageId("inflight");
    // Trigger send
    setTimeout(() => {
      setPageId("success");
    }, 5000);
  }, []);

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Send.Edit next={submit} back={close} />,
    inflight: <Send.Inflight data={data!} />,
    success: <Send.Success next={close} />,
    fail: <Send.Error next={close} />,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <BaseStack />
    </PageLayout>
  );
}
