import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { useZrclib } from "../providers/ZrclibProvider";
import { ReactNode, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { fromNumberInput } from "@/utils";

export type FaucetData = { amount: string };

type PageId = "edit" | "inflight" | "success" | "fail";

export function useFaucet() {
  const zrclib = useZrclib();
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<FaucetData>();
  const { address } = useAccount();
  const router = useRouter();
  const submit = useCallback(
    async (data: FaucetData) => {
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
    edit: <Edit next={submit} back={close} />,
    inflight: <Inflight data={data!} />,
    success: <Success next={close} />,
    fail: <Error next={close} />,
  };

  return address && content[pageId];
}

export function Edit(p: {
  next: (data: FaucetData) => void;
  back: () => void;
}) {
  const Layout = useLayoutTemplate();
  const { token } = useZrclib();
  const controller = useForm<FaucetData>({
    defaultValues: {
      amount: "10",
    },
  });
  const form: FormDataInput<FaucetData> = {
    title: `Please select the amount of ${token} you require`,
    fields: [
      {
        type: "combination",
        label: `${token} Amount`,
        fields: [
          {
            name: "amount",
            type: "numericfield",
            right: token,
          },
        ],
      },
    ],
  };

  return (
    <Layout
      header={form.title}
      body={
        <FormProcessor<FaucetData> controller={controller} formData={form} />
      }
      footer={
        <Horizontal right gap>
          <Button onClick={p.back} color="gray">
            Cancel
          </Button>
          <Button onClick={controller.handleSubmit(p.next)}>
            Give me coins!
          </Button>
        </Horizontal>
      }
    />
  );
}

export function Success({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Funds have been minted"
      body={<div>Your should see funds in your wallet</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}

export function Inflight({ data }: { data: FaucetData }) {
  const Layout = useLayoutTemplate();
  const { token } = useZrclib();
  return (
    <Layout header={`Minting ${data.amount} ${token}...`}>
      <Horizontal>
        <Spinner size="xl" />
      </Horizontal>
    </Layout>
  );
}

export function Error({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Oh snap!"
      body={<div>It was a failure!</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}
