import { AiOutlineClose } from "react-icons/ai";
import { useSidebar } from "@/components/ui/sidebar";
import defaultProfile from "@/Assets/defaultProfile.png";
import thumbsUpIcon from "@/Assets/thumbs-up-icon.png";
import commentIcon from "@/Assets/comments-icons.png";
import { SendHorizonalIcon } from "lucide-react";
import { useRef } from "react";

const CommentMode = ({
  commentMode,
  setCommentMode,
  postToComment,
  userData,
}: any) => {
  const { setOpen } = useSidebar();
  const textareaRef = useRef<any>(null);

  function formatDate(date: any) {
    const options = { day: "numeric", month: "long" };
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dayMonth = date.toLocaleDateString(undefined, options);
    return `${dayMonth} at ${time}`;
  }

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  if (!postToComment || !userData) return;
  console.log(postToComment);

  return (
    <div
      className={` ${
        commentMode ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50`}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-200/60 flex justify-center items-center`}
        onClick={() => {
          setCommentMode(false);
          setOpen(true);
        }}
      ></div>

      <div className="fixed bg-white w-[95%] h-[90%] md:w-[700px] md:h-[96%] rounded-lg flex flex-col">
        {/* Main Block Header */}
        <header className="flex items-center px-2 py-3 gap-2 border-b-[1.6px] border-t-gray-300 ">
          <p className="flex-1 text-center text-[20px]">
            {postToComment ? postToComment.user.name : ""}'s post
          </p>
          <div
            className=" font-extrabold  bg-gray-300 p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => {
              setCommentMode(false);
              setOpen(true);
            }}
          >
            <AiOutlineClose className="text-[25px] text-gray-500" />
          </div>
        </header>

        <main className=" flex flex-col gap-2 pb-5 flex-1 overflow-y-auto">
          <section className="px-4 pt-2">
            <div className="flex items-center gap-2">
              <div>
                {postToComment.user.picture ? (
                  <img
                    loading="lazy"
                    src={postToComment.user.picture}
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
                <p className="font-semibold">{postToComment.user.name}</p>
                <p className="text-gray-500 text-[13px]">
                  {formatDate(new Date(postToComment.$createdAt))}
                </p>
              </div>
            </div>
            {/* post caption */}
            <p>{postToComment.caption}</p>
          </section>

          <section className="flex flex-col gap-1">
            {postToComment.imageURL ? (
              <div className="w-full md:object-fit flex justify-center bg-gray-300">
                <img
                  loading="lazy"
                  src={postToComment.imageURL}
                  alt="post image"
                  className="max-h-[450px] size-full md:size-auto"
                />
              </div>
            ) : null}

            <div className="border-y py-1 border-gray-200 flex  justify-end px-5 gap-3">
              <div className="flex items-center">
                <img src={thumbsUpIcon} alt="thumbsUp" width={20} height={20} />
                <p className="text-[12px] text-gray-400">
                  :{postToComment.likes.length}
                </p>
              </div>
              <div className="flex items-center ">
                <img src={commentIcon} alt="comment" width={20} height={20} />
                <p className="text-[12px] text-gray-400">
                  :{postToComment.comments}
                </p>
              </div>
            </div>
          </section>

          <section className=" bg-red-400 "> hey</section>
        </main>

        <footer className="border-t-[1.6px] border-t-gray-300 p-2 ">
          <div className="bg-gray-200 p-2 rounded-lg flex gap-1">
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              placeholder="Write a comment..."
              className="outline-none flex-1 border resize-none overflow-hidden"
            />
            <button className="size-fit cursor-pointer">
              <SendHorizonalIcon />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CommentMode;
