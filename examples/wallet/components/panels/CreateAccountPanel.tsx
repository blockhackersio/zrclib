import * as Login from "@/components/forms/login";
import * as Setup from "@/components/forms/setup";

export function CreateAccountPanel(p: {
  onCreateAccount: (password: string) => void;
  chainName: string;
}) {
  const next = (data: Login.LoginData) => {
    p.onCreateAccount && p.onCreateAccount(data.password);
  };
  return <Setup.Create next={next} chainName={p.chainName} />;
}
