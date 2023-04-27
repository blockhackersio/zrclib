import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Shield from "@/components/forms/shield";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Shield.ShieldData>();

  const router = useRouter();
  const submit = useCallback((data: Shield.ShieldData) => {
    setData(data);
    setPageId("inflight");
    // Trigger send
    setTimeout(() => {
      setPageId("success");
    }, 5000);
  }, []);

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Shield.Edit next={submit} back={close} />,
    inflight: <Shield.Inflight data={data!} />,
    success: <Shield.Success next={close} />,
    fail: <Shield.Error next={close} />,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <HomePanel />
    </PageLayout>
  );
}
