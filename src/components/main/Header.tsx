import webIcon from "../../Assets/images/websiteIcon2.png";
import { useSidebar } from "../ui/sidebar";
import { AiOutlineMenu } from "react-icons/ai";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import settingsIcon from "../../Assets/images/settings-icon.png";
import signOutIcon from "../../Assets/images/sign-out-icon.png";
import { signOut } from "../../utils/auth.utils.ts";
import { NavLink, useNavigate } from "react-router-dom";
import Settings from "./Settings.tsx";

const Header = ({ userData, setUserData }: any) => {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
  const [miniProfile, setMiniProfile] = useState<boolean>(false);
  const [settingsActive, setSettingsActive] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const accBlockRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loggingOut) {
      document.body.style.opacity = "0.5";
      document.body.style.pointerEvents = "none";
    }
  }, [loggingOut]);

  const handleMenu = () => {
    setMiniProfile((prev) => {
      if (prev) return false;
      return true;
    });
  };

  useEffect(() => {
    if (miniProfile) {
      document.addEventListener("scroll", () => setMiniProfile(false));
    }
    document.removeEventListener("scroll", () => setMiniProfile(false));
  }, [miniProfile]);

  const handleSignOut = async () => {
    if (userData) {
      try {
        setLoggingOut(true);
        const result = await signOut();
        if (result) {
          document.body.style.opacity = "1";
          document.body.style.pointerEvents = "auto";
          navigate("/logIn");
        }
      } catch (error) {
        setLoggingOut(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const block: any = accBlockRef.current;
    if (!miniProfile && block) return;

    const handleClickOutside = (event: any) => {
      if (!block.contains(event?.target)) {
        handleMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [miniProfile]);

  return (
    <header
      className="border-b border-border flex justify-between items-center p-2 px-3 h-[58px]  bg-background z-10
       absolute right-0 left-0 top-0
    "
    >
      {/* Right Side of the header */}
      <div className="flex items-center gap-2 ">
        <div className=" p-2 hover:bg-accent text-foreground cursor-pointer rounded">
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
            src={userData.picture}
            alt="avatar"
            className="w-[40px] h-[40px] rounded-full cursor-pointer bg-card"
            onClick={handleMenu}
          />
        ) : (
          <div className="flex gap-3">
            <NavLink to="/signUp">
              <Button
                size="sm"
                className="bg-[rgba(64,188,145,0.845)] hover:bg-[rgba(64,188,145,0.6)] cursor-pointer"
              >
                SignUp
              </Button>
            </NavLink>

            <NavLink to="/logIn">
              <Button
                size="sm"
                className="cursor-pointer bg-[rgba(72,182,232,0.845)] hover:bg-[rgba(72,182,232,0.6)]"
              >
                LogIn
              </Button>
            </NavLink>
          </div>
        )}

        {/* mini-profile block */}
        <div
          className={`absolute bg-card text-card-foreground right-0 top-[45px] rounded-lg overflow-hidden ${
            miniProfile ? "block" : "hidden"
          }`}
          ref={accBlockRef}
        >
          <section className="flex gap-2 p-3">
            <div className="w-[80px] h-[80px]">
              <img
                loading="lazy"
                src={userData?.picture}
                alt="Avatar"
                className=" rounded-full size-full bg-background"
              />
            </div>
            <div className="flex flex-col">
              <p>{userData?.name || userData?.given_name}</p>
              <p className="text-muted-foreground text-[15px]">
                {userData?.email}
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
          <section className="bg-popover p-3 flex justify-between ">
            <Button
              variant={"secondary"}
              size="sm"
              className="cursor-pointer border-none group"
              onClick={() => {
                setMiniProfile(false);
                setSettingsActive(true);
                setOpen(false);
              }}
            >
              <img src={settingsIcon} alt="icon" width={20} height={20} />
              Settings
            </Button>
            <Button
              variant={"destructive"}
              size="sm"
              className=" cursor-pointer"
              onClick={() => handleSignOut()}
            >
              <img src={signOutIcon} alt="icon" width={20} height={20} />
              Sign Out
            </Button>
          </section>
        </div>

        {/* Setting Block */}
        <Settings
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          userData={userData}
          setUserData={setUserData}
        />
      </div>
    </header>
  );
};

export default Header;
