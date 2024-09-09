// page.tsx

"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";
import InstructionModal from "./components/InstructionModal";
import { AiFillGithub, AiOutlineInfoCircle } from "react-icons/ai";
import Preferences from "./components/Preferences";
import {Tabs, Tab} from "@nextui-org/tabs";

const Page: React.FC = () => {
  const [gotMessages1, setGotMessages1] = useState(false);
  const [gotMessages2, setGotMessages2] = useState(false);
  const [context, setContext] = useState<string[]>([]);
  const [topK, setTopK] = useState(3);
  const [nationality, setNationality] = useState("Any");
  const [protein, setProtein] = useState("Any");
  const [cookingMethod, setCookingMethod] = useState("Any");
  const [dietConsiderations, setDietConsiderations] = useState<string[]>([]);
  const [flavors, setFlavors] = useState({
    sweet: 3,
    salty: 3,
    sour: 3,
    bitter: 3,
    spice: 3,
  });
  const [showFlavorSliders, setShowFlavorSliders] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);

  const { messages: messages1, input: input1, handleInputChange: handleInputChange1, handleSubmit: handleSubmit1 } = useChat({
    body: {
      topK: topK,
      standardPrompt: true,
      nationality: "Any",
      protein: "Any",
      cookingMethod: "Any",
      dietConsiderations: "None",
      flavorBalance: null
    },
    onFinish: async () => {
      setGotMessages1(true);
    },
  });

  const { messages: messages2, input: input2, handleInputChange: handleInputChange2, handleSubmit: handleSubmit2 } = useChat({
    body: {
      topK: topK,
      standardPrompt: false,
      nationality: nationality,
      protein: protein,
      cookingMethod: cookingMethod,
      dietConsiderations: dietConsiderations.join(", "),
      flavorBalance: showFlavorSliders ? flavors: null
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
    setGotMessages1(false);
  };

  const handleMessageSubmit2 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit2(e);
    setContext([]);
    setGotMessages2(false);
  };

  const handleFlavorChange = (flavor: string, value: number) => {
    setFlavors((prevFlavors) => ({
      ...prevFlavors,
      [flavor]: value,
    }));
  };

  useEffect(() => {
    prevMessagesLengthRef1.current = messages1.length;
  }, [messages1, gotMessages1]);

  useEffect(() => {
    const getContext = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages: messages2,
          topK: topK
        }),
      });
      const { context } = await response.json();
      setContext(context.map((c: any) => c.id));
    };
    if (gotMessages2 && messages2.length >= prevMessagesLengthRef2.current) {
      getContext();
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
        <div className="flex w-full flex-col text-white">
            <Tabs aria-label="Options" 
              variant = "bordered">
                
              <Tab key="preferences" title="Preferences">
                <Preferences
                    nationality={nationality}
                    setNationality={setNationality}
                    protein={protein}
                    setProtein={setProtein}
                    cookingMethod={cookingMethod}
                    setCookingMethod={setCookingMethod}
                    dietConsiderations={dietConsiderations}
                    setDietConsiderations={setDietConsiderations}
                    flavors={flavors}
                    setFlavors={handleFlavorChange}
                    showFlavorSliders={showFlavorSliders}
                    setShowFlavorSliders={setShowFlavorSliders}
                  />
              </Tab>
              <Tab key="context" title="Context">
                <Context className="" selected={context}/>               
              </Tab>
            
            </Tabs>
          </div>  
          <div className="flex p-2"></div>
          
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
