import { useEffect, useState } from "react";
import defaultProfile from "../../Assets/defaultProfile.png";
import GalleryIcon from "../../Assets/GalleryIcon.png";
import PostBlock from "./contentComponents/PostBlock";
import thumbsUpIcon from "../../Assets/thumbs-up-icon.png";
import commentIcon from "../../Assets/comments-icons.png";
import moreIcon from "../../Assets/more-icon.png";

import { useSidebar } from "../ui/sidebar";
import {
  AiOutlineComment,
  AiOutlineSetting,
  AiOutlineMore,
} from "react-icons/ai";

import { listDocument, updateDocument } from "@/utils/db";
import { client } from "@/utils/appWrite";
import { ThumbsUp } from "lucide-react";

const Content = ({ userData }: any) => {
  const [postMode, setPostMode] = useState<boolean>(false);
  const { isMobile } = useSidebar();
  const [posts, setPosts] = useState<any>([]);

  useEffect(() => {
    handleListPosts();
  }, []);

  useEffect(() => {
    const unsubscribe = () => {
      client.subscribe(
        `databases.chat_box.collections.posts.documents`,
        (response: any) => {
          setPosts((prev: any) => {
            const exists = prev.find(
              (post: any) => post.$id === response.payload.$id
            );

            if (exists) {
              // If already exists, update it
              return prev.map((post: any) =>
                post.$id === response.payload.$id ? response.payload : post
              );
            } else {
              // If new, add to beginning
              return [response.payload, ...prev];
            }
          });
        }
      );
    };
    return unsubscribe;
  }, []);

  const handleListPosts = async () => {
    try {
      const result = await listDocument();
      setPosts(result.documents);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePostMode = () => {
    if (!userData) return alert("Login/SignUp to join the community");
    setPostMode(postMode ? false : true);
  };

  /*  console.log(posts); */

  const handleLike = async (postId: string, userId: any) => {
    if (!userData) return alert("Login/SignUp to join the community");
    try {
      const filterPost = await posts.filter((post: any) => post.$id === postId);

      const preveLikes = filterPost[0].likes;
      updateDocument(postId, [...preveLikes, userId.userId]);
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

      updateDocument(postId, [...preveLikes]);
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
          <p className="font-semibold">Photo</p>
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
                <section className="flex items-center gap-2 px-4 pt-2">
                  <div>
                    {post.user.picture ? (
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
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-gray-500 text-[13px]">
                      {formatDate(new Date(post.$createdAt))}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="p-2 rounded-full hover:bg-gray-300 cursor-pointer ">
                      <img src={moreIcon} alt="moreIcon" />
                    </div>

                    {/* postMore */}
                    {/* <div
                      className="w-[350px] h-[150px] absolute bg-gray-300 right-0 top-full p-2 rounded-lg opacity-0 pointer-events-none"
                      id={post.$id}
                    >
                      {" "}
                    </div> */}
                  </div>
                </section>

                <section className="px-4">
                  <p className="text-[14px] font-[arial]">{post.caption}</p>
                </section>

                {post.imageURL ? (
                  <section className="w-full">
                    <img
                      loading="lazy"
                      src={post.imageURL}
                      alt="posted image"
                      className="max-h-[450px] size-full"
                    />
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
                        :{post.likes.length}
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
                        :{post.comments}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between p-2">
                    {post.likes.length === 0 ? (
                      <button
                        className="cursor-pointer flex-1 text-[16px] text-gray-500 flex items-center justify-center hover:bg-gray-200 gap-1 rounded-md py-1 active:bg-gray-100"
                        id={post.$id}
                        onClick={() => handleLike(post.$id, userData)}
                      >
                        <ThumbsUp />
                        Like
                      </button>
                    ) : userData && post.likes.includes(userData.userId) ? (
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

                    <button className="cursor-pointer flex-1 text-[16px] text-gray-500 flex gap-1 items-center justify-center hover:bg-gray-200 rounded-md py-1">
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

      {/* outlet for post Input */}
      <PostBlock
        postMode={postMode}
        setPostMode={setPostMode}
        userData={userData}
      />

      {/* Posts */}
    </main>
  );
};

export default Content;
