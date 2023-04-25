import { Spinner } from "flowbite-react";
import { DialogContentProps, ModalLayout } from "@/ui/Dialog";
export function FaucetInflightForm({
  Layout = ModalLayout,
}: DialogContentProps) {
  return (
    <Layout>
      <Spinner size="xl" />;
    </Layout>
  );
}
