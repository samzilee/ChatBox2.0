import { LoginForm } from "../login-form";
import { login } from "../../utils/auth.utils";

const Page = () => {
  login();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default Page;
