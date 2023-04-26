import { Button } from "@/ui/Button";
import { useLayoutTemplate } from "@/ui/Dialog";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";

export type SwapData = {
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
  toAmount: string;
};

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
        },
        {
          type: "dropdown",
          name: "fromCurrency",
          required: true,
          options: [
            { label: "ETH", value: "ETH" },
            { label: "USDC", value: "USDC" },
          ],
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
          required: true,
          options: [
            { label: "ETH", value: "ETH" },
            { label: "USDC", value: "USDC" },
          ],
        },
      ],
    },
  ],
};

export function Edit(p: { next: (data: SwapData) => void; back: () => void }) {
  const Layout = useLayoutTemplate();

  const controller = useForm<SwapData>({
    defaultValues: {
      fromAmount: "0",
      toAmount: "0",
      fromCurrency: "ETH",
      toCurrency: "USDC",
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

export function Success({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Funds have been shielded"
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
    <Layout header={`Swaping funds...`}>
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
