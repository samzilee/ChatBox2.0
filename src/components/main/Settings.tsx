import { useSidebar } from "../ui/sidebar";

const Settings = ({ settingsActive, setSettingsActive }: any) => {
  const { setOpen } = useSidebar();

  return (
    <div
      className={` ${
        settingsActive ? "block" : "hidden"
      } fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50`}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-500/60 flex justify-center items-center`}
        onClick={() => {
          setSettingsActive(false);
          setOpen(true);
          const body = document.body;
          body.style.overflow = "auto";
        }}
      ></div>

      <div className="fixed bg-card text-card-foreground w-[95%] h-[90%] md:w-[500px] md:h-[96%] rounded-lg"></div>
    </div>
  );
};

export default Settings;
