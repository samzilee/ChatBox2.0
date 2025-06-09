import { AiOutlineClose } from "react-icons/ai";
import { useSidebar } from "@/components/ui/sidebar";
import thumbsUpIcon from "@/Assets/images/thumbs-up-icon.png";
import commentIcon from "@/Assets/images/comments-icons.png";
import { SendHorizonalIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateDocument, deleteDocument } from "@/utils/db";
import { client } from "@/utils/appWrite";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/FormatDate";

const CommentMode = ({
  commentMode,
  setCommentMode,
  postToComment,
  userData,
}: any) => {
  const { setOpen } = useSidebar();
  const [commentText, setCommentText] = useState<string>("");
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const [trashComment, setTrashComment] = useState<string>("");

  const textareaRef = useRef<any>(null);

  useEffect(() => {
    if (commentMode) {
      setComments(postToComment.comments);

      const unsubscribe = client.subscribe(
        `databases.chat_box.collections.posts.documents`,
        (response: any) => {
          setComments(response.payload.comments);
        }
      );

      return () => unsubscribe();
    }
  }, [commentMode]);

  const handleSendComment = async () => {
    try {
      if (commentText === "") return;
      setSendingComment(true);

      const newComments = [
        {
          userId: userData.userId,
          postId: postToComment.$id,
          comment: commentText,
          user: {
            userId: userData.userId,
            email: userData.email,
            name: userData.name || userData.given_name,
            given_name: userData.given_name,
            picture: userData.picture,
            email_verified: userData.email_verified,
          },
        },
        ...comments,
      ];

      await updateDocument("posts", postToComment.$id, {
        comments: newComments,
      });

      setCommentText("");
      setSendingComment(false);
    } catch (error) {
      console.log(error);
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (documentId: string) => {
    try {
      setTrashComment(documentId);
      await deleteDocument("comments", documentId);
      await updateDocument("posts", postToComment.$id, {
        comments: comments.filter((comment: any) => comment.$id !== documentId),
      });
      setTrashComment("");
    } catch (error) {
      console.log(error);
      setTrashComment("");
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  if (!postToComment || !userData) return;

  return (
    <div
      className={` ${
        commentMode ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50`}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-500/60 flex justify-center items-center`}
        onClick={() => {
          setCommentMode(false);
          setOpen(true);
          const body = document.body;
          body.style.overflow = "auto";
        }}
      ></div>

      <div className="fixed bg-card text-card-foreground w-[97%] h-[90%] md:w-[700px] md:h-[96%] rounded-lg flex flex-col">
        {/* Main Block Header */}
        <header className="flex items-center px-2 py-3 gap-2 border-b-[1.6px] border-t-gray-300 ">
          <p className="flex-1 text-center text-[20px]">
            {postToComment ? postToComment.user.name : ""}'s post
          </p>
          <Button
            variant={"destructive"}
            className="font-extrabold p-2 rounded-full cursor-pointer h-[40px] w-[40px]"
            onClick={() => {
              setCommentMode(false);
              setOpen(true);
              const body = document.body;
              body.style.overflow = "auto";
            }}
          >
            <AiOutlineClose />
          </Button>
        </header>

        <main className="gap-2 pb-5 flex-1 overflow-y-auto ">
          <section className="px-4 pt-2 mb-4">
            <div className="flex items-center gap-2">
              <div>
                <img
                  loading="lazy"
                  src={postToComment.user.picture}
                  alt="avatar"
                  width={45}
                  height={45}
                  className=" rounded-full bg-background"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{postToComment.user.name}</p>
                <p className="text-gray-500 text-[13px]">
                  {formatDate(new Date(postToComment.$createdAt))}
                </p>
              </div>
            </div>
            {/* post caption */}
            <p className=" whitespace-pre-wrap">{postToComment.caption}</p>
          </section>

          <section className="flex flex-col gap-1 mb-4">
            {postToComment.fileUrl ? (
              <div className="w-full md:object-fit flex justify-center md:bg-background">
                {postToComment.fileType === "video" ? (
                  <video
                    src={postToComment.fileUrl}
                    controls
                    className="max-h-[450px] size-full"
                  />
                ) : (
                  <img
                    loading="lazy"
                    src={postToComment.fileUrl}
                    alt="post image"
                    className="object-fit-contain size-full md:size-auto"
                  />
                )}
              </div>
            ) : null}

            <div className="border-b py-1 border-border flex  justify-end px-5 gap-3">
              <div className="flex items-center">
                <img src={thumbsUpIcon} alt="thumbsUp" width={20} height={20} />
                <p className="text-[12px] text-gray-400">
                  {postToComment.likes.length}
                </p>
              </div>
              <div className="flex items-center ">
                <img src={commentIcon} alt="comment" width={20} height={20} />
                <p className="text-[12px] text-gray-400">{comments.length}</p>
              </div>
            </div>
          </section>

          <section className="px-5">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center">NO COMMENTS</p>
            ) : (
              <ul className="flex flex-col-reverse gap-4 pb-5">
                {comments.map((comment: any, index: any) => {
                  return (
                    <li className="flex gap-2" key={index}>
                      <img
                        loading="lazy"
                        src={comment.user.picture}
                        alt="avater"
                        className="w-[40px] h-[40px] rounded-full "
                      />

                      <div className="bg-background px-3 pt-1 pb-2 rounded-lg">
                        <p>
                          @{comment.user.given_name}{" "}
                          <span className="text-[12px] text-muted-foreground font-semibold">
                            {formatDate(new Date(comment.$createdAt))}
                          </span>{" "}
                        </p>
                        <p className="text-[15px] whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>

                      {userData.userId === comment.userId ? (
                        trashComment === comment.$id ? (
                          <Button
                            variant={"destructive"}
                            className="p-1 rounded-md pointer-events-none  "
                          >
                            <div className="w-[23px] h-[23px] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </Button>
                        ) : (
                          <Button
                            variant={"destructive"}
                            className=" cursor-pointer p-1 rounded-md h-[35px] w-[35px] "
                            id={comment.$id}
                            onClick={() => handleDeleteComment(comment.$id)}
                          >
                            <Trash2 />
                          </Button>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>

        <footer className="border-t-[1.6px] border-t-border p-2 ">
          <div className="bg-input p-2 rounded-lg flex gap-1">
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="outline-none flex-1 resize-none overflow-hidden"
            />
            <button
              className="size-fit cursor-pointer"
              onClick={() => handleSendComment()}
            >
              {sendingComment ? (
                <div
                  className="w-5 h-5 border-2 border-card-foreground border-t-transparent rounded-full animate-spin
                "
                ></div>
              ) : (
                <SendHorizonalIcon />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CommentMode;
