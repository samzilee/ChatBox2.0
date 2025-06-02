import { Button } from "@/components/ui/button";
import { googleLogin, getUserData } from "../utils/auth.utils.ts";
import googleLogo from "../Assets/images/Logo-google-icon-PNG.png";
import websiteLogo from "../Assets/images/websiteIcon3.png";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export function LoginForm() {
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
    <div className="flex flex-col gap-6 rounded-lg overflow-hidden p-2 bg-[rgba(72,182,232,0.845)] text-foreground">
      <header className=" mb-5 flex flex-col items-center">
        <img src={websiteLogo} alt="logo" />
        <p className="font-bold text-[25px] ">Log in to your account</p>
        <p className=" text-[13px]">
          Welcome back! Sign in to pick up where you left off.
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
              Login with Google
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <NavLink to="/signUp" className="underline underline-offset-4">
            Sign up
          </NavLink>
        </div>
      </main>
    </div>
  );
}
