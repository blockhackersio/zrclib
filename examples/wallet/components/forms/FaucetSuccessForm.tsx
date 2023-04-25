import { Button } from "@/ui/Button";
import { DialogContentProps, ModalLayout } from "@/ui/Dialog";
import { Horizontal } from "@/ui/Horizontal";
import { useState } from "react";

export function FaucetSuccessForm({
  Layout = ModalLayout,
  next,
}: DialogContentProps & { next: () => void }) {
  const [value, setvalue] = useState(10);
  return (
    <Layout
      header="Congratulations!"
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    >
      <div>It was a success!</div>
    </Layout>
  );
}
