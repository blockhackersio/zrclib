import { PageLayout } from "@/components/Layout";
import { BaseStack } from "@/components/BaseStack";
import { DialogContent } from "@/ui/Dialog";
import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { ReactNode, useCallback, useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { Spinner } from "flowbite-react";
import { FaucetEditForm } from "@/components/forms/FaucetEditForm";
import { FaucetInflightForm } from "@/components/forms/FaucetInflightForm";
import { FaucetSuccessForm } from "@/components/forms/FaucetSuccessForm";

type PageId = "edit" | "inflight" | "success" | "fail";

export default function Home() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const router = useRouter();
  const submit = useCallback(() => {
    setPageId("inflight");
    setTimeout(() => {
      setPageId("success");
    }, 5000);
  }, []);

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <FaucetEditForm next={submit} back={close} />,
    inflight: <FaucetInflightForm />,
    success: <FaucetSuccessForm next={close} />,
    fail: <></>,
  };

  const dialog = content[pageId];

  return (
    <PageLayout dialogContent={dialog} title="coinshield">
      <BaseStack />
    </PageLayout>
  );
}
