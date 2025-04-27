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

  useEffect(() => {
    handleUserData();
  }, []);

  const handleUserData = async () => {
    try {
      const data = await getUserData();
      setUserInfo({
        userId: data.userId,
        accessToken: data.providerAccessToken,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleProfileRequest();
  }, [userInfo]);

  const handleProfileRequest = async () => {
    if (!userInfo) return;
    try {
      const data = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo.accessToken}`,
          },
        }
      );
      const response = await data.json();
      if (response.error) return signOut();
      setUserDataGoogle(() => {
        return { ...response, ...userInfo };
      });
    } catch (error) {
      console.error("Error getting user Data:", error);
    }
  };

  /*   console.log(userData); */

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header userData={userDataGoogle} />
          <Content userData={userDataGoogle} />

          {/*  <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div> */}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Main;
