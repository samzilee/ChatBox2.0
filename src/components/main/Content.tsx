import { useEffect, useState } from "react";
import defaultProfile from "../../Assets/defaultProfile.png";
import GalleryIcon from "../../Assets/GalleryIcon.png";
import PostBlock from "./contentComponents/PostBlock";
import thumbsUpIcon from "../../Assets/thumbs-up-icon.png";
import commentIcon from "../../Assets/comments-icons.png";
import moreIcon from "../../Assets/more-icon.png";
import reportIcon from "../../Assets/Report-icon.png";
import bin from "../../Assets/bin-icon.png";

import { useSidebar } from "../ui/sidebar";
import { AiOutlineComment } from "react-icons/ai";

import {
  listDocument,
  updateLikes,
  deleteDocument,
  deleteFile,
} from "@/utils/db";
import { client } from "@/utils/appWrite";
import { ThumbsUp } from "lucide-react";
import CommentMode from "./contentComponents/CommentMode";
import { Outlet } from "react-router-dom";

const Content = ({ userData, setContentLoaded, contentLoaded }: any) => {
  const [postMode, setPostMode] = useState<boolean>(false);
  const [commentMode, setCommentMode] = useState<boolean>(false);
  const [postToComment, setPostToComment] = useState<any>(null);
  const { isMobile, setOpen } = useSidebar();
  const [posts, setPosts] = useState<any>([]);
  const [activeMore, setActiveMore] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    handleListPosts();
  }, []);

  useEffect(() => {
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

  const handleListPosts = async () => {
    try {
      const result = await listDocument();
      setPosts(result.documents);
      setContentLoaded(true);
    } catch (error) {
      console.log(error);
      setContentLoaded(true);
    }
  };

  const handlePostMode = () => {
    if (!userData) return alert("Login/SignUp to join the community");
    setPostMode(true);
    const body = document.body;
    body.style.overflow = "hidden";
  };

  const handleDeletePost = async (postId: string, fileId: any) => {
    const moreBlock: HTMLElement | null = document.getElementById(postId);
    setDeleting(true);
    try {
      await deleteDocument("posts", postId);
      await handleListPosts();
      await deleteFile(fileId);
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
    if (!userData) return alert("Login/SignUp to join the community");
    setCommentMode(true);
    setOpen(false);
    setPostToComment(post);
    const body = document.body;
    body.style.overflow = "hidden";
  };

  const handleMore = (id: string) => {
    if (!userData) return alert("Login/SignUp to join the community");
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
    if (!userData) return alert("Login/SignUp to join the community");
    try {
      const filterPost = await posts.filter((post: any) => post.$id === postId);

      const preveLikes = filterPost[0].likes;
      updateLikes(postId, [...preveLikes, userId.userId]);
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

      updateLikes(postId, [...preveLikes]);
    } catch (error) {
      console.log(error);
    }
  };

  function formatDate(date: any) {
    const options = { day: "numeric", month: "long" };
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dayMonth = date.toLocaleDateString(undefined, options);
    return `${dayMonth} at ${time}`;
  }

  if (posts.length === 0 && !contentLoaded)
    return <div className="bg-gray-200 flex flex-col"></div>;

  return (
    <main className="w-full h-full px-1 bg-gray-200 flex flex-col gap-5">
      {/* Post Input */}
      <div className="w-full rounded-md p-2 mt-5 bg-white flex items-center gap-2">
        <div className="w-[43px] cursor-pointer rounded-full">
          <img
            src={userData ? userData.picture : defaultProfile}
            alt="Avatar"
            className="size-full rounded-full"
          />
        </div>

        <button
          className="bg-gray-200 px-3 py-2 rounded-full flex-1 text-start cursor-pointer hover:bg-gray-300 text-[15px] text-nowrap overflow-auto"
          onClick={() => handlePostMode()}
        >
          {isMobile ? (
            <p>What's on your mind?</p>
          ) : (
            <p>What's on your mind, {userData ? userData.name : "{Name}"}?</p>
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

      <main className=" flex-1 flex justify-center py-5 px-1">
        <ul className=" md:w-[470px] w-full flex flex-col gap-5">
          {posts.map((post: any, index: number) => {
            return (
              <li
                className="bg-white flex flex-col gap-2 rounded-[20px]"
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
                        className=" rounded-full"
                      />
                    ) : (
                      <img
                        loading="lazy"
                        src={defaultProfile}
                        alt="avatar"
                        width={45}
                        height={45}
                        className=" rounded-full"
                      />
                    )}
                    {/* ToolTip */}
                    <p className="absolute bg-gray-600 text-gray-200 font-normal text-[10px] px-1 scale-0 group-hover:scale-100 transition-all duration-[0.5s]">
                      {post.user?.email}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{post.user?.name}</p>
                    <p className="text-gray-500 text-[13px]">
                      {formatDate(new Date(post.$createdAt))}
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className={`p-2 rounded-full hover:bg-gray-300 cursor-pointer ${
                        activeMore === post.$id ? "bg-gray-300" : ""
                      } `}
                      onClick={() => handleMore(post.$id)}
                    >
                      <img src={moreIcon} alt="moreIcon" />
                    </div>

                    {/* postMore */}
                    <div
                      className=" absolute bg-gray-200 right-0  rounded-lg opacity-0 pointer-events-none text-nowrap p-2 text-gray-600 font-normal w-[160px] flex flex-col z-[8] transition-all duration-[0.3s]"
                      id={post.$id}
                    >
                      <button
                        className="w-full flex gap-2 items-center cursor-pointer  hover:bg-gray-300 p-2 rounded-md"
                        onClick={() => handleReportPost(post)}
                      >
                        <img
                          src={reportIcon}
                          alt="reportIcon"
                          width={18}
                          height={18}
                        />
                        <p>Report Post</p>
                      </button>
                      {post.userId === userData?.userId ? (
                        <button
                          className="w-full flex gap-2 items-center cursor-pointer  hover:bg-gray-300 p-2 rounded-md"
                          onClick={() =>
                            handleDeletePost(post.$id, post.fileId)
                          }
                        >
                          {deleting ? (
                            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <img
                              src={bin}
                              alt="bin icon"
                              width={20}
                              height={20}
                            />
                          )}

                          <p>Move to bin</p>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="px-4">
                  <p className="text-[14px] font-[arial]">{post.caption}</p>
                </section>

                {post.fileUrl ? (
                  <section className={`w-full bg-gray-400`}>
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
                  <div className="flex justify-between p-2">
                    {post.likes?.length === 0 ? (
                      <button
                        className="cursor-pointer flex-1 text-[16px] text-gray-500 flex items-center justify-center hover:bg-gray-200 gap-1 rounded-md py-1 active:bg-gray-100"
                        id={post.$id}
                        onClick={() => handleLike(post.$id, userData)}
                      >
                        <ThumbsUp />
                        Like
                      </button>
                    ) : userData && post.likes?.includes(userData.userId) ? (
                      <button
                        key={index}
                        className="cursor-pointer flex-1 text-[16px]  flex items-center justify-center gap-1 rounded-md py-1 text-green-300 hover:bg-green-200 active:bg-green-100"
                        onClick={() => handleUnLike(post.$id, userData)}
                      >
                        <ThumbsUp fill="#7bf1a8" />
                        Like
                      </button>
                    ) : (
                      <button
                        key={index}
                        className="cursor-pointer flex-1 text-[16px] text-gray-500 flex items-center justify-center hover:bg-gray-200 gap-1 rounded-md py-1 active:bg-gray-100"
                        id={post.$id}
                        onClick={() => handleLike(post.$id, userData)}
                      >
                        <ThumbsUp />
                        Like
                      </button>
                    )}

                    <button
                      className="cursor-pointer flex-1 text-[16px] text-gray-500 flex gap-1 items-center justify-center hover:bg-gray-200 rounded-md py-1"
                      onClick={() => handleCommentMode(post)}
                    >
                      <AiOutlineComment className="text-[23px]" />
                      Comment
                    </button>
                  </div>
                </section>
              </li>
            );
          })}
        </ul>
      </main>

      {/* outlet for post Block */}
      <PostBlock
        postMode={postMode}
        setPostMode={setPostMode}
        userData={userData}
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
};

export default Content;
