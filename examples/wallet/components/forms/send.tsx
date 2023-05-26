import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";
import { validEthAddress } from "@/config/constants";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";

export type PageId = "edit" | "inflight" | "proving" | "success" | "fail";

export type SendData = { amount: string; address: string };

import { useZrclib } from "../providers/ZrclibProvider";
import { fromNumberInput } from "@/utils";

export function useSend(isPrivate = true) {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<SendData>();
  const zrclib = useZrclib();
  const router = useRouter();
  const submit = useCallback(
    async (data: SendData) => {
      setData(data);
      setPageId("inflight");
      try {
        if (!isPrivate) {
          console.log("zrclib.publicTransfer");
          await zrclib.publicTransfer(
            fromNumberInput(data.amount),
            data.address
          );
          setPageId("success");
        } else {
          setPageId("proving");
          const proof = await zrclib.proveTransfer(
            fromNumberInput(data.amount),
            data.address
          );
          setPageId("inflight");
          await zrclib.send(proof);
          setPageId("success");
        }
      } catch (err) {
        console.log(err);
        setPageId("fail");
      }
    },
    [isPrivate, zrclib]
  );

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Edit next={submit} back={close} isPrivate={isPrivate} />,
    proving: <Proving data={data!} />,
    inflight: <Inflight data={data!} />,
    success: <Success next={close} />,
    fail: <ErrorDisplay next={close} />,
  };

  const dialog = content[pageId];
  return dialog;
}

export function Edit(p: {
  isPrivate?: boolean;
  next: (data: SendData) => void;
  back: () => void;
}) {
  const Layout = useLayoutTemplate();

  const controller = useForm<SendData>({
    defaultValues: {
      amount: "10",
    },
  });

  const form: FormDataInput<SendData> = {
    title: "Send Token to an address",
    fields: [
      {
        type: "combination",
        label: "Token Amount",
        fields: [
          {
            label: "",
            name: "amount",
            type: "numericfield",
            required: "You must provide an amount",
          },
        ],
      },
      // TODO: Get public key being emitted with eth address so we can correlate addresses
      p.isPrivate
        ? {
            type: "textfield",
            name: "address",
            label: "Reciever's Public Key",
            required: "You must provide a destination to send funds to",
          }
        : {
            type: "textfield",
            name: "address",
            label: "Reciever's EVM Address",
            pattern: {
              value: validEthAddress,
              message: "Please enter an ethereum address",
            },
            required: "You must provide an address to send funds to",
          },
    ],
  };
  return (
    <Layout
      header={form.title}
      body={<FormProcessor<SendData> controller={controller} formData={form} />}
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

export function Proving({ data }: { data: SendData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Sending funds (2/3): Proving`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Generating Zero Knowledge Proof...
            </div>
            <iframe
              src="https://giphy.com/embed/7J7lzuNFHfvqUd52hF"
              width="480"
              height="270"
              className="giphy-embed"
              allowFullScreen
            ></iframe>
            <div>Please wait. This may take some time.</div>
          </div>
          <Horizontal>
            <Spinner size="xl" />
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Layout>
  );
}

export function Inflight({ data }: { data: SendData }) {
  const zrclib = useZrclib();
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Sending funds...`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Sending {data.amount} {zrclib.token} to
              <br />
              {data.address}
            </div>
          </div>
          <Horizontal>
            <Spinner size="xl" />
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Layout>
  );
}

export function ErrorDisplay({ next }: { next: () => void }) {
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
