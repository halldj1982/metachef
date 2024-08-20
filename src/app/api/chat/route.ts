import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from '@/utils/context'
import { Prompts } from './prompts';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, topK, standardPrompt } = await req.json()

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    const context = await getContext(lastMessage.content, '', topK)
    //console.log("Context is:" + context);
    //const context = "";


    const prompt = (!standardPrompt) ?  [
      {
        role: 'system',
        content: Prompts.BASE_BLOCK 
                    + `${context}` 
                    //+ Prompts.GENERIC_RECIPE_BLOCK
                    + Prompts.CONTEXT_ONLY_RECIPE_BLOCK
                    + Prompts.FIND_INGREDIENTS_BLOCK
                    + Prompts.FORMAT_BLOCK
      },
    ] : [
      {
        role: 'system',
        content: Prompts.BASE_BLOCK 
                    + Prompts.GENERIC_RECIPE_BLOCK
                    + Prompts.FORMAT_BLOCK
      },
    ]


    //console.log(prompt[0].content);

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      top_p: .01,
      temperature: 0,
      stream: true,
      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
    })
    //console.log(response);
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (e) {
  console.log(e)
    throw (e)
  }
}