import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import Content from "./Content";
import Header from "./Header";
import { getUserData, signOut } from "../../utils/auth.utils.ts";
import { useEffect, useState } from "react";
import { userAppWriteInfo } from "@/utils/utils.tsx";

const Main = () => {
  const [userInfo, setUserInfo] = useState<userAppWriteInfo | undefined>(
    undefined
  );
  const [userDataGoogle, setUserDataGoogle] = useState<object | undefined>(
    undefined
  );
  const [contentLoaded, setContentLoaded] = useState<boolean>(false);

  useEffect(() => {
    handleUserData();
  }, []);

  const handleUserData = async () => {
    try {
      const data = await getUserData();

      setUserInfo({
        userId: data.userId,
        accessToken: data.providerAccessToken,
        providerAccessTokenExpiry: data.providerAccessTokenExpiry,
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      if (new Date(userInfo.providerAccessTokenExpiry) < new Date()) {
        window.alert("Your session has ended");
        signOut();
      } else {
        handleProfileRequest();
      }
    }
  }, [userInfo]);

  const handleProfileRequest = async () => {
    try {
      const data = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo?.accessToken}`,
          },
        }
      );
      const response = await data.json();
      /* if (response.error) return signOut(); */
      setUserDataGoogle(() => {
        return { ...response, ...userInfo };
      });
    } catch (error) {
      console.error("Error getting user Data:", error);
    }
  };

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header userData={userDataGoogle} />

          <Content
            userData={userDataGoogle}
            setContentLoaded={setContentLoaded}
            contentLoaded={contentLoaded}
          />

          {contentLoaded ? null : (
            <div className="h-full p-2 flex justify-center items-center bg-gray-200">
              <div className="h-[70px] w-[70px] border-[6px] border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Main;
