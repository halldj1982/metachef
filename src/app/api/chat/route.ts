import { Configuration, OpenAIApi, ResponseTypes, ChatCompletionRequestMessageRoleEnum } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from '@/utils/context'
import { Prompts } from './prompts';
import { ScoredPineconeRecord } from '@pinecone-database/pinecone';

interface IngredientsAndMethods {
  ingredients: string,
  methods: string
}
// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, topK, standardPrompt, nationality, protein, cookingMethod, dietConsiderations, flavorBalance} 
      = await req.json();
    
      const {sweet = "", salty = "", sour = "", bitter = "", spice = ""} = flavorBalance || {};

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    console.log("Calling getContext from Chat API route.ts");
    const ingredientContext = await getContext(lastMessage.content, 'ingredients', topK);
    const ingredientContextString = ingredientContext.map(ingredient => ingredient.metadata?.text || "").join(',');
    const instructionContext = await getContext(lastMessage.content, 'instructions', topK);
    const instructionContextString = instructionContext.map(instruction => instruction.metadata?.text || "").join(',');
    //const context = ingredientContext.toString() + instructionContext.toString();
    //console.log(context);
    //console.log("Context is:" + context);
    //const context = "";

    const preferences = `Nationality = ${nationality}
Protein = ${protein}
Cooking method = ${cookingMethod}
Dietary Restrictions = ${dietConsiderations}
                          `
    const flavors = (flavorBalance === null) ? `` : `
Sweetness Level: ${sweet} out of 5
Salt Level: ${salty} out of 5
Sourness Level: ${sour} out of 5
Bitterness Level: ${bitter} out of 5
Spice Level: ${spice} out of 5`

const ingredientMethodList: IngredientsAndMethods = await
  promptForIngredientsAndMethods(messages);
console.log("Ingredient and method object " + JSON.stringify(ingredientMethodList))
const inspiredIngredients = await getContext(ingredientMethodList.ingredients, 'ingredients', topK);
const inspiredIngredientsString = inspiredIngredients.map(ingredient => ingredient.metadata?.text || "").join(',');
//console.log("Inspired Ingredients: " + inspiredIngredientsString);
const inspiredMethods = await getContext(ingredientMethodList.methods, 'instructions', topK);
const inspiredMethodsString = inspiredMethods.map(method => method.metadata?.text || "").join(',');
//console.log("Inspired Methods: " + inspiredMethodsString);

const prompt = (!standardPrompt) ?  [
{
  role: 'system',
  content: Prompts.COT_BLOCK + 
        `START INGREDIENTS BLOCK
${inspiredIngredientsString}
END INGREDIENTS BLOCK
START METHODS BLOCK
${inspiredMethodsString}
END METHODS BLOCK`
  + Prompts.FORMAT_BLOCK
  + Prompts.EXPLAIN_REASONING_BLOCK
                    
                    
  },] 
  : [
      {
        role: 'system',
        content: Prompts.BASE_BLOCK 
                    + Prompts.GENERIC_RECIPE_BLOCK
                    + Prompts.FORMAT_BLOCK
      },
    ]
    /*const prompt = (!standardPrompt) ?  [
      {
        role: 'system',
        content: Prompts.BASE_BLOCK 
                   // + `${context}`
                   + `${ingredientContextString}`
                   + `
                    END OF INGREDIENT CONTEXT BLOCK
START INSTRUCTION CONTEXT BLOCK`
                   + `${instructionContextString}` 
                   + `
                    END OF INSTRUCTION CONTEXT BLOCK
START PREFERENCES BLOCK
${preferences} 
${flavors}
END OF PREFERENCES BLOCK` 
                    //+ Prompts.GENERIC_RECIPE_BLOCK
                    + Prompts.CONTEXT_ONLY_RECIPE_BLOCK
                    //+ Prompts.CONFLICTING_PREFERENCES_BLOCK
                    //+ Prompts.FIND_INGREDIENTS_BLOCK
                    + Prompts.FORMAT_BLOCK
                    + Prompts.EXPLAIN_REASONING_BLOCK
                    
                    
      },
    ] : [
      {
        role: 'system',
        content: Prompts.BASE_BLOCK 
                    + Prompts.GENERIC_RECIPE_BLOCK
                    + Prompts.FORMAT_BLOCK
      },
    ]*/


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

async function promptForIngredientsAndMethods(messages: any): Promise<IngredientsAndMethods> {
  
    const prompt = [{
      role: 'system',
      content: `You are chef trying to create a new recipe for a client. The first step in the process is to take
user input and generate a list of ingredients and methods to be used in the recipe. To do this follow these steps:
1) Create a list of ingredients. Ingredients can include specific ingredients requested by the user, ingredients that are 
typical for a certain style of cooking mentioned by the user, and ingredients that are traditional for any nationalities or 
regions mentioned by the user. This list should be in the format of a single, comma separated string
2) Create a list of methods. Methods can include cooking styles such as frying, braising, or grilling; as examples.
Methods can also involve cooking techniques that are associated with the nationality, region, season, mood, or other qualities
in the user request that may apply. This list should be in the format of a single, comma separated string
The result should be returned as a JSON object. The JSON object created and returned should follow this format: 
        {
          "ingredients": LIST_OF_INGREDIENTS,
          "methods": LIST_OF_METHODS,
        }"`}]
  try {
    //console.log("messages being passed in: " + JSON.stringify(messages[messages.length-1]));
    //console.log("prompt being used: " + JSON.stringify(prompt[0]));
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [...prompt,...messages.filter((message: Message) => message.role === 'user')],
      temperature: 0,
      stream: false,
    })

    
    const data = await result.json();
    //console.log("data before parsing: " + JSON.stringify(data));
    const returnData: IngredientsAndMethods = JSON.parse(data.choices[0].message.content || "");   
    return returnData;
  } catch (error: any) {
    console.error(error)

    return {
      "ingredients": "",
      "methods": ""
    };
  }
}

  async function promptForRecipeTitle(ingredientList: string, methodList: string, messages: any): Promise<string> {
  
    const prompt = [{
      role: ChatCompletionRequestMessageRoleEnum.System,
content: `You are chef trying to create a new recipe for a client. The next step in the process to choose a dish and create a
recipe. To do this, you will follow a three step process:
1) If the user has requested a specific recipe, return only the name of the recipe requested in the user input, without 
using any additional information.
2) If the user has not requested a specific recipe, use the information in the user request combined with with the information
in the INGREDIENTS BLOCK and and METHODS BLOCK below to choose a dish. The dish chosen should be inspired by the ingredients but
should not be one of the dishes already referenced in the INGREDIENTS BLOCK or METHODS BLOCK.
3) Once the dish has been chosen, create a recipe for the dish. If the dish is referenced in the INGREDIENTS BLOCK or METHODS
BLOCK, use the exact ingredients and methods provided in those BLOCKS. If the dish is not referenced in the INGREDIENTS BLOCK
or METHODS BLOCK, create a new recipe for the dish.
START INGREDIENTS BLOCK
${ingredientList}
END INGREDIENTS BLOCK
START METHODS BLOCK
${methodList}
END METHODS BLOCK`}]
  try {
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')],
      temperature: 0,
      stream: false,
    })

    
    const data = await result.json();
    console.log(JSON.stringify(data));
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error(error)

    return "";
  }
}


