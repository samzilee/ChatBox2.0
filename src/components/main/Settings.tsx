import { useSidebar } from "../ui/sidebar";
import {
  Bell,
  BellRingIcon,
  Moon,
  PencilLineIcon,
  Sun,
  User2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AiOutlineClose } from "react-icons/ai";
import { createFile, deleteFile, getFile, updateDocument } from "@/utils/db";
import Alert from "../Alert";

const Settings = ({
  settingsActive,
  setSettingsActive,
  userData,
  setUserData,
}: any) => {
  const { setOpen } = useSidebar();
  const { setTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(() => {
    const theme = localStorage.getItem("vite-ui-theme");
    if (theme === "dark") {
      return true;
    } else if (theme === "light") {
      return false;
    }
    return false;
  });
  /*  const [name, setName] = useState<string>(userData?.name);
  const [userName, setUserName] = useState<string>(userData?.given_name); */
  const [muteMessage, setMuteMessage] = useState<boolean>(false);
  const [muteMention, setMuteMetion] = useState<boolean>(false);
  const [muteAll, setMuteAll] = useState<boolean>(false);
  const [popoverActive, setPopoverActive] = useState<boolean>(false);
  const [updatingSounds, setUpdatingSounds] = useState<boolean>(false);
  const [sendAlert, setSendAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [localProfileUrl, setLocalProfileUrl] = useState<any>(null);
  const [profilePicFile, setProfilePicFile] = useState<any>(null);
  const [loading_PF, setLoading_PF] = useState<boolean>(false);
  const [PFerror, setPFerror] = useState<string>();

  const profilePicRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const popOverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userData && popoverActive) {
      setMuteMessage(userData?.settings?.mute_message_sound);
      setMuteMetion(userData?.settings?.mute_mention);
      setMuteAll(userData?.settings?.mute_all_sounds);
    }
  }, [userData, popoverActive]);

  useEffect(() => {
    const handlePopover = (event: any) => {
      if (!popOverRef.current?.contains(event?.target)) {
        setPopoverActive(false);
      }
    };

    if (popoverActive) {
      document.addEventListener("mousedown", handlePopover);
      return () => document.removeEventListener("mousedown", handlePopover);
    }
  }, [popoverActive, popOverRef]);

  useEffect(() => {
    if (darkMode) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [darkMode]);

  const handleChangeProfilePicLocaly = (event: any) => {
    const file = event.target.files[0];

    //if file size is over 1Mb return an error
    if (file.size / (1024 * 1024) > 2) {
      return setPFerror(
        `The file you selected is too large(${(
          file.size /
          (1024 * 1024)
        ).toFixed(
          2
        )} MB). Maximum allowed size is 1MB. Please choose a smaller file.`
      );
    }

    /* list of supported file type */
    const supportedExtensions = ["gif", "png", "svg", "jpg", "jpeg"];
    /* return "true" or "false" */
    const fileSupported = supportedExtensions.some((extension) =>
      file.type.includes(extension)
    );
    /* checking if "fileSupported" is false */
    if (!fileSupported) {
      setPFerror(
        "file is not supported, please provide a file that includes 'GIf, PNG, SVG, JPG, JPEG'"
      );
      return setLocalProfileUrl(null), setProfilePicFile(null);
    } else {
      setLocalProfileUrl(URL.createObjectURL(file));
      setProfilePicFile(file);
    }
  };

  const handleGetfile = async (fileId: string) => {
    try {
      console.log("getting new Profile_Pic_View");
      const result = getFile(fileId);
      return result;
    } catch (error) {
      console.log(error);
      setPFerror(
        "couldn't get file from database... please reload the page and try again"
      );
    }
  };

  const handleManageChanges = async () => {
    if (loading_PF) return setPFerror("");
    if (userNameRef?.current?.value.includes(" ")) {
      return setPFerror("User name must not include space.");
    }
    try {
      setLoading_PF(true);
      setPFerror("");
      if (profilePicFile) {
        //checking is profile was changed befor
        if (userData.customProfilePic) {
          //deleting previous file created
          console.log("deleting previous file created...");
          await deleteFile(userData.settings.profile_fileId);
        }
        console.log("creating File...");
        const result = await createFile(profilePicFile);
        const response = await handleGetfile(result.$id);
        handleUpdateProfile1(response, result.$id);
      } else if (
        nameRef?.current?.value !== "" &&
        userNameRef?.current?.value !== ""
      ) {
        console.log("updating profile...");
        handleUpdateProfile2();
      } else {
        setLoading_PF(false);
      }
    } catch (error) {
      console.log(error);
      setLoading_PF(false);
      setPFerror("error making changes to profile...");
    }
  };

  const handleUpdateProfile1 = async (
    newProfile: any,
    newProfileId: string | undefined
  ) => {
    const name = nameRef?.current?.value;
    const userName = userNameRef?.current?.value;
    try {
      const result = await updateDocument("users", userData.$id, {
        picture: newProfile.href,
        customProfilePic: true,
        given_name: userName?.split("@")[1],
        name: name,
        settings: { profile_fileId: newProfileId },
      });
      setUserData(result);
      setLoading_PF(false);
    } catch (error) {
      console.log(error);
      setLoading_PF(false);
    }
  };

  const handleUpdateProfile2 = async () => {
    const name = nameRef?.current?.value;
    const userName = userNameRef?.current?.value;
    try {
      const result = await updateDocument("users", userData.$id, {
        given_name: userName?.split("@")[1],
        name: name,
      });
      setUserData(result);
      setLoading_PF(false);
    } catch (error) {
      console.log(error);
      setLoading_PF(false);
    }
  };

  const updateNotificationSettings = async () => {
    if (
      updatingSounds ||
      (muteMessage === userData?.settings?.mute_message_sound &&
        muteMention === userData?.settings?.mute_mention &&
        muteAll === userData?.settings?.mute_all_sounds)
    )
      return null;
    try {
      setUpdatingSounds(true);
      await updateDocument("settings", userData?.settings?.$id, {
        mute_all_sounds: muteAll,
        mute_mention: muteMention,
        mute_message_sound: muteMessage,
      });
      setUpdatingSounds(false);
      setPopoverActive(false);
      setUserData((prev: any) => {
        prev.settings.mute_message_sound = muteMessage;
        prev.settings.mute_mention = muteMention;
        prev.settings.mute_all_sounds = muteAll;
        return prev;
      });
    } catch (error) {
      console.log(error);
      setPopoverActive(false);
      setUpdatingSounds(false);
      setSendAlert(true);
      setAlertMessage("Failed to make changes...");
    }
  };

  return (
    <div
      className={` ${
        settingsActive ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50`}
    >
      {sendAlert ? (
        <Alert message={alertMessage} setActive={setSendAlert} />
      ) : null}
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-500/60 flex justify-center items-center`}
        onClick={() => {
          setSettingsActive(false);
          setOpen(true);
          const body = document.body;
          body.style.overflow = "auto";
        }}
      ></div>

      <div className="fixed bg-card text-card-foreground w-[95%] h-[90%] md:w-[500px] md:h-[96%] rounded-lg overflow-hidden flex flex-col gap-5 px-5 py-5">
        <header className="flex gap-2 items-center border-b border-border py-5 relative">
          <div className="h-[70px] w-[70px] rounded-full overflow-hidden">
            <img src={userData?.picture} className="size-full" />
          </div>
          <div>
            <p className="text-[16px]">{userData?.name}</p>
            <p className="text-[13px] text-muted-foreground">
              {userData?.email}
            </p>
          </div>

          <Button
            variant="destructive"
            className="rounded-full absolute right-0 top-[-10px] cursor-pointer h-[40px] w-[40px]"
            onClick={() => {
              setSettingsActive(false);
              setOpen(true);
              const body = document.body;
              body.style.overflow = "auto";
            }}
          >
            <AiOutlineClose />
          </Button>
        </header>

        <main className="flex-1 text-foreground flex flex-col gap-5 overflow-auto">
          {/**/}
          <Sheet>
            <SheetTrigger asChild>
              <div className="flex gap-3 rounded-lg p-2 items-center cursor-pointer">
                <div className="w-[50px] h-[50px] rounded-full bg-gray-300/30 flex items-center justify-center">
                  <User2Icon className="size-[30px]" />
                </div>
                <div className="flex-1">
                  <p>Profile</p>
                  <p className="text-muted-foreground text-[13px]">
                    Change username
                  </p>
                </div>
                <div className="w-[20px] font-bold">
                  <svg
                    className="size-full"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <div className="flex items-center gap-2 py-5 border-b border-border">
                  <Label
                    htmlFor="ChangeProfile"
                    className="h-[70px] w-[70px] relative cursor-pointer"
                  >
                    <Input
                      id="ChangeProfile"
                      ref={profilePicRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleChangeProfilePicLocaly(e)}
                    />
                    <img
                      src={
                        localProfileUrl ? localProfileUrl : userData?.picture
                      }
                      className="size-full z-[-1] rounded-full"
                    />
                    <div className="absolute right-0 bottom-0 bg-accent rounded-full w-6 h-6 p-1">
                      <PencilLineIcon className="size-full" />
                    </div>
                  </Label>
                  <div>
                    <p className="text-[16px]">{userData?.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {userData?.email}
                    </p>
                  </div>
                </div>
                <div className="w-full text-red-500 font-[arial] text-[13px]">
                  <p>{PFerror}</p>
                </div>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    ref={nameRef}
                    id="name"
                    defaultValue={userData?.name}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    ref={userNameRef}
                    id="username"
                    defaultValue={`@${userData?.given_name}`}
                  />
                </div>
              </div>

              <SheetFooter className="pb-7">
                <Button
                  type="submit"
                  onClick={() => handleManageChanges()}
                  className="cursor-pointer"
                >
                  {loading_PF ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/**/}
          <div className="flex gap-2 rounded-lg p-2 items-center cursor-pointer">
            <div className="w-[50px] h-[50px] rounded-full bg-gray-300/30 flex items-center justify-center">
              {darkMode ? (
                <Moon className="text-[30px]" />
              ) : (
                <Sun className="text-[30px]" />
              )}
            </div>
            <div className="flex-1">
              <p>Appearance</p>
              <p className="text-muted-foreground text-[13px]">Dark mode</p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors  ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform cursor-pointer ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <Popover open={popoverActive}>
            <Label>Chat Room</Label>
            <PopoverTrigger>
              <div
                className="flex-1 flex  p-2 items-center cursor-pointer justify-between  hover:bg-background/50 rounded-lg"
                onClick={() =>
                  setPopoverActive((prev: boolean) => {
                    if (prev) return false;
                    return true;
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="w-[50px] h-[50px] rounded-full bg-gray-300/30 flex items-center justify-center">
                    <Bell />
                  </div>
                  <p className="flex-1">Notification</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent ref={popOverRef}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold ">Sounds</h4>
                  <BellRingIcon className="w-[20px] h-[20px]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div
                    className={`flex items-center justify-between ${
                      muteAll
                        ? "opacity-[0.5] pointer-events-none"
                        : "opacity-[1] pointer-events-auto"
                    }`}
                  >
                    <label>
                      <span className="text-[13px]">Mute message sound</span>
                      <p className="text-[11px] text-muted-foreground">
                        Stops sound when a new message arrives
                      </p>
                    </label>
                    <Input
                      type="checkbox"
                      className="size-[20px] cursor-pointer"
                      checked={muteMessage}
                      onChange={() =>
                        setMuteMessage((prev) => {
                          if (prev) return false;
                          return true;
                        })
                      }
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between ${
                      muteAll
                        ? "opacity-[0.5] pointer-events-none"
                        : "opacity-[1] pointer-events-auto"
                    }`}
                  >
                    <label>
                      <span className="text-[13px]">
                        Mute mention/reply sound
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        No sound when someone @mentions/replies you
                      </p>
                    </label>
                    <Input
                      type="checkbox"
                      className="size-[20px] cursor-pointer"
                      checked={muteMention}
                      onChange={() =>
                        setMuteMetion((prev) => {
                          if (prev) return false;
                          return true;
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label>
                      <span className="text-[13px]">Mute all chat sounds</span>
                      <p className="text-[11px] text-muted-foreground">
                        Disables all chat notification sounds
                      </p>
                    </label>
                    <Input
                      type="checkbox"
                      className="size-[20px] cursor-pointer"
                      checked={muteAll}
                      onChange={() => {
                        setMuteAll((prev) => {
                          if (prev) return false;
                          return true;
                        });
                        setMuteMessage(false);
                        setMuteMetion(false);
                      }}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  type="submit"
                  onClick={() => updateNotificationSettings()}
                  className="cursor-pointer"
                >
                  {updatingSounds ? (
                    <div
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin
                "
                    ></div>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </main>
      </div>
    </div>
  );
};

export default Settings;
