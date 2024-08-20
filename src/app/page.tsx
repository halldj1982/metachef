// page.tsx

"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";
import InstructionModal from "./components/InstructionModal";
import { AiFillGithub, AiOutlineInfoCircle } from "react-icons/ai";

const Page: React.FC = () => {
  const [gotMessages1, setGotMessages1] = useState(false);
  const [context1, setContext1] = useState<string[] | null>(null);
  const [gotMessages2, setGotMessages2] = useState(false);
  const [context2, setContext2] = useState<string[] | null>(null);
  const [topK, setTopK] = useState(3);
  const [isModalOpen, setModalOpen] = useState(false);

  const { messages: messages1, input: input1, handleInputChange: handleInputChange1, handleSubmit: handleSubmit1 } = useChat({
    body: {
      topK: topK,
      standardPrompt: true
    },
    onFinish: async () => {
      setGotMessages1(true);
    },
  });

  const { messages: messages2, input: input2, handleInputChange: handleInputChange2, handleSubmit: handleSubmit2 } = useChat({
    body: {
      topK: topK,
      standardPrompt: false
    },
    onFinish: async () => {
      setGotMessages2(true);
    },
  });

  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-white p-2 font-bold">
      {children}
    </label>
  );

  const prevMessagesLengthRef1 = useRef(messages1.length);
  const prevMessagesLengthRef2 = useRef(messages2.length);

  const handleMessageSubmit1 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit1(e);
    setContext1(null);
    setGotMessages1(false);
  };

  const handleMessageSubmit2 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit2(e);
    setContext2(null);
    setGotMessages2(false);
  };

  useEffect(() => {
    prevMessagesLengthRef1.current = messages1.length;
  }, [messages1, gotMessages1]);

  useEffect(() => {
    const getContext2 = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages: messages2,
          topK: topK
        }),
      });
      const { context } = await response.json();
      setContext2(context.map((c: any) => c.id));
    };
    if (gotMessages2 && messages2.length >= prevMessagesLengthRef2.current) {
      getContext2();
    }

    prevMessagesLengthRef2.current = messages2.length;
  }, [messages2, gotMessages2]);

  return (
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <div className="flex flex-grow relative overflow-hidden">
      <Chat
          input={input1}
          handleInputChange={handleInputChange1}
          handleMessageSubmit={handleMessageSubmit1}
          messages={messages1}
          topK={topK}
          promptType="Basic Prompt"
        />
        <Chat
          input={input2}
          handleInputChange={handleInputChange2}
          handleMessageSubmit={handleMessageSubmit2}
          messages={messages2}
          topK={topK}
          promptType="RAG with Prompt Engineering"
        />
        
        <div className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-gray-700 overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5 lg:mx-2 rounded-lg">
          <Context className="" selected={context2} />
          <div className="flex p-2"></div>
          <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="topK">
                  topK: {topK}
                  </DropdownLabel>
                
                <input
                  className="p-2 bg-gray-700"
                  type="range"
                  id="topK"
                  min={1}
                  max={200}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                />

        </div>
        </div>
        <button
          type="button"
          className="absolute left-20 transform -translate-x-12 bg-gray-800 text-white rounded-l py-2 px-4 lg:hidden"
          onClick={(e) => {
            e.currentTarget.parentElement
              ?.querySelector(".transform")
              ?.classList.toggle("translate-x-full");
          }}
        >
          ☰
        </button>
      </div>
    </div>
  );
};

export default Page;
