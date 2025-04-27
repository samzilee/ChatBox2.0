import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import defaultProfile from "../../../Assets/defaultProfile.png";
import GalleryIcon from "../../../Assets/GalleryIcon.png";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { createDocument, createFile, getFile } from "@/utils/db";

const PostBlock = ({ postMode, setPostMode, userData }: any) => {
  const { setOpen } = useSidebar();
  const [postText, setPostText] = useState<string>("");
  const [localImage, setLocalImage] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const textareaRef = useRef<any>(null);
  const imageInputRef = useRef<any>(null);

  useEffect(() => {
    if (postMode) {
      setOpen(false);
    }
  }, [postMode]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setError(false);
      clearTimeout(timeout);
    }, 5000);
  }, [error]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  const handlePost = async () => {
    setLoading(true);
    if (imageFile && Image) {
      handleCreateFile();
    } else {
      handleCreateDocument(undefined);
    }
  };

  const handleGetFile = async (fileId: string) => {
    try {
      const response = getFile(fileId);
      return response;
    } catch (error) {
      console.log(error);
      setErrorMessage("Error: couldn't get file");
      setError(true);
    }
  };

  const handleCreateFile = async () => {
    try {
      const response = await createFile(imageFile);
      const result: any = await handleGetFile(response.$id);
      return handleCreateDocument(result.href);
    } catch (error) {
      console.log(error);
      setErrorMessage("Error: couldn't create File");
      setError(true);
    }
  };

  const handleCreateDocument = async (imageUrl: string | undefined) => {
    try {
      await createDocument({
        userId: userData.userId,
        caption: postText,
        imageURL: imageUrl,
        comments: 0,
        likes: [],
        user: {
          userId: userData.userId,
          email: userData.email,
          name: userData.name || userData.given_name,
          picture: userData.picture,
          email_verified: userData.email_verified,
        },
      });
      /*  await createUserDocument(userData); */
      setLoading(false);
      setPostText("");
      setLocalImage(null);
      setPostMode(false);
    } catch (error) {
      console.log(error);
      setErrorMessage("Error: couldn't create ducument");
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div
      className={` ${
        postMode ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center`}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-200/60 flex justify-center items-center`}
        onClick={() => setPostMode(false)}
      ></div>

      {/* Error Notification */}
      <div
        className={`absolute bottom-[15px] bg-red-500 text-gray-200 w-fit p-3 z-50 rounded-l-lg font-[arial] transition-all duration-[0.5s] text-[14px] ${
          error ? "right-0" : "left-full"
        }`}
      >
        <p>{errorMessage}</p>
      </div>

      {/* Main Block */}
      <div className="fixed bg-white w-[95%] h-[90%] md:w-[500px] md:h-[96%] rounded-lg flex flex-col ">
        {/* Main Block Header */}
        <header className="flex items-center px-2 py-3 gap-2 border-b-[1.5px] ">
          <p className="flex-1 text-center text-[20px]">Create Post</p>
          <div
            className=" font-extrabold  bg-gray-300 p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => {
              setPostMode(false);
              setOpen(true);
            }}
          >
            <AiOutlineClose className="text-[25px] text-gray-400" />
          </div>
        </header>

        {/* Main Block Content */}
        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
          <div className="flex flex-col gap-2 ">
            {/* text Area Block */}
            <div className="flex items-center gap-2">
              <img
                src={userData ? userData.picture : defaultProfile}
                alt="Avatar"
                width={45}
                height={45}
                className="rounded-full"
              />
              <p>{userData ? userData.name : "null"}</p>
            </div>

            <textarea
              ref={textareaRef}
              onInput={handleInput}
              className="w-full resize-none overflow-hidden p-2 outline-none font-normal"
              placeholder={`what's on your mind, ${
                userData ? userData.name : " "
              }?`}
              rows={1}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>

          {/* image Area Block */}
          <input
            type="file"
            hidden={true}
            id="imageInput"
            ref={imageInputRef}
            onChange={(e) => {
              if (e.target.files) {
                const file = e.target.files[0];
                setImageFile(file);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setLocalImage((prev: string) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                  });
                }
              }
            }}
          />
          {localImage ? (
            <div className=" relative border-[2px] p-2 rounded-md bg-gray-200 overflow-auto ">
              <div>
                <img
                  src={localImage}
                  alt="image you uploaded"
                  className="size-full rounded-md"
                />
              </div>

              <button
                className="absolute top-[15px] right-[15px] bg-gray-200 rounded-full p-[2px] cursor-pointer"
                onClick={() => {
                  if (localImage) {
                    URL.revokeObjectURL(localImage);
                    setLocalImage("");
                  }

                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                }}
              >
                <AiOutlineClose className="text-[25px] text-gray-400" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="imageInput"
              className="flex-1 rounded-lg bg-gray-200 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={GalleryIcon}
                  alt="AddPic Icon"
                  width={35}
                  height={35}
                />
                <p>Add Photo</p>
              </div>
            </label>
          )}
          {/* post Button */}
          {postText !== "" || localImage ? (
            <Button
              className={`cursor-pointer font-bold text-[17px] opacity-[0.8] border-none ${
                loading ? "pointer-events-none opacity-[0.6]" : ""
              }`}
              onClick={() => handlePost()}
            >
              <div
                className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${
                  loading ? "block" : "hidden"
                }`}
              ></div>
              Post
            </Button>
          ) : (
            <Button
              variant="outline"
              className={` pointer-events-none font-bold text-[17px] opacity-[0.6] border-none bg-gray-400`}
            >
              Post
            </Button>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostBlock;
