import { ArrowDown, SendHorizonalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "../FormatDate";
import { createDocument, listDocument } from "@/utils/db";
import { client } from "@/utils/appWrite";
import Alert from "../Alert";
import { MdCancel, MdReply } from "react-icons/md";
import { Button } from "../ui/button";

const ChatRoom = ({ userData }: any) => {
  const textareaRef = useRef(null);
  const [loadingChat, setLoadingChat] = useState<Boolean>(false);
  const [chats, setChats] = useState<any>([]);
  const [reply, setReply] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendAlert, setSendAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [scrollDownButton, setScrollDownButton] = useState<boolean>(false);
  const scrollElement = useRef<HTMLElement | null>(null);

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
        } else {
          setChats((prev: any) => {
            return [...prev, response.payload];
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
  }, [chats]);

  const handleListChat = async () => {
    try {
      setLoadingChat(true);
      const response = await listDocument("mainroom", "old-to-new");
      setChats(response.documents);
      setLoadingChat(false);
      handleScrollDown();
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
      if (userData) {
        setSending(true);
        if (reply) {
          await createDocument("mainroom", {
            text: message,
            senderId: userData.userId,
            senderName: userData.name || userData.given_name,
            senderAvatar: userData.picture,
            replies: reply,
          });
        } else {
          await createDocument("mainroom", {
            text: message,
            senderId: userData.userId,
            senderName: userData.name || userData.given_name,
            senderAvatar: userData.picture,
          });
        }
        setSending(false);
        setMessage("");
        setReply(null);
        handleScrollDown();
      } else {
        setSendAlert(true);
        setAlertMessage(
          "Ready to chat? 💬 Just log in first so we know who’s talking!"
        );
      }
    } catch (error) {
      console.log(error);
      setSending(false);
    }
  };

  const handleReply = (chat: any) => {
    setReply({
      text: chat.text,
      name: chat.senderName,
      parentId: chat.$id,
      userId: chat.senderId,
    });
  };

  const handleScrollToView = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView();
    }
  };

  const handleCheckScroll = () => {
    const chatScroll = scrollElement.current;
    if (chatScroll) {
      /* console.log(chatScroll.scrollTop, chatScroll.scrollHeight); */
      setScrollDownButton(
        chatScroll.scrollTop + chatScroll.clientHeight <
          chatScroll.scrollHeight - 100
      );
    }
  };
  const handleScrollDown = () => {
    const chatSroll = scrollElement.current;

    if (chatSroll) {
      chatSroll.scrollTo({
        top: chatSroll.scrollHeight,
      });
    }
  };

  const handleInput = () => {
    const textarea: any = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  if (loadingChat && chats.length === 0) {
    return (
      <div className="h-full p-2 flex justify-center items-center bg-background  pt-[58px]">
        <div className="h-[70px] w-[70px] border-[6px] border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="bg-background text-card-foreground  flex flex-col pt-[58px] h-full">
      {chats.length === 0 ? (
        <div className="flex-1 text-center text-foreground">
          <p>No Messages Yet.</p>
        </div>
      ) : (
        <section
          className="flex-1 overflow-y-auto scroll-smooth"
          ref={scrollElement}
          onScroll={() => handleCheckScroll()}
        >
          <ul className="h-fit p-5 flex flex-col gap-5">
            {chats.map((chat: any) => {
              return chat.senderId === userData?.userId ? (
                <li className="flex justify-end " key={chat.$id} id={chat.$id}>
                  <div className=" bg-green-800 text-white w-fit rounded-md max-w-[80%] md:max-w-[500px] px-2 py-1 flex flex-col ">
                    {chat.replies ? (
                      <div
                        className="bg-green-900 rounded px-2 py-1 cursor-pointer flex flex-col"
                        onClick={() =>
                          handleScrollToView(chat.replies.parentId)
                        }
                      >
                        <p className="text-[13px]">{chat.replies.name}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {chat.replies.text.length > 150
                            ? chat.replies.text.slice(0, 150) + "..."
                            : chat.replies.text}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex flex-col">
                      {/* text */}
                      <p className="text-[14px] whitespace-pre-wrap">
                        {chat.text}
                      </p>
                      {/* date */}
                      <p className="text-[12px] text-gray-200/65 font-semibold text-end ">
                        {formatDate(new Date(chat.$createdAt))}
                      </p>
                    </div>
                  </div>
                </li>
              ) : (
                <li className="flex justify-start" key={chat.$id} id={chat.$id}>
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
                        <p>{chat.senderName}</p>
                        <p className="text-[12px] text-muted-foreground font-semibold">
                          {formatDate(new Date(chat.$createdAt))}
                        </p>{" "}
                      </div>
                    </div>

                    {chat.replies ? (
                      <div
                        className="bg-background rounded px-2 py-1 cursor-pointer flex flex-col"
                        onClick={() =>
                          handleScrollToView(chat.replies.parentId)
                        }
                      >
                        <p className="text-[13px]">{chat.replies.name}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {chat.replies.text.length > 150
                            ? chat.replies.text.slice(0, 150) + "..."
                            : chat.replies.text}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-lg flex-1">
                      <p className="text-[14px] whitespace-pre-wrap">
                        {chat.text}
                      </p>
                    </div>
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
          {/* scroll down button */}
          {scrollDownButton ? (
            <div className=" sticky bottom-0 flex justify-end pr-[5%] pb-[5%]">
              <button
                className="p-[6px] rounded-full cursor-pointer bg-primary "
                onClick={() => handleScrollDown()}
              >
                <ArrowDown className="text-[12px] font-bold text-primary-foreground" />
              </button>
            </div>
          ) : (
            ""
          )}
        </section>
      )}
      <section className="border-t-[1.6px] border-t-border p-2 pb-5 border flex justify-center">
        <div className="bg-input p-2 rounded-lg  md:w-[80%] w-[95%] flex flex-col gap-1 ">
          {reply ? (
            <div className="bg-card w-full flex flex-col px-2 py-1 rounded">
              <header className="flex items-center justify-between">
                <p className="text-[15px]">{reply.name}</p>
                <button
                  className="w-[20px] h-[20px] cursor-pointer"
                  onClick={() => setReply(null)}
                >
                  <MdCancel className="size-full" />
                </button>
              </header>

              <p className="text-[12px] text-muted-foreground">
                {reply.text.length > 200
                  ? reply.text.slice(0, 200) + "..."
                  : reply.text}
              </p>
            </div>
          ) : null}

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
