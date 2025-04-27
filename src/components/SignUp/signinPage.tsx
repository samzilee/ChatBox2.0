import { SignUpForm } from "../signup-form";

const signinPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-300">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
};

export default signinPage;
