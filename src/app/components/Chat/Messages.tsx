import { Message } from "ai/react";
import { useRef } from "react";

export default function Messages({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  //console.log("Messages in Messages.tsx: " + JSON.stringify(messages));
  return (
    <div className="border-2 border-gray-600 p-6 rounded-lg overflow-y-scroll flex-grow flex flex-col justify-end bg-gray-700">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${
            msg.role === "assistant" ? "text-green-300" : "text-blue-300"
          } my-2 p-3 rounded shadow-md hover:shadow-lg transition-shadow duration-200 flex slide-in-bottom bg-gray-800 border border-gray-600 message-glow`}
        >
          <div className="rounded-tl-lg bg-gray-800 p-2 border-r border-gray-600 flex items-center">
            {msg.role === "assistant" ? "🤖" : "🧑‍💻"}
          </div>
          <pre className="ml-2 flex items-center text-gray-200 whitespace-pre-wrap block text-xs">
            {msg.content}
          </pre>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
