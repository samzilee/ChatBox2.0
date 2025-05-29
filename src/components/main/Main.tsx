import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { getUserData, signOut } from "../../utils/auth.utils.ts";
import { useEffect, useState } from "react";
import { userAppWriteInfo } from "@/utils/utils.tsx";

import Content from "./Content";
import Header from "./Header";
import ChatRoom from "./ChatRoom.tsx";
import Alert from "../Alert.tsx";
import {
  createDocumentCustomID,
  updateDocument,
  listDocument,
} from "@/utils/db";
import { client } from "@/utils/appWrite";
const Main = ({ path }: any) => {
  const [userInfo, setUserInfo] = useState<userAppWriteInfo | undefined>(
    undefined
  );
  const [userDataGoogle, setUserDataGoogle] = useState<any>(null);
  const [contentLoaded, setContentLoaded] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [sendAlert, setSendAlert] = useState<boolean>(false);
  const [posts, setPosts] = useState<any>([]);

  useEffect(() => {
    handleUserData();
  }, []);

  {
    /* posts realTime upDate */
  }
  useEffect(() => {
    setContentLoaded(false);
    handleListPosts();
    const unsubscribe = client.subscribe(
      `databases.chat_box.collections.posts.documents`,
      (response: any) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          setPosts((prev: any) =>
            prev.filter((post: any) => post.$id !== response.payload.$id)
          );
        } else if (
          response.events.some(
            (e: string) => e.includes("create") || e.includes("update")
          )
        ) {
          setPosts((prev: any) => {
            const exists = prev.find(
              (post: any) => post.$id === response.payload.$id
            );
            if (exists) {
              return prev.map((post: any) =>
                post.$id === response.payload.$id ? response.payload : post
              );
            } else {
              return [response.payload, ...prev];
            }
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);

  {
    /* listPosts */
  }
  const handleListPosts = async () => {
    try {
      const result = await listDocument("posts", "new-to-old");
      setPosts(result.documents);
      setContentLoaded(true);
    } catch (error) {
      console.log(error);
      setContentLoaded(true);
      setSendAlert(true);
      setAlertMessage(
        "Error Loading Posts, Check your internet connection and try again"
      );
    }
  };

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
      await updateDocument("Users", userData.userId, userData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header userData={userDataGoogle} />

        {path === "home" ? (
          <div className="h-full">
            <Content
              userData={userDataGoogle}
              contentLoaded={contentLoaded}
              setSendAlert={setSendAlert}
              setAlertMessage={setAlertMessage}
              sendAlert={sendAlert}
              alertMessage={alertMessage}
              posts={posts}
            />
          </div>
        ) : null}

        {path === "chatroom" ? <ChatRoom userData={userDataGoogle} /> : null}

        {sessionExpired ? (
          <Alert message={alertMessage} setActive={setSessionExpired} />
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Main;
