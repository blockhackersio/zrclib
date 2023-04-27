import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { useZrclib } from "../providers/ZrclibProvider";
import { getTokenFromAddress } from "@/contracts/get_contract";

export type UnshieldData = { amount: string; currency: string };

export function Edit(p: {
  next: (data: UnshieldData) => void;
  back: () => void;
}) {
  const { asset, chainId } = useZrclib();

  const token = asset && getTokenFromAddress(asset, chainId);

  const form: FormDataInput<UnshieldData> = {
    title: "Unshield Tokens",
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
  const Layout = useLayoutTemplate();

  const controller = useForm<UnshieldData>({
    defaultValues: {
      amount: "10",
    },
  });

  return (
    <Layout
      header={form.title}
      body={
        <FormProcessor<UnshieldData> controller={controller} formData={form} />
      }
      footer={
        <Horizontal right gap>
          <Button onClick={p.back} color="gray">
            Cancel
          </Button>
          <Button onClick={controller.handleSubmit(p.next)}>
            Unshield Tokens
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
      header="Funds have been unshielded"
      body={<div>Your should see funds in your wallet</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}

export function Proving({ data }: { data: UnshieldData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Unshielding funds (1/2): Proving`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Generating Zero Knowledge Proof...
            </div>
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

export function Inflight({ data }: { data: UnshieldData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Unshielding funds (2/2): Sending Transaction`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">Sending Transaction</div>
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
