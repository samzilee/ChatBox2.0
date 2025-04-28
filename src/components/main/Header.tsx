import webIcon from "../../Assets/websiteIcon2.png";
import { useSidebar } from "../ui/sidebar";
import { AiOutlineMenu } from "react-icons/ai";
import defaultProfile from "../../Assets/defaultProfile.png";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import settingsIcon from "../../Assets/settings-icon.png";
import signOutIcon from "../../Assets/sign-out-icon.png";
import { signOut } from "../../utils/auth.utils.ts";
import { Link } from "react-router-dom";

const Header = ({ userData }: any) => {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();
  const [accBlock, setAccBlock] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const accBlockRef = useRef(null);

  useEffect(() => {
    if (loggingOut) {
      document.body.style.opacity = "0.5";
      document.body.style.pointerEvents = "none";
    }
  }, [loggingOut]);

  const handleMenu = () => {
    setAccBlock((prev) => {
      if (prev) return false;
      return true;
    });
  };

  useEffect(() => {
    if (accBlock) {
      document.addEventListener("scroll", () => setAccBlock(false));
    }
    document.removeEventListener("scroll", () => setAccBlock(false));
  }, [accBlock]);

  const handleSignOut = async () => {
    if (userData) {
      try {
        setLoggingOut(true);
        const result = await signOut();
        if (result) {
          window.location.href = "/logIn";
        }
      } catch (error) {
        setLoggingOut(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const block: any = accBlockRef.current;
    if (!accBlock && block) return;

    const handleClickOutside = (event: any) => {
      if (!block.contains(event?.target)) {
        handleMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accBlock]);

  return (
    <header
      className="border-b border-gray-200 flex justify-between items-center p-2 px-3 h-[58px] sticky top-0 bg-white z-10
    "
    >
      {/* Right Side of the header */}
      <div className="flex items-center gap-2 ">
        <div className=" p-1 hover:bg-gray-100">
          <AiOutlineMenu
            onClick={
              isMobile
                ? () => setOpenMobile(openMobile ? false : true)
                : () => setOpen(open ? false : true)
            }
            className="w-[24px] h-[24px]"
          />
        </div>
        <img
          src={webIcon}
          alt="Website Icon"
          width={120}
          className={`${open && !isMobile ? "hidden" : "block"}`}
        />
      </div>

      {/* Left side of the header */}
      <div className="relative">
        {userData ? (
          <img
            loading="lazy"
            src={userData ? userData.picture : defaultProfile}
            alt="avatar"
            className="w-[40px] rounded-full cursor-pointer"
            onClick={handleMenu}
          />
        ) : (
          <div className="flex gap-3">
            <Link to="/signUp">
              <Button
                size="sm"
                className="bg-[rgba(64,188,145,0.845)] hover:bg-[rgba(64,188,145,0.6)] cursor-pointer"
              >
                SignUp
              </Button>
            </Link>

            <Link to="/logIn">
              <Button
                size="sm"
                className="cursor-pointer bg-[rgba(72,182,232,0.845)] hover:bg-[rgba(72,182,232,0.6)]"
              >
                LogIn
              </Button>
            </Link>
          </div>
        )}

        <div
          className={`absolute bg-gray-300 right-0 top-[45px] rounded-lg overflow-hidden ${
            accBlock ? "block" : "hidden"
          }`}
          ref={accBlockRef}
        >
          <section className="flex gap-2 p-3">
            <div className="w-[80px] h-[80px]">
              <img
                loading="lazy"
                src={userData ? userData.picture : defaultProfile}
                alt="Avatar"
                className=" rounded-full size-full"
              />
            </div>
            <div className="flex flex-col">
              <p>Samzi</p>
              <p className="text-gray-600 text-[15px]">
                salihukoko40@gmail.com
              </p>
              <Button
                className=" cursor-pointer"
                onClick={() =>
                  (window.location.href =
                    "https://accounts.google.com/ManageAccount")
                }
              >
                Google Account
              </Button>
            </div>
          </section>
          <section className="border bg-gray-400 p-3 flex justify-between">
            <Button variant={"outline"} size="sm" className=" cursor-pointer">
              <img src={settingsIcon} alt="icon" width={20} height={20} />
              Settings
            </Button>
            <Button
              variant={"destructive"}
              size="sm"
              className=" cursor-pointer"
              onClick={handleSignOut}
            >
              <img src={signOutIcon} alt="icon" width={20} height={20} />
              Sign Out
            </Button>
          </section>
        </div>
      </div>
    </header>
  );
};

export default Header;
