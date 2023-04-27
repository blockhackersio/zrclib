import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Shield from "@/components/forms/shield";
import { useZrclib } from "@/components/providers/ZrclibProvider";
import { fromNumberInput } from "@/utils";

type PageId = "edit" | "proving" | "approval" | "inflight" | "success" | "fail";

export default function Home() {
  const zrclib = useZrclib();
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Shield.ShieldData>();
  console.log({ pageId });
  const router = useRouter();
  const submit = useCallback(
    async (data: Shield.ShieldData) => {
      setData(data);
      // Trigger send
      try {
        setPageId("approval");
        await zrclib.approve(fromNumberInput(data.amount));
        setPageId("proving");
        const proof = await zrclib.proveShield(fromNumberInput(data.amount));
        setPageId("inflight");
        await zrclib.send(proof);
      } catch (err) {
        console.log(err);
        setPageId("fail");
        return;
      }
      setPageId("success");
    },
    [zrclib]
  );

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Shield.Edit next={submit} back={close} />,
    approval: <Shield.Approval data={data!} />,
    proving: <Shield.Proving data={data!} />,
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
