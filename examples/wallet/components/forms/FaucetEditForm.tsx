import { Button } from "@/ui/Button";
import { DialogContentProps, ModalLayout } from "@/ui/Dialog";
import { Horizontal } from "@/ui/Horizontal";
import { Label, TextInput } from "flowbite-react";
import { useState } from "react";

export function FaucetEditForm({
  Layout = ModalLayout,
  next,
  back,
}: DialogContentProps & { next: () => void; back: () => void }) {
  const [value, setvalue] = useState(10);
  return (
    <Layout
      header="Please select the amount of ETH you want"
      footer={
        <Horizontal right gap>
          <Button onClick={back} color="gray">
            Cancel
          </Button>
          <Button onClick={next}>Give me coins!</Button>
        </Horizontal>
      }
    >
      <form className="flex flex-col gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="tokenValue" value="ETH Amount" />
          </div>
          <TextInput
            id="tokenValue"
            type="number"
            placeholder="10"
            value={value}
            onChange={(e: { target: { value: string } }) =>
              setvalue(Number(e.target.value))
            }
            required={true}
            shadow={true}
          />
        </div>
      </form>
    </Layout>
  );
}
