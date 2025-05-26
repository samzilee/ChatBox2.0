import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

const Alert = ({ message, setActive }: any) => {
  return (
    <main
      className={` fixed top-0 bottom-0 left-0 right-0 z-[10000] flex justify-center items-center `}
    >
      {/* BackGround  */}
      <div
        className={`fixed border top-0 bottom-0 right-0 left-0 bg-gray-500/60 flex justify-center items-center z-[-1]`}
        onClick={() => {
          setActive(false);
          const body = document.body;
          body.style.overflow = "auto";
        }}
      ></div>

      <div className="bg-card text-card-foreground w-[95%] md:w-[450px] h-[190px] rounded-lg flex flex-col overflow-hidden">
        <label className="w-full bg-background p-2">Alert</label>
        <main className="flex-1 flex p-5 gap-2">
          <AlertCircle color="red" size={40} />
          <p className="text-sm">{message}</p>
        </main>
        <footer className="flex justify-end px-5 pb-3">
          <Button
            variant="outline"
            className="cursor-pointer"
            size={"sm"}
            onClick={() => setActive(false)}
          >
            OK
          </Button>
        </footer>
      </div>
    </main>
  );
};

export default Alert;
