import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { useLayoutTemplate } from "@/ui/LayoutProvider";

export type LoginData = { password: string };

const form: FormDataInput<LoginData> = {
  title: "Enter your password to unlock your account!",
  fields: [
    {
      type: "password",
      name: "password",
      submit: true,
      submitText: "Unlock",
      label: "Enter your password",
    },
  ],
};

export function Edit(p: { next: (data: LoginData) => void }) {
  const Layout = useLayoutTemplate();

  const controller = useForm<LoginData>();

  return (
    <Layout
      header={form.title}
      body={
        <FormProcessor<LoginData>
          controller={controller}
          formData={form}
          onSubmit={p.next}
        />
      }
    />
  );
}
