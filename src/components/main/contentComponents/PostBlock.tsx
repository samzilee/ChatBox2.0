import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import defaultProfile from "../../../Assets/defaultProfile.png";
import GalleryIcon from "../../../Assets/GalleryIcon.png";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { dataToBePostType } from "@/utils/utils";

type PostBlockProps = {
  postMode: boolean;
  setPostMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const PostBlock: React.FC<PostBlockProps> = ({ postMode, setPostMode }) => {
  const { setOpen } = useSidebar();
  const [postText, setPostText] = useState<string>("");
  const [Image, setImage] = useState<any>(null);
  const [dataToBePost, setDataToBePost] = useState<dataToBePostType>(undefined);
  const textareaRef = useRef<any>(null);
  const imageInputRef = useRef<any>(null);

  useEffect(() => {
    console.log(dataToBePost);
  }, [dataToBePost]);

  useEffect(() => {
    if (postMode) {
      setOpen(false);
    }
  }, [postMode]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
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

      {/* Main Block */}
      <div className="fixed bg-white w-[95%] h-[90%] md:w-[500px] md:h-[96%] rounded-lg flex flex-col ">
        {/* Main Block Header */}
        <header className="flex items-center px-2 py-3 gap-2 border-b-[1.5px] ">
          <p className="flex-1 text-center text-[20px]">Create Post</p>
          <div
            className=" font-extrabold  bg-gray-300 p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => setPostMode(false)}
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
                src={defaultProfile}
                alt="Profile Picture"
                width={45}
                height={45}
              />
              <p>Salihu Abubakar</p>
            </div>

            <textarea
              ref={textareaRef}
              onInput={handleInput}
              className="w-full resize-none overflow-hidden p-2 outline-none font-normal"
              placeholder="What's on your mind?"
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

                if (file) {
                  const url = URL.createObjectURL(file);
                  setImage((prev: string) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                  });
                }
              }
            }}
          />
          {Image ? (
            <div className=" relative border-[2px] p-2 rounded-md bg-gray-200 overflow-auto ">
              <div>
                <img
                  src={Image}
                  alt="image you uploaded"
                  className="size-full rounded-md"
                />
              </div>

              <button
                className="absolute top-[15px] right-[15px] bg-gray-200 rounded-full p-[2px] cursor-pointer"
                onClick={() => {
                  if (Image) {
                    URL.revokeObjectURL(Image);
                    setImage("");
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
          {postText !== "" || Image ? (
            <Button
              className={`cursor-pointer font-bold text-[17px] opacity-[0.6] border-none`}
              onClick={() =>
                setDataToBePost({ text: postText, image: Image || "" })
              }
            >
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
