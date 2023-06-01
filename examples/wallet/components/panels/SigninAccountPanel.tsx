import * as Login from "@/components/forms/login";

export function SigninAccountPanel(p: {
  onSignin: (password: string) => void;
}) {
  const next = (data: Login.LoginData) => {
    p.onSignin && p.onSignin(data.password);
  };
  return <Login.Edit next={next} />;
}
