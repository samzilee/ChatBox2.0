import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { getUserData, signOut } from "../../utils/auth.utils.ts";
import { useEffect, useRef, useState } from "react";
import { userAppWriteInfo } from "@/utils/utils.tsx";

import Content from "./Content";
import Header from "./Header";
import ChatRoom from "./ChatRoom.tsx";
import Alert from "../Alert.tsx";
import { createDocumentCustomID, updateUser } from "@/utils/db.ts";

const Main = ({ path }: any) => {
  const [userInfo, setUserInfo] = useState<userAppWriteInfo | undefined>(
    undefined
  );
  const [userDataGoogle, setUserDataGoogle] = useState<any>(null);
  const [contentLoaded, setContentLoaded] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [scrollDownButton, setScrollDownButton] = useState<boolean>(false);

  const scrollElement = useRef<HTMLDivElement | null>(null);

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
        setSessionExpired(true);
        setAlertMessage(
          "You're logged out of your account. Please login again."
        );
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
      setUserDataGoogle(() => {
        return { ...response, ...userInfo };
      });
    } catch (error) {
      console.error("Error getting user Data:", error);
    }
  };

  useEffect(() => {
    if (userDataGoogle) {
      handleSaveUser({
        userId: userDataGoogle.userId,
        email: userDataGoogle.email,
        name: userDataGoogle.name,
        picture: userDataGoogle.picture,
        email_verified: userDataGoogle.email_verified,
      });
    }
  }, [userDataGoogle]);

  const handleSaveUser = async (userData: any) => {
    try {
      console.log("saving user in database...");
      await createDocumentCustomID("Users", userData.userId, userData);
    } catch (error) {
      /*  console.clear(); */
      console.log("user exist in database");
      console.log("updating userData...");
      handleUpdateUser(userData);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      await updateUser(userData.userId, userData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckScroll = () => {
    const chatScroll = scrollElement.current;
    if (chatScroll) {
      setScrollDownButton(
        chatScroll.scrollTop + chatScroll.clientHeight <
          chatScroll.scrollHeight - 100
      );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div
          className="flex flex-col overflow-auto scroll-smooth "
          style={{ height: "calc(var(--vh, 1vh) * 100)" }}
          ref={scrollElement}
          onScroll={() => handleCheckScroll()}
        >
          <Header userData={userDataGoogle} />

          {path === "home" ? (
            <div className="h-full ">
              <Content
                userData={userDataGoogle}
                setContentLoaded={setContentLoaded}
                contentLoaded={contentLoaded}
              />
            </div>
          ) : null}

          {path === "chatroom" ? (
            <ChatRoom
              userData={userDataGoogle}
              scrollElement={scrollElement}
              scrollDownButton={scrollDownButton}
            />
          ) : null}
        </div>

        {sessionExpired ? (
          <Alert message={alertMessage} setActive={setSessionExpired} />
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Main;
