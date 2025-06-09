import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { getUserData, signOut } from "../../utils/auth.utils.ts";
import { useEffect, useState } from "react";
import { userAppWriteInfo } from "@/utils/utils.tsx";

import Content from "./Content";
import Header from "./Header";
import ChatRoom from "./ChatRoom.tsx";
import Alert from "../Alert.tsx";
import { createDocumentCustomID, getUser, listDocument } from "@/utils/db";
import { client } from "@/utils/appWrite.ts";

const Main = ({ path }: any) => {
  const [userInfo, setUserInfo] = useState<userAppWriteInfo | undefined>(
    undefined
  );
  const [userData, setUserData] = useState<any>(null);
  const [allusers, setAllusers] = useState<any>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [sendAlert, setSendAlert] = useState<boolean>(false);
  const [userDataFromGoogle, setUserDataFromGoogle] = useState<any>(null);
  const [num, setNum] = useState<number>(0);
  const [forbidden1, setForbidden1] = useState<string>("");
  const [forbidden2, setForbidden2] = useState<string>("");

  useEffect(() => {
    if (allusers) {
      console.log(allusers);
    }
  }, [allusers]);

  useEffect(() => {
    handleUserData();
    handleGetAllUsers();

    const unsubscribe = client.subscribe(
      `databases.chat_box.collections.users.documents`,
      (response: any) =>
        setUserData(() => {
          return response.payload;
        })
    );

    return () => unsubscribe();
  }, []);

  const handleUserData = async () => {
    try {
      const data = await getUserData();
      setUserInfo({
        userId: data.userId,
        accessToken: data.providerAccessToken,
        providerAccessTokenExpiry: data.providerAccessTokenExpiry,
      });
      handleProfileRequest(data.providerAccessToken);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleGetAllUsers = async () => {
    try {
      const response = await listDocument("users", "new-to-old");
      setAllusers(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      Get_User_Data_From_db(userInfo);
    }
  }, [userInfo]);

  /* 
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
  }, [userInfo]); */

  const handleProfileRequest = async (accessToken: string) => {
    try {
      const data = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const response = await data.json();
      setUserDataFromGoogle(response);
    } catch (error) {
      console.log("Error getting user Data from Google:", error);
    }
  };

  useEffect(() => {
    if (userDataFromGoogle) {
      handleSaveUserToDB({
        userId: userInfo?.userId,
        email: userDataFromGoogle.email,
        given_name: userDataFromGoogle.given_name,
        name: userDataFromGoogle.name,
        picture: userDataFromGoogle.picture,
        email_verified: userDataFromGoogle.email_verified,
        settings: {
          $id: userInfo?.userId,
          mute_message_sound: false,
          mute_mention: false,
          mute_all_sounds: false,
        },
      });
    }
  }, [userDataFromGoogle]);

  const handleSaveUserToDB = async (userData: any) => {
    if (num === 1) return;
    setNum(1);
    try {
      console.log("saving user in database...");
      await createDocumentCustomID("users", userData.userId, userData);
      console.log("user saved...");
      Get_User_Data_From_db(userData);
    } catch (error) {
      console.log("error saving user");
      console.log(error);
      setForbidden1("saving");
    }
  };

  const Get_User_Data_From_db = async (userData: any) => {
    try {
      const response = await getUser(userData.userId);
      setUserData(response);
    } catch (error) {
      console.log("error getting user data");
      setForbidden2("other");
    }
  };

  if (
    userInfo &&
    forbidden1 === "saving" &&
    forbidden2 === "other" &&
    new Date(userInfo.providerAccessTokenExpiry) < new Date()
  ) {
    signOut();
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header userData={userData} setUserData={setUserData} />

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
