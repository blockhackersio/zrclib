import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { availableTokens } from "@/config/constants";
import { useLayoutTemplate } from "@/ui/LayoutProvider";

export type FaucetData = { amount: string; currency: string };

const form: FormDataInput<FaucetData> = {
  title: "Please select the amount of tokens you require",
  fields: [
    {
      type: "combination",
      label: "Token Amount",
      fields: [
        {
          name: "amount",
          type: "numericfield",
        },
        {
          type: "dropdown",
          name: "currency",
          options: availableTokens.map((token) => ({
            label: token,
            value: token,
          })),
        },
      ],
    },
  ],
};

export function Edit(p: {
  next: (data: FaucetData) => void;
  back: () => void;
}) {
  const Layout = useLayoutTemplate();

  const controller = useForm<FaucetData>({
    defaultValues: {
      amount: "10",
    },
  });

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
  return (
    <Layout header={`Minting ${data.amount} ${data.currency}...`}>
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
