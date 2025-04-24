import webIcon from "../../Assets/websiteIcon.png";
import { useSidebar } from "../ui/sidebar";
import { AiOutlineMenu } from "react-icons/ai";
import defaultProfile from "../../Assets/defaultProfile.png";

const Header = () => {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  return (
    <header className="border-b border-gray-200 flex justify-between items-center p-2 h-[58px]">
      {/* Left Side of the header */}
      <div className="flex items-center gap-2 ">
        <div className=" p-1 hover:bg-gray-100">
          <AiOutlineMenu
            onClick={
              isMobile
                ? () => setOpenMobile(openMobile ? false : true)
                : () => setOpen(open ? false : true)
            }
            className="w-[24px] h-[24px]"
          />
        </div>
        <img
          src={webIcon}
          alt="Website Icon"
          width={120}
          className={`${open && !isMobile ? "hidden" : "block"}`}
        />
      </div>

      {/* Right side of the header */}
      <div className="w-[35px] cursor-pointer rounded-full">
        <img
          src={defaultProfile}
          alt="defaultProfile"
          className="size-full rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;
