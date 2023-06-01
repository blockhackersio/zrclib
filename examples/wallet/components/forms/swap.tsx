import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { useZrclib } from "../providers/ZrclibProvider";
import { getAssets, getTokenFromAddress } from "@/contracts/get_contract";
import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { fromNumberInput } from "@/utils";

export type SwapData = {
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
  toAmount: string;
};

type PageId =
  | "edit"
  | "proofreshield"
  | "proofunshield"
  | "inflight"
  | "success"
  | "fail";

export function useSwapFlow() {
  const [pageId, setPageId] = useState<PageId>("edit");
  const [data, setData] = useState<SwapData>();
  const zrclib = useZrclib();
  const router = useRouter();
  const submit = useCallback(
    async (data: SwapData) => {
      if (!zrclib.asset) {
        throw new Error("FROM_CURRENCY_UNDEFINED");
      }

      const { fromAmount, toAmount, toCurrency } = data;
      const enrichedData = {
        fromAmount,
        toAmount,
        toCurrency,
        fromCurrency: zrclib.asset,
      };
      setData(enrichedData);
      try {
        setPageId("proofreshield");
        let reshieldProof = await zrclib.proveSwapReshield(
          fromNumberInput(toAmount),
          toCurrency
        );

        setPageId("proofunshield");
        const proof = await zrclib.proveSwapUnshield(
          fromNumberInput(fromAmount),
          fromNumberInput(toAmount),
          enrichedData.fromCurrency,
          enrichedData.toCurrency,
          reshieldProof
        );
        setPageId("inflight");
        await zrclib.transactAndSwap(proof);
        setPageId("success");
      } catch (err) {
        console.log(err);
        setPageId("fail");
        return;
      }
    },
    [zrclib]
  );

  const close = () => router.push("/");

  const content: Record<PageId, ReactNode> = {
    edit: <Edit next={submit} back={close} />,
    proofreshield: <ProvingOne data={data!} />,
    proofunshield: <ProvingTwo data={data!} />,
    inflight: <Inflight data={data!} />,
    success: <Success next={close} />,
    fail: <ErrorPage next={close} />,
  };

  return content[pageId];
}

export function Edit(p: { next: (data: SwapData) => void; back: () => void }) {
  const { token, asset, chainId } = useZrclib();

  const form: FormDataInput<SwapData> = {
    title: "Swap Tokens",
    fields: [
      {
        type: "combination",
        label: "From",
        fields: [
          {
            name: "fromAmount",
            type: "numericfield",
            required: "You must provide an amount",
            validate: (i) => Number(i) > 0,
            right: token,
          },
        ],
      },
      {
        type: "combination",
        label: "To",
        fields: [
          {
            name: "toAmount",
            type: "numericfield",
            required: "You must provide an amount",
          },
          {
            type: "dropdown",
            name: "toCurrency",
            required: "You must select a token",
            options: getAssets(chainId).map((asset) => {
              return {
                label: getTokenFromAddress(asset, chainId) as string,
                value: asset,
              };
            }),
          },
        ],
      },
    ],
  };

  const Layout = useLayoutTemplate();

  const controller = useForm<SwapData>({
    defaultValues: {
      fromAmount: "0",
      toAmount: "0",
      toCurrency: "",
    },
  });

  return (
    <Layout
      header={form.title}
      body={<FormProcessor<SwapData> controller={controller} formData={form} />}
      footer={
        <Horizontal right gap>
          <Button onClick={p.back} color="gray">
            Cancel
          </Button>
          <Button onClick={controller.handleSubmit(p.next)}>Swap Tokens</Button>
        </Horizontal>
      }
    />
  );
}

export function ProvingOne({ data }: { data: SwapData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Swapping (1/3): Proving Reshield`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Generating Zero Knowledge Proof...
            </div>{" "}
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
export function ProvingTwo({ data }: { data: SwapData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Swapping (2/3): Proving Unshield`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Generating Zero Knowledge Proof...
            </div>
            <iframe
              src="https://giphy.com/embed/w8f9g2x44aGI"
              width="480"
              height="261"
              className="giphy-embed"
              allowFullScreen
            ></iframe>
            <div>Please wait. This may take even longer...</div>
          </div>
          <Horizontal>
            <Spinner size="xl" />
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Layout>
  );
}

export function Success({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Funds have been swapped!"
      body={<div>Your should see funds in your wallet</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}

export function Inflight({ data }: { data: SwapData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Sending transaction to swap funds...`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Swaping {data.fromAmount} {data.fromCurrency} to {data.toAmount}{" "}
              {data.toCurrency}
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

export function ErrorPage({ next }: { next: () => void }) {
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
