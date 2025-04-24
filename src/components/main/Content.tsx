import { useState } from "react";
import defaultProfile from "../../Assets/defaultProfile.png";
import GalleryIcon from "../../Assets/GalleryIcon.png";
import PostBlock from "./contentComponents/PostBlock";

import image1 from "../../AssetsTest/image1.jpg";
import image2 from "../../AssetsTest/image2.jpg";
import image3 from "../../AssetsTest/image3.jpg";
import image4 from "../../AssetsTest/image4.jpg";
import image5 from "../../AssetsTest/image5.jpg";

const Content = () => {
  const [postMode, setPostMode] = useState<boolean>(false);

  const posts = [
    {
      user: {
        userName: "",
        userProfile: "",
        userId: "",
      },
      post: {
        text: "",
        imageURL: "",
      },
      date: {},
      comments: [],
      likes: [],
    },
  ];

  return (
    <main className="w-full h-full px-1 bg-gray-200">
      {/* Post Input */}
      <div className="w-full rounded-md p-2 mt-5 bg-white flex items-center gap-2">
        <div className="w-[43px] cursor-pointer rounded-full">
          <img
            src={defaultProfile}
            alt="profile Picture"
            className="size-full"
          />
        </div>

        <button
          className="bg-gray-200 px-3 py-2 rounded-full flex-1 text-start cursor-pointer hover:bg-gray-300"
          onClick={() => setPostMode(postMode ? false : true)}
        >
          <p>What's on your mind?</p>
        </button>

        <button
          className="flex items-center cursor-pointer"
          onClick={() => setPostMode(postMode ? false : true)}
        >
          <img src={GalleryIcon} alt="Gallery Icon" width={25} height={25} />
          <p className="font-semibold">Photo</p>
        </button>
      </div>

      {/* outlet for post Input */}
      <PostBlock postMode={postMode} setPostMode={setPostMode} />

      {/* Posts */}
    </main>
  );
};

export default Content;
