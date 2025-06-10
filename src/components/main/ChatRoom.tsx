import { ArrowDown, Pen, SendHorizonalIcon, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "../FormatDate";
import {
  createDocument,
  listDocument,
  deleteDocument,
  updateDocument,
} from "@/utils/db";
import { client } from "@/utils/appWrite";
import Alert from "../Alert";
import { MdCancel, MdReply } from "react-icons/md";
import { Button } from "../ui/button";

import sentSound from "@/Assets/sounds/chat-sent.mp3";
import receiveSound from "@/Assets/sounds/message-notification-190034.mp3";
import mentionSound from "@/Assets/sounds/mention-reply.mp3";
// "setUserData" is for the appwrite real-time subscribtion. when the sub runs and userData is "null", userData will stay "null". ima using setUserData to get the "prev" data
const ChatRoom = ({ userData, setUserData }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollElement = useRef<HTMLElement | null>(null);

  const [loadingChat, setLoadingChat] = useState<Boolean>(false);
  const [chats, setChats] = useState<any>([]);
  const [reply, setReply] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [deletingMessage, setDeletingMessage] = useState<boolean>(false);
  const [sendAlert, setSendAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [scrollDownButton, setScrollDownButton] = useState<boolean>(false);
  const [editMessageMode, setEditMessageMobe] = useState<boolean>(false);
  const [tagging, setTagging] = useState<any>([]);
  const [themeColor, setThemeColor] = useState<string>("");

  const sendAudioRef = useRef<HTMLAudioElement>(null);
  const recevieAudioRef = useRef<HTMLAudioElement>(null);
  const mentionAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    sendAudioRef.current = new Audio(sentSound);
    recevieAudioRef.current = new Audio(receiveSound);
    mentionAudioRef.current = new Audio(mentionSound);

    sendAudioRef.current.load();
    recevieAudioRef.current.load();
    mentionAudioRef.current.load();
  }, []);

  const handleMessageSent = () => {
    //mesage sent logic
    const audio = sendAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const handleRecevieMessage = () => {
    //Recevie Message sent logic
    const audio = recevieAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const handleMention = () => {
    //mention sent logic
    const audio = mentionAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  useEffect(() => {
    handleListChat();
    const unsubscribe = client.subscribe(
      `databases.chat_box.collections.mainroom.documents`,
      (response: any) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          setChats((prev: any) =>
            prev.filter((chat: any) => chat.$id !== response.payload.$id)
          );
        } else if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          setChats((prev: any) => {
            return prev.map((chat: any) => {
              if (chat.$id === response.payload.$id) {
                return response.payload;
              }
              return chat;
            });
          });
        } else {
          setChats((prev: any) => {
            return [...prev, response.payload];
          });

          // using "setUserData" to get "prev.userId" cuz of appwrite subscribtion constant data - "ASCD"
          setUserData((prev: any) => {
            // check if the current user didn't send the message, else if current user sent the message! message sent audio will be played.
            if (prev.userId !== response.payload.senderId) {
              //will return "[]" if current user is not tagged or mentioned.
              const tagged = response.payload?.tagged?.filter(
                (tag: any) => tag.userId === prev.userId
              );
              //if current user is not tagged, message received audio will be played else it plays mention/tagged audio.
              if (
                prev.userId === response.payload?.replies?.userId ||
                tagged.length > 0
              ) {
                if (
                  prev?.settings.mute_mention !== true &&
                  prev?.settings.mute_all_sounds !== true
                ) {
                  handleMention();
                }
              } else {
                if (
                  prev?.settings.mute_message_sound !== true &&
                  prev?.settings.mute_all_sounds !== true
                ) {
                  handleRecevieMessage();
                }
              }
            } else {
              handleMessageSent();
            }
            return prev;
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const chatScroll = scrollElement.current;
    if (
      chats.length > 0 &&
      chatScroll &&
      chatScroll.scrollTop + chatScroll.clientHeight >
        chatScroll.scrollHeight - 1000
    ) {
      chatScroll.scrollTo({
        top: chatScroll.scrollHeight,
      });
    }
  }, [sending, scrollElement]);

  useEffect(() => {
    if (userData) {
      setThemeColor(stringToColor(userData.userId));
    }
  }, [userData]);

  useEffect(() => {
    setTagging((prevTags: any) =>
      prevTags.filter((tag: any) => message.includes(`@${tag.userName}`))
    );
  }, [message]);

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 60%, 70%)`; // HSL makes it easier to control readability
    return color;
  };

  const handleListChat = async () => {
    try {
      setLoadingChat(true);
      const response = await listDocument("mainroom", "old-to-new");
      setLoadingChat(false);
      setChats(response.documents);
      return handleScrollDown("instant");
    } catch (error) {
      console.log(error);
      setLoadingChat(false);
      setSendAlert(true);
      setAlertMessage(
        "Error Loading Chats, Check your internet connection and try again"
      );
    }
  };

  const handleSendMessage = async () => {
    if (message === "") return;
    try {
      if (chats.length === 100 && !reply?.oldTextToUpDate) {
        await deleteDocument("mainroom", chats[0].$id);
      }
      if (userData) {
        setSending(true);
        /*   */
        if (editMessageMode || tagging.length > 0 || reply) {
          if (editMessageMode) {
            await updateDocument("mainroom", reply.documentId, {
              text: message,
              edited: true,
            });
            setEditMessageMobe(false);
          } else if (tagging.length > 0) {
            if (reply) {
              await createDocument("mainroom", {
                text: message,
                senderId: userData.userId,
                senderName: userData.given_name,
                senderAvatar: userData.picture,
                themeColor: themeColor,
                replies: reply,
                tagged: tagging,
              });
            } else {
              await createDocument("mainroom", {
                text: message,
                senderId: userData.userId,
                senderName: userData.given_name,
                senderAvatar: userData.picture,
                themeColor: themeColor,
                tagged: tagging,
              });
            }
            handleClearTags();
          } else {
            await createDocument("mainroom", {
              text: message,
              senderId: userData.userId,
              senderName: userData.given_name || userData.name,
              senderAvatar: userData.picture,
              themeColor: themeColor,
              replies: reply,
            });
          }
        } else {
          await createDocument("mainroom", {
            text: message,
            senderId: userData.userId,
            senderName: userData.given_name || userData.name,
            senderAvatar: userData.picture,
            themeColor: themeColor,
          });
        }
        setSending(false);
        setMessage("");
        setTagging([]);
        setReply(null);
        handleScrollDown("smooth");
      } else {
        setSendAlert(true);
        setAlertMessage(
          "Ready to chat? 💬 Just log in first so we know who’s talking!"
        );
      }
    } catch (error) {
      console.log(error);
      setSending(false);
      setSendAlert(true);
      setAlertMessage(
        "Hmm... couldn't send that message. Want to give it another try?"
      );
    }
  };

  const handleDeleteMessage = async (documentID: string) => {
    try {
      setDeletingMessage(true);
      await deleteDocument("mainroom", documentID);
      setDeletingMessage(false);
    } catch (error) {
      console.log(error);
      setDeletingMessage(false);
      setSendAlert(true);
      setAlertMessage(
        "Hmm... couldn't delete that message. Want to give it another try?"
      );
    }
  };

  const handleReply = (chat: any) => {
    setReply({
      text: chat.text,
      name: chat.senderName,
      parentId: chat.$id,
      userId: chat.senderId,
      themeColor: chat.themeColor,
    });
  };
  const handleUpdateMessage = (documentID: string, textToUpdate: string) => {
    setReply({
      oldTextToUpDate: textToUpdate,
      documentId: documentID,
    });
    setEditMessageMobe(true);
    const textarea: HTMLTextAreaElement | null = textareaRef.current;
    if (textarea) {
      setMessage(textToUpdate);
      textarea.value = textToUpdate;
      textarea.focus();
      handleInput();
    }
  };

  const handleTag = (userId: string, userName: string) => {
    /* returns null if user is already tagged  */
    const existingTag = tagging.filter((tag: any) => tag.userId === userId);
    if (existingTag.length > 0) {
      return null;
    }
    const textarea: HTMLTextAreaElement | null = textareaRef.current;
    if (textarea) {
      setMessage((prev: string) => {
        return prev + " " + "@" + userName + " ";
      });
      textarea.value = message;
      textarea.focus();
      setTagging((prev: any) => {
        return [{ userId: userId, userName: userName }, ...prev];
      });
      handleInput();
    }
  };

  const handleClearTags = () => {
    tagging.map((tag: any) => {
      setMessage((prev: string) => {
        return prev?.split(tag.userId)[1] || "";
      });
    });
    setTagging([]);
  };

  const handleScrollToView = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView();
      element.style.backgroundColor = "rgba(170,170,170,0.241)";
      const clearStyle = setTimeout(() => {
        element.style.backgroundColor = "transparent";
        clearTimeout(clearStyle);
      }, 5000);
    }
  };

  const handleScrollDown = (behavior: any) => {
    const chatSroll = scrollElement.current;
    if (chatSroll) {
      chatSroll.scrollTo({
        top: chatSroll.scrollHeight,
        behavior: behavior,
      });
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

  const handleInput = () => {
    const textarea: any = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  const renderTaggedText = (text: string, tagged: any[]) => {
    const usernames = tagged.map((tag) => "@" + tag.userName);
    const parts = text.split(/(\s+)/); // Keep spaces while splitting

    return parts.map((part, index) => {
      const matchingTag = usernames.find((name) => part === name);
      if (matchingTag) {
        return (
          <span key={index} className="underline text-blue-300">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (loadingChat && chats.length === 0) {
    return (
      <div className="h-full p-2 flex justify-center items-center bg-background  pt-[58px]">
        <div className="h-[70px] w-[70px] border-[6px] border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="h-full max-h-dvh bg-background text-card-foreground flex flex-col scroll-smooth overflow-y-auto pt-[58px]">
      {chats.length === 0 ? (
        <div className="flex-1 text-center text-foreground">
          <p className="py-5">No Messages Yet.</p>
        </div>
      ) : (
        <section
          className="flex-1 overflow-y-auto scroll-smooth "
          ref={scrollElement}
          onScroll={() => handleCheckScroll()}
        >
          <ul className="h-fit p-5 py-10 flex flex-col gap-2">
            {chats.map((chat: any) => {
              return chat.senderId === userData?.userId ? (
                /* Sender Block */
                <li
                  className="flex justify-end rounded-md"
                  key={chat.$id}
                  id={chat.$id}
                >
                  <div className="bg-green-800 text-white w-fit rounded-md max-w-[80%] md:max-w-[500px] px-2 py-1 flex flex-col group">
                    <div className="h-0 opacity-0 group-hover:h-10 group-hover:opacity-[1] transition-all duration-[0.5s] flex items-center justify-between gap-5 overflow-x-auto overflow-y-hidden px-2 mb-2">
                      <div className="flex gap-2 text-foreground">
                        <Button
                          variant="outline"
                          size="icon"
                          className="cursor-pointer group"
                          onClick={() =>
                            handleUpdateMessage(chat.$id, chat.text)
                          }
                        >
                          <Pen fill="white" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => handleReply(chat)}
                        >
                          <MdReply />
                        </Button>
                      </div>

                      {deletingMessage ? (
                        <Button variant="destructive" size="icon">
                          <div className="w-5 h-5 border-3 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => handleDeleteMessage(chat.$id)}
                        >
                          <Trash fill="white" />
                        </Button>
                      )}
                    </div>

                    {/* replies if any */}
                    {chat.replies ? (
                      <div
                        className="bg-green-900/80 rounded cursor-pointer flex gap-1"
                        onClick={() =>
                          handleScrollToView(chat.replies.parentId)
                        }
                      >
                        <div
                          className="w-1 h-full rounded-r-md"
                          style={{ backgroundColor: chat.replies.themeColor }}
                        ></div>
                        <div className="flex-1 flex flex-col pr-2 py-1">
                          <p
                            className="text-[13px] select-none"
                            style={{ color: chat.replies.themeColor }}
                          >
                            {chat.replies.name === userData.name
                              ? "You"
                              : chat.replies.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground select-none">
                            {chat.replies.text.length > 150
                              ? chat.replies.text.slice(0, 150) + "..."
                              : chat.replies.text}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-col">
                      {/* text */}
                      <p className="text-[14px] whitespace-pre-wrap select-none">
                        {chat.tagged.length > 0
                          ? renderTaggedText(chat.text, chat.tagged)
                          : chat.text}
                      </p>

                      <div className="flex gap-3 justify-between">
                        {/* date */}
                        <p className="text-[12px] text-gray-200/65 font-semibold text-end select-none">
                          {formatDate(new Date(chat.$createdAt))}
                        </p>
                        <p
                          className={`text-[12px] text-gray-200/65 font-semibold text-end ${
                            chat.edited ? "block" : "hidden"
                          }`}
                        >
                          Edited
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ) : (
                /* Other Block */
                <li
                  className="flex justify-start rounded-md"
                  key={chat.$id}
                  id={chat.$id}
                >
                  <div className="flex flex-col gap-1 bg-card w-fit p-2 rounded-md max-w-[80%] md:max-w-[500px]">
                    <div className="flex gap-2">
                      {/* profile */}
                      <img
                        loading="lazy"
                        src={chat.senderAvatar}
                        alt="avater"
                        className="w-[40px] h-[40px] rounded-full "
                      />

                      {/* Name and Date */}
                      <div>
                        <button
                          onClick={() =>
                            handleTag(chat.senderId, chat.senderName)
                          }
                          className="cursor-pointer"
                          style={{ color: chat.themeColor }}
                        >
                          {chat.senderName}
                        </button>
                        <p className="text-[12px] text-muted-foreground font-semibold">
                          {formatDate(new Date(chat.$createdAt))}
                        </p>{" "}
                      </div>
                    </div>

                    {/* replies if any */}
                    {chat.replies ? (
                      <div
                        className="bg-background rounded cursor-pointer flex gap-1"
                        onClick={() =>
                          handleScrollToView(chat.replies.parentId)
                        }
                      >
                        <div>
                          <div
                            className="w-1 h-full rounded-r-md border"
                            style={{ backgroundColor: chat.replies.themeColor }}
                          ></div>
                        </div>

                        <div className="flex-1 flex flex-col pr-2 py-1">
                          <p
                            className="text-[13px]"
                            style={{ color: chat.replies.themeColor }}
                          >
                            {chat.replies.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground">
                            {chat.replies.text.length > 150
                              ? chat.replies.text.slice(0, 150) + "..."
                              : chat.replies.text}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <p className="text-[14px] whitespace-pre-wrap">
                        {chat.tagged.length > 0
                          ? renderTaggedText(chat.text, chat.tagged)
                          : chat.text}
                      </p>
                    </div>
                    <p
                      className={`text-[12px] text-muted-foreground font-semibold ${
                        chat.edited ? "block" : "hidden"
                      }`}
                    >
                      Edited
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="cursor-pointer border-none text-muted-foreground hover:text-foreground"
                    onClick={() => handleReply(chat)}
                  >
                    <MdReply />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section
        className="flex flex-col items-center relative"
        onClick={(e: any) => {
          e.target.scrollIntoView();
        }}
      >
        {/* scroll down button */}
        {scrollDownButton ? (
          <div className=" absolute top-[-48px] z-[2]">
            <button
              className="p-[6px] rounded-full cursor-pointer bg-primary"
              onClick={() => handleScrollDown("smooth")}
            >
              <ArrowDown className="text-[12px] font-bold text-primary-foreground" />
            </button>
          </div>
        ) : null}

        <div className="bg-input p-2 rounded-lg mb-5 md:w-[80%] w-[95%]  flex flex-col gap-1">
          {reply && !reply.oldTextToUpDate ? (
            <div
              className="bg-card w-full flex  rounded cursor-pointer gap-1
              "
              onClick={() => handleScrollToView(reply.parentId)}
            >
              <div
                className="w-1 h-full rounded-r-md"
                style={{ backgroundColor: reply.themeColor }}
              ></div>
              <div className="flex-1 flex flex-col pr-2 py-1">
                <div className="flex items-center justify-between">
                  <p
                    className="text-[15px]"
                    style={{ color: reply.themeColor }}
                  >
                    {reply.userId === userData?.userId ? "You" : reply.name}
                  </p>
                  <button
                    className="w-[20px] h-[20px] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReply(null);
                    }}
                  >
                    <MdCancel className="size-full" />
                  </button>
                </div>

                <p className="text-[12px] text-muted-foreground">
                  {reply.text.length > 200
                    ? reply.text.slice(0, 200) + "..."
                    : reply.text}
                </p>
              </div>
            </div>
          ) : (
            /* updating Message */
            <div
              className={`bg-card w-full flex rounded cursor-pointer gap-1 ${
                reply ? "block" : "hidden"
              }`}
              onClick={() => handleScrollToView(reply?.documentId)}
            >
              <div
                className="w-1 h-full rounded-r-md"
                style={{ backgroundColor: themeColor }}
              ></div>

              <div className="flex-1 flex flex-col pr-2 py-1 ">
                <div className="flex items-center justify-between">
                  <p className="text-[15px]" style={{ color: themeColor }}>
                    Edit Message...
                  </p>
                  <button
                    className="w-[20px] h-[20px] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReply(null);
                      setMessage("");
                    }}
                  >
                    <MdCancel className="size-full" />
                  </button>
                </div>

                <p className="text-[12px] text-muted-foreground">
                  {reply?.oldTextToUpDate > 200
                    ? reply?.oldTextToUpDate.slice(0, 200) + "..."
                    : reply?.oldTextToUpDate}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-1 overflow-y-auto custom-scrollbar max-h-[100px] px-2">
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              placeholder="Write a comment..."
              className="outline-none flex-1 resize-none overflow-hidden text-[16px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="size-fit cursor-pointer sticky top-0"
              onClick={() => handleSendMessage()}
            >
              {sending ? (
                <div
                  className="w-5 h-5 border-2 border-card-foreground border-t-transparent rounded-full animate-spin
                "
                  onClick={(e: any) => e.stopPropagation()}
                ></div>
              ) : (
                <SendHorizonalIcon />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Alert */}
      {sendAlert ? (
        <Alert message={alertMessage} setActive={setSendAlert} />
      ) : null}
    </main>
  );
};

export default ChatRoom;
