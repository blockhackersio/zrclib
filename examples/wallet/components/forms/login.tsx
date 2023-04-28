import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { useLayoutTemplate } from "@/ui/LayoutProvider";

export type LoginData = { password: string };

const form: FormDataInput<LoginData> = {
  title: "Select a password with which to lock your data!",
  fields: [
    {
      type: "password",
      name: "password",
      submit: true,
      submitText: "Lock",
      label: "Enter a password",
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
