import { PageLayout } from "@/components/Layout";
import { HomePanel } from "@/components/HomePanel";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Faucet from "@/components/forms/faucet";
import { useAccount } from "wagmi";
import { useZrclib } from "@/components/providers/ZrclibProvider";
import { fromNumberInput } from "@/utils";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const zrclib = useZrclib();
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Faucet.FaucetData>();
  const { address } = useAccount();
  const router = useRouter();
  const submit = useCallback(
    async (data: Faucet.FaucetData) => {
      setData(data);
      setPageId("inflight");
      // Trigger mint
      try {
        await zrclib.faucet(fromNumberInput(data.amount));
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
