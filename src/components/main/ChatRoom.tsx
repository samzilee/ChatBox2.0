import { SendHorizonalIcon } from "lucide-react";
import { useRef } from "react";

const ChatRoom = () => {
  const textareaRef = useRef(null);

  const handleInput = () => {
    const textarea: any = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  return (
    <main className="h-full w-full bg-background text-foreground text-center flex flex-col py-5">
      <section className="flex-1 border "></section>

      <section className="border-t-[1.6px] border-t-border p-2">
        <div className="bg-input p-2 rounded-lg flex gap-1">
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            placeholder="Write a comment..."
            className="outline-none flex-1 resize-none overflow-hidden"
          />
          <button className="size-fit cursor-pointer">
            <SendHorizonalIcon />
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChatRoom;
