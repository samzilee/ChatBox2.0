import { useState } from "react";

import GalleryIcon from "../../Assets/GalleryIcon.png";
import PostBlock from "./contentComponents/PostBlock";
import thumbsUpIcon from "../../Assets/thumbs-up-icon.png";
import commentIcon from "../../Assets/comments-icons.png";

import { useSidebar } from "../ui/sidebar";
import { AiOutlineComment } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { updateDocument, deleteDocument, deleteFile } from "@/utils/db";

import { formatDate } from "../FormatDate";
import {
  MessageCircleQuestion,
  MoreHorizontalIcon,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import CommentMode from "./contentComponents/CommentBlock";
import { Button } from "../ui/button";
import Alert from "../Alert";

const Content = ({
  userData,
  contentLoaded,
  setSendAlert,
  setAlertMessage,
  sendAlert,
  alertMessage,
  posts,
}: any) => {
  const [postMode, setPostMode] = useState<boolean>(false);
  const [commentMode, setCommentMode] = useState<boolean>(false);
  const [postToComment, setPostToComment] = useState<any>(null);
  const { isMobile, setOpen } = useSidebar();
  const [activeMore, setActiveMore] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  const handlePostMode = () => {
    if (!userData)
      return (
        setSendAlert(true),
        setAlertMessage("Login or SignUp to join the community")
      );
    setPostMode(true);
    const body = document.body;
    body.style.overflow = "hidden";
  };

  const handleDeletePost = async (postId: string, fileId: any) => {
    const moreBlock: HTMLElement | null = document.getElementById(postId);
    setDeleting(true);
    try {
      await deleteDocument("posts", postId);
      if (fileId) {
        await deleteFile(fileId);
      }
      /* await handleListPosts(); */
      setDeleting(false);
      if (moreBlock) {
        moreBlock.style.opacity = "0";
        moreBlock.style.pointerEvents = "none";
        setActiveMore("");
      }
    } catch (error) {
      console.log(error);
      setDeleting(false);
    }
  };

  const handleReportPost = (toBe: any) => {
    console.log(toBe);
  };

  const handleCommentMode = (post: any) => {
    if (!userData)
      return (
        setSendAlert(true),
        setAlertMessage("Login or SignUp to join the community")
      );
    setCommentMode(true);
    setOpen(false);
    setPostToComment(post);
    const body = document.body;
    body.style.overflow = "hidden";
  };

  const handleMore = (id: string) => {
    if (!userData)
      return (
        setSendAlert(true),
        setAlertMessage("Login or SignUp to join the community")
      );
    posts.map((post: any) => {
      const moreBlock: HTMLElement | null = document.getElementById(post.$id);
      if (moreBlock) {
        moreBlock.style.opacity = "0";
        moreBlock.style.pointerEvents = "none";
      }
    });

    const activeMoreBlock: HTMLElement | null = document.getElementById(id);

    if (activeMoreBlock) {
      activeMoreBlock.style.opacity = "1";
      activeMoreBlock.style.pointerEvents = "auto";
      setActiveMore(id);
    }

    const handleClickOutside = (event: any) => {
      if (activeMoreBlock && !activeMoreBlock?.contains(event?.target)) {
        activeMoreBlock.style.opacity = "0";
        activeMoreBlock.style.pointerEvents = "none";
        setActiveMore("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  };

  const handleLike = async (postId: string, userId: any) => {
    if (!userData)
      return (
        setSendAlert(true),
        setAlertMessage("Login or SignUp to join the community")
      );
    try {
      const filterPost = await posts.filter((post: any) => post.$id === postId);

      const preveLikes = filterPost[0].likes;
      updateDocument("posts", postId, {
        likes: [...preveLikes, userId.userId],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnLike = async (postId: string, userId: any) => {
    try {
      const filterPost = await posts.filter((post: any) => post.$id === postId);

      const preveLikes = filterPost[0].likes.filter(
        (like: any) => like !== userId.userId
      );

      updateDocument("posts", postId, { likes: [...preveLikes] });
    } catch (error) {
      console.log(error);
    }
  };

  /* HTML To Render */
  if (!contentLoaded && posts.length === 0) {
    return (
      <div className="h-full p-2 flex justify-center items-center bg-background  pt-[58px]">
        <div className="h-[70px] w-[70px] border-[6px] border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  } else {
    return (
      <main className="h-full max-h-dvh bg-background text-card-foreground flex flex-col scroll-smooth overflow-y-auto  pt-[58px]">
        <div className="overflow-y-auto">
          {/* Alert */}
          {sendAlert ? (
            <Alert message={alertMessage} setActive={setSendAlert} />
          ) : null}

          {/* Post Input */}
          <div className="w-full rounded-md p-2 mt-5 bg-card text-card-foreground flex items-center gap-2">
            <div className="w-[43px] cursor-pointer rounded-full">
              {userData ? (
                <img
                  loading="lazy"
                  src={userData.picture}
                  alt="Avatar"
                  className="size-full rounded-full bg-background"
                />
              ) : (
                <MdAccountCircle className="size-full" />
              )}
            </div>

            <button
              className="bg-background text-muted-foreground px-3 py-2 rounded-full flex-1 text-start cursor-pointer text-[15px] text-nowrap overflow-auto transition-colors duration-[0.3s] hover:bg-muted"
              onClick={() => handlePostMode()}
            >
              {isMobile ? (
                <p>What's on your mind?</p>
              ) : (
                <p>
                  What's on your mind, {userData ? userData.name : "{Name}"}?
                </p>
              )}
            </button>

            <button
              className="flex items-center cursor-pointer"
              onClick={() => handlePostMode()}
            >
              <img
                loading="lazy"
                src={GalleryIcon}
                alt="Gallery Icon"
                width={25}
                height={25}
              />
              <p className="font-semibold">Photo/video</p>
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="flex-1 bg-background text-foreground flex justify-center font-bold">
              <p className="py-5">Nothing To See Here...</p>
            </div>
          ) : (
            <main className=" flex-1 flex justify-center py-5 px-1">
              <ul className=" md:w-[470px] w-full flex flex-col gap-5">
                {posts.map((post: any, index: number) => {
                  return (
                    <li
                      className="bg-card text-card-foreground flex flex-col gap-2 rounded-[20px]"
                      key={index}
                    >
                      <section className="flex items-center gap-2 px-4 pt-5">
                        <div className="relative group cursor-pointer">
                          {post.user && post.user.picture ? (
                            <img
                              loading="lazy"
                              src={post.user.picture}
                              alt="avatar"
                              width={45}
                              height={45}
                              className=" rounded-full bg-background"
                            />
                          ) : (
                            <MdAccountCircle size={45} />
                          )}
                          {/* ToolTip */}
                          <p className="absolute bg-gray-600 text-gray-200 font-normal text-[10px] px-1 scale-0 group-hover:scale-100 transition-all duration-[0.5s]">
                            {post.user?.email}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {post.user?.name}
                          </p>
                          <p className="text-muted-foreground text-[13px]">
                            {formatDate(new Date(post.$createdAt))}
                          </p>
                        </div>

                        <div className="relative">
                          <div
                            className={`p-2 rounded-full hover:bg-background cursor-pointer text-foreground ${
                              activeMore === post.$id ? "bg-background" : ""
                            } `}
                            onClick={() => handleMore(post.$id)}
                          >
                            <MoreHorizontalIcon />
                          </div>

                          {/* postMore */}
                          <div
                            className=" absolute bg-background right-0  rounded-lg opacity-0 pointer-events-none text-nowrap  font-normal w-[160px] flex flex-col z-[8] transition-all duration-[0.3s]"
                            id={post.$id}
                          >
                            <Button
                              variant={"outline"}
                              className="w-full flex gap-2 items-center cursor-pointer  hover:bg-accent hover:text-accent-foreground p-5 rounded-md border-none"
                              onClick={() => handleReportPost(post)}
                            >
                              <MessageCircleQuestion className="text-[50px]" />
                              <p>Report Post</p>
                            </Button>
                            {post.userId === userData?.userId ? (
                              <Button
                                variant={"outline"}
                                className="w-full flex gap-2 items-center cursor-pointer border-none  hover:bg-accent hover:text-accent-foreground p-5 rounded-md"
                                onClick={() =>
                                  handleDeletePost(post.$id, post.fileId)
                                }
                              >
                                {deleting ? (
                                  <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="text-[50px]" />
                                )}

                                <p>Move to bin</p>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </section>

                      <section className="px-4 text-foreground">
                        <p className="text-[14px] font-[arial] whitespace-pre-wrap">
                          {post.caption}
                        </p>
                      </section>

                      {post.fileUrl ? (
                        <section
                          className={`w-full bg-[rgba(170,170,170,0.241)]`}
                        >
                          {post.fileType === "video" ? (
                            <video
                              src={post.fileUrl}
                              controls
                              className="max-h-[450px] size-full"
                            />
                          ) : (
                            <img
                              loading="lazy"
                              src={post.fileUrl}
                              alt="posted image"
                              className="max-h-[450px] size-full object-contain"
                            />
                          )}
                        </section>
                      ) : null}

                      <section className="flex flex-col gap-1 ">
                        <div className="flex items-center justify-end gap-2 border-b py-2 ">
                          <div className="flex items-center">
                            <img
                              src={thumbsUpIcon}
                              alt="thumbsUp"
                              width={20}
                              height={20}
                            />
                            <p className="text-[12px] text-gray-400">
                              {post.likes?.length}
                            </p>
                          </div>
                          <div className="flex items-center px-4 ">
                            <img
                              src={commentIcon}
                              alt="comment"
                              width={20}
                              height={20}
                            />
                            <p className="text-[12px] text-gray-400">
                              {post.comments?.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between p-2 gap-2">
                          {post.likes?.length === 0 ? (
                            <Button
                              variant={"outline"}
                              className="cursor-pointer flex-1 text-[16px] text-muted-foreground flex items-center justify-center  gap-1 rounded-md py-1 border-none"
                              id={post.$id}
                              onClick={() => handleLike(post.$id, userData)}
                            >
                              <ThumbsUp />
                              Like
                            </Button>
                          ) : userData &&
                            post.likes?.includes(userData.userId) ? (
                            <Button
                              variant={"outline"}
                              key={index}
                              className="cursor-pointer flex-1 text-[16px]  flex items-center justify-center gap-1 rounded-md py-1 text-green-500 border-none hover:text-green-500"
                              onClick={() => handleUnLike(post.$id, userData)}
                            >
                              <ThumbsUp fill="#05df72" />
                              Like
                            </Button>
                          ) : (
                            <Button
                              variant={"outline"}
                              key={index}
                              className="cursor-pointer flex-1 text-[16px] text-muted-foreground flex items-center justify-center  gap-1 rounded-md py-1 border-none"
                              id={post.$id}
                              onClick={() => handleLike(post.$id, userData)}
                            >
                              <ThumbsUp />
                              Like
                            </Button>
                          )}

                          <Button
                            variant={"outline"}
                            className="cursor-pointer flex-1 text-[16px] text-muted-foreground flex gap-1 items-center justify-center  rounded-md py-1 border-none"
                            onClick={() => handleCommentMode(post)}
                          >
                            <AiOutlineComment className="text-[23px]" />
                            Comment
                          </Button>
                        </div>
                      </section>
                    </li>
                  );
                })}
              </ul>
            </main>
          )}
        </div>

        {/* outlet for post Block */}
        <PostBlock
          postMode={postMode}
          setPostMode={setPostMode}
          userData={userData}
          posts={posts}
        />

        {/* outlet for comment Block */}
        <CommentMode
          commentMode={commentMode}
          setCommentMode={setCommentMode}
          postToComment={postToComment}
          userData={userData}
        />
      </main>
    );
  }
};

export default Content;
