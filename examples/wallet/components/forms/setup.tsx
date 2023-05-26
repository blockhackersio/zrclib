import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { Horizontal } from "@/ui/Horizontal";
import { Button } from "@/ui/Button";

// export type LoginData = { password: string };

// const form: FormDataInput<LoginData> = {
//   title: "Select a password with which to lock your data!",
//   fields: [
//     {
//       type: "password",
//       name: "password",
//       submit: true,
//       submitText: "Lock",
//       label: "Enter a password",
//     },
//   ],
// };

export function Start(p: { next?: () => void }) {
  const Layout = useLayoutTemplate();

  return (
    <Layout
      header={"No account found"}
      body={
        <div className="mb-4">
          No local account has been setup for this browser. <br />
          Setup your account by connecting your wallet.
        </div>
      }
      footer={
        <Horizontal gap>
          <Button onClick={p.next}>Connect Wallet</Button>
        </Horizontal>
      }
    />
  );
}

export type CreatePasswordData = { password: string };

export function Create(p: {
  next?: (data: CreatePasswordData) => void;
  chainName: string;
}) {
  const Layout = useLayoutTemplate();

  const controller = useForm<CreatePasswordData>();
  const title = "Create Account";
  return (
    <Layout
      header={title}
      body={
        <div>
          <div>
            No account exists for {p.chainName}
            <br />
            <br />
          </div>
          <FormProcessor<CreatePasswordData>
            controller={controller}
            formData={{
              title,
              fields: [
                {
                  type: "password",
                  name: "password",
                  submit: true,
                  submitText: "Connect & Create Account",
                  label: "Select a password with which to lock your data!",
                  required: "You must provide a password",
                },
              ],
            }}
            onSubmit={p.next}
          />
          <div>
            This will create a local indexDB database to store encrypted
            information that is only decryptable via your password
          </div>
        </div>
      }
    />
  );
}
