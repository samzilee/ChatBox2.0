import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { getUserData, signOut } from "../../utils/auth.utils.ts";
import { useEffect, useState } from "react";
import { userAppWriteInfo } from "@/utils/utils.tsx";

import Content from "./Content";
import Header from "./Header";
import ChatRoom from "./ChatRoom.tsx";
import Alert from "../Alert.tsx";
import { createDocumentCustomID, getUser, updateDocument } from "@/utils/db";

const Main = ({ path }: any) => {
  const [userInfo, setUserInfo] = useState<userAppWriteInfo | undefined>(
    undefined
  );
  const [userDataGoogle, setUserDataGoogle] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [sendAlert, setSendAlert] = useState<boolean>(false);

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
        given_name: userDataGoogle.given_name,
        name: userDataGoogle.name,
        picture: userDataGoogle.picture,
        email_verified: userDataGoogle.email_verified,
        customData: false,
      });
    }
  }, [userDataGoogle]);

  const handleSaveUser = async (userData: any) => {
    try {
      console.log("saving user in database...");
      await createDocumentCustomID("Users", userData.userId, userData);
      Get_User_Data_From_db(userData);
    } catch (error) {
      console.log(error);
      console.log("user exist in database");
      console.log("updating userData...");
      Get_User_Data_From_db(userData);
    }
  };

  const Get_User_Data_From_db = async (userData: any) => {
    try {
      const response = await getUser(userData.userId);
      if (!response.customData) {
        handleUpdateUser(userData);
      } else {
        setUserData({
          userId: response.userId,
          email: response.email,
          given_name: response.given_name,
          name: response.name,
          picture: response.picture,
          email_verified: response.email_verified,
          customData: response.customData,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const response = await updateDocument("Users", userData.userId, userData);
      setUserData({
        userId: response.userId,
        email: response.email,
        given_name: response.given_name,
        name: response.name,
        picture: response.picture,
        email_verified: response.email_verified,
        customData: response.customData,
      });
      console.log("user Updated");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header userData={userData} />

        {path === "home" ? (
          <div className="h-full">
            <Content
              userData={userData}
              setSendAlert={setSendAlert}
              setAlertMessage={setAlertMessage}
              sendAlert={sendAlert}
              alertMessage={alertMessage}
            />
          </div>
        ) : null}

        {path === "chatroom" ? (
          <ChatRoom userData={userData} setUserData={setUserData} />
        ) : null}

        {sessionExpired ? (
          <Alert message={alertMessage} setActive={setSessionExpired} />
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Main;
