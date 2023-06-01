import { PageLayout } from "@/components/Layout";
import { Main } from "@/components/Main";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import * as Unshield from "@/components/forms/unshield";
import { useZrclib } from "@/components/providers/ZrclibProvider";
import { fromNumberInput } from "@/utils";

type PageId = "edit" | "proving" | "inflight" | "success" | "fail";

export default function Home() {
  const zrclib = useZrclib();
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<Unshield.UnshieldData>();
  console.log({ pageId });
  const router = useRouter();
  const submit = useCallback(
    async (data: Unshield.UnshieldData) => {
      setData(data);
      // Trigger send
      try {
        setPageId("proving");
        const proof = await zrclib.proveUnshield(fromNumberInput(data.amount));
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
    edit: <Unshield.Edit next={submit} back={close} />,
    proving: <Unshield.Proving data={data!} />,
    inflight: <Unshield.Inflight data={data!} />,
    success: <Unshield.Success next={close} />,
    fail: <Unshield.Error next={close} />,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <Main />
    </PageLayout>
  );
}
