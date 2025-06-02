import { Button } from "@/components/ui/button";
import { googleLogin, getUserData } from "../utils/auth.utils.ts";
import googleLogo from "../Assets/images/Logo-google-icon-PNG.png";
import websiteLogo from "../Assets/images/websiteIcon3.png";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export function SignUpForm() {
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(false);
    handleCheckSession();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    googleLogin();
  };

  const handleCheckSession = async () => {
    try {
      const response = await getUserData();

      if (response) {
        console.log("Session Found");
        window.location.href = "/";
      }
    } catch (error) {
      console.log("No Session Found");
    }
  };

  return (
    <div className="flex flex-col gap-6  rounded-lg overflow-hidden bg-[rgba(64,188,145,0.845)] p-2 text-foreground">
      <header className=" mb-5 flex flex-col items-center">
        <img src={websiteLogo} alt="webLog" />
        <p className="font-bold text-[25px] ">Create an account</p>
        <p className=" text-[13px]">
          Sign up to create an account and explore many things
        </p>
      </header>
      <main className="w-full bg-secondary p-2 rounded-lg">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Button
              className={`w-full cursor-pointer ${
                loading ? "pointer-events-none" : "pointer-events-auto"
              }`}
              type="button"
              onClick={() => handleGoogleLogin()}
            >
              {loading ? (
                <div
                  className={`w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin`}
                ></div>
              ) : (
                <img
                  src={googleLogo}
                  alt="google logo"
                  width={20}
                  height={20}
                  className="rounded-full "
                />
              )}{" "}
              Sign in with Google
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <NavLink to="/login" className="underline underline-offset-4">
            LogIn
          </NavLink>
        </div>
      </main>
    </div>
  );
}
