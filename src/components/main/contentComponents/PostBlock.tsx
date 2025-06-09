import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import GalleryIcon from "../../../Assets/images/GalleryIcon.png";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  createDocument,
  createFile,
  deleteDocument,
  deleteFile,
  getFile,
} from "@/utils/db";
import Alert from "@/components/Alert";

const PostBlock = ({ postMode, setPostMode, userData, posts }: any) => {
  const { setOpen } = useSidebar();
  const [postText, setPostText] = useState<string>("");
  const [localImage, setLocalImage] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

  const textareaRef = useRef<any>(null);
  const imageInputRef = useRef<any>(null);

  useEffect(() => {
    if (postMode) {
      setOpen(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [postMode]);

  useEffect(() => {
    if (!imageFile) return;
    setFileType(() => {
      return imageFile.type.includes("video") ? "video" : "picture";
    });
  }, [imageFile]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      if (posts.length === 100) {
        const oldestPost: any = posts[posts.length - 1];
        await deleteDocument("posts", oldestPost.$id);
        if (oldestPost.fileId) {
          await deleteFile(oldestPost.fileId);
        }
      }

      if (imageFile && Image && fileType !== "") {
        handleCreateFile();
      } else {
        handleCreateDocument(undefined, undefined);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Error uploading document");
      setError(true);
      setLoading(false);
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
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    try {
      const response = await createFile(imageFile);
      const result: any = await handleGetFile(response.$id);
      handleCreateDocument(result.href, response.$id);
    } catch (error) {
      console.log(error);
      setErrorMessage("Error: couldn't upload file");
      setError(true);
      setLoading(false);
    }
  };

  const handleCreateDocument = async (
    file: string | undefined,
    fileID: string | undefined
  ) => {
    try {
      await createDocument("posts", {
        userId: userData.userId,
        caption: postText,
        fileId: fileID,
        fileUrl: file,
        fileType: fileType,
        comments: [],
        likes: [],
        user: {
          userId: userData.userId,
          email: userData.email,
          name: userData.name || userData.given_name,
          picture: userData.picture,
          given_name: userData.given_name,
          email_verified: userData.email_verified,
        },
      });
      /*  await createUserDocument(userData); */
      setLoading(false);
      setPostText("");
      setLocalImage(null);
      setPostMode(false);
      setImageFile(null);
      const body = document.body;
      body.style.overflow = "auto";
    } catch (error) {
      console.log(error);
      setErrorMessage("Error: couldn't upload ducument");
      setError(true);
      setLoading(false);
      setImageFile(null);
    }
  };

  return (
    <div
      className={` ${
        postMode ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50`}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-500/60 flex justify-center items-center`}
        onClick={() => {
          setPostMode(false);
          setOpen(true);
          const body = document.body;
          body.style.overflow = "auto";
        }}
      ></div>

      {/* Alert */}

      {error ? <Alert message={errorMessage} setActive={setError} /> : null}

      {/* Main Block */}
      <div className="fixed bg-card text-card-foreground w-[95%] h-[90%] md:w-[500px] md:h-[96%] rounded-lg flex flex-col ">
        {/* Main Block Header */}
        <header className="flex items-center px-2 py-3 gap-2 border-b-[1.5px] ">
          <p className="flex-1 text-center text-[20px]">Create Post</p>
          <Button
            variant={"destructive"}
            className=" font-extrabold w-[40px] h-[40px] p-2 rounded-full cursor-pointer"
            onClick={() => {
              setPostMode(false);
              setOpen(true);
              const body = document.body;
              body.style.overflow = "auto";
            }}
          >
            <AiOutlineClose />
          </Button>
        </header>

        {/* Main Block Content */}
        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
          <div className="flex flex-col gap-2 text">
            {/* text Area Block */}
            <div className="flex items-center gap-2">
              <img
                loading="lazy"
                src={userData?.picture}
                alt="Avatar"
                width={45}
                height={45}
                className="rounded-full bg-background"
              />
              <p>{userData?.name || userData?.given_name}</p>
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

                /* checking if file size is greater than  5MB*/
                if (file.size / (1024 * 1024) > 5) {
                  setError(true);
                  setErrorMessage(
                    `The file you selected is too large(${(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(
                      2
                    )} MB). Maximum allowed size is 5MB. Please choose a smaller file.`
                  );
                  return (imageInputRef.current.value = null);
                }

                /* list of supported file type */
                const supportedExtensions = [
                  "mp4",
                  "gif",
                  "png",
                  "svg",
                  "jpg",
                  "jpeg",
                ];
                /* return "true" or "false" */
                const fileSupported = supportedExtensions.some((extension) =>
                  file.type.includes(extension)
                );
                /* checking if "fileSupported" is false */
                if (!fileSupported) {
                  setError(true);
                  setErrorMessage(
                    "File type not supported.Please upload a valid file format (like JPG, PNG, SVG, MP4, GIF,)."
                  );
                  return (imageInputRef.current.value = null);
                }

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
            <div className="relative border-[2px] p-2 rounded-md bg-background overflow-auto">
              <div>
                {imageFile && imageFile.type.includes("video") ? (
                  <video
                    src={localImage}
                    controls
                    className="size-full rounded-md"
                  />
                ) : (
                  <img
                    src={localImage}
                    alt="image you uploaded"
                    className="size-full rounded-md"
                  />
                )}
              </div>

              <Button
                variant={"destructive"}
                className="absolute top-[15px] right-[15px] rounded-full p-[2px] cursor-pointer w-[30px] h-[30px]"
                onClick={() => {
                  if (localImage) {
                    URL.revokeObjectURL(localImage);
                    setLocalImage("");
                    setFileType("");
                  }

                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                }}
              >
                <AiOutlineClose />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="imageInput"
              className="flex-1 rounded-lg bg-background cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={GalleryIcon}
                  alt="AddPic Icon"
                  width={35}
                  height={35}
                />
                <p>Add Photo/video</p>
              </div>
            </label>
          )}
          {/* post Button */}
          {postText !== "" || localImage ? (
            <Button
              className={`cursor-pointer font-bold text-[17px] opacity-[0.8] border-none bg-primary ${
                loading ? "pointer-events-none opacity-[0.6]" : ""
              }`}
              onClick={() => handlePost()}
            >
              <div
                className={`w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ${
                  loading ? "block" : "hidden"
                }`}
              ></div>
              Post
            </Button>
          ) : (
            <Button
              variant="outline"
              className={` pointer-events-none font-bold text-[17px] opacity-[0.6] border-none bg-muted text-muted-foreground`}
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
