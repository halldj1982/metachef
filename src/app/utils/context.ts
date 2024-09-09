import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { getMatchesFromEmbeddings } from "./pinecone";
import { getEmbeddings } from './embeddings'

export type Metadata = {
  url: string,
  text: string,
  chunk: string,
}

// The function `getContext` is used to retrieve the context of a given message
export const getContext = async (message: string, namespace: string, topK = 3, maxTokens = 3000, getOnlyText = true,
   minScore = 0.1, ): Promise<ScoredPineconeRecord[]> => {

  // Get the embeddings of the input message
  //console.log("Getting embeddings");
  const embedding = await getEmbeddings(message);
  
  //console.log("Embeddings retrieved: " + embedding);

  // Retrieve the matches for the embeddings from the specified namespace
  //console.log("Getting matches from Pinecone");
  const matches = await getMatchesFromEmbeddings(embedding, topK, namespace);
  
  // Filter out the matches that have a score lower than the minimum score
  const qualifyingDocs = matches.filter(m => m.score && m.score > minScore);
  console.log("Matches after filtering with a minScore of " + minScore)
  qualifyingDocs?.forEach(match => {
    console.log("Title: " + match.metadata?.title ?? "");
    console.log("Chunk: " + match.metadata?.chunk ?? "")
    console.log("Score: " + match.score)
    console.log("");
  })

  
   
    return qualifyingDocs
}
