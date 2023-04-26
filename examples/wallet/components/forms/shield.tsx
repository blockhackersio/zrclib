import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";
import { validEthAddress } from "@/config/constants";
import { useLayoutTemplate } from "@/ui/LayoutProvider";

export type ShieldData = { amount: string; currency: string };

const form: FormDataInput<ShieldData> = {
  title: "Shield Tokens",
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
        {
          type: "dropdown",
          label: "",
          name: "currency",
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

export function Edit(p: {
  next: (data: ShieldData) => void;
  back: () => void;
}) {
  const Layout = useLayoutTemplate();

  const controller = useForm<ShieldData>({
    defaultValues: {
      amount: "10",
    },
  });

  return (
    <Layout
      header={form.title}
      body={
        <FormProcessor<ShieldData> controller={controller} formData={form} />
      }
      footer={
        <Horizontal right gap>
          <Button onClick={p.back} color="gray">
            Cancel
          </Button>
          <Button onClick={controller.handleSubmit(p.next)}>
            Shield Tokens
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

export function Inflight({ data }: { data: ShieldData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Shielding funds...`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Shielding {data.amount} {data.currency}
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
