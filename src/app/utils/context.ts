import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { getMatchesFromEmbeddings } from "./pinecone";
import { getEmbeddings } from './embeddings'

export type Metadata = {
  url: string,
  text: string,
  chunk: string,
}

// The function `getContext` is used to retrieve the context of a given message
export const getContext = async (message: string, namespace: string, topK = 3, maxTokens = 3000, getOnlyText = true, minScore = 0.7, ): Promise<string | ScoredPineconeRecord[]> => {

  // Get the embeddings of the input message
  //console.log("Getting embeddings");
  const embedding = await getEmbeddings(message);
  //console.log("Embeddings retrieved: " + embedding);

  // Retrieve the matches for the embeddings from the specified namespace
  //console.log("Getting matches from Pinecone");
  const matches = await getMatchesFromEmbeddings(embedding, topK, namespace);
  //console.log("Matches: " + matches);
  
  // Filter out the matches that have a score lower than the minimum score
  const qualifyingDocs = matches.filter(m => m.score && m.score > minScore);

  if (!getOnlyText) {
    // Use a map to deduplicate matches by URL
    return qualifyingDocs
  }

  let docs = matches ? qualifyingDocs.map(match => (match.metadata as Metadata).chunk) : [];
  // Join all the chunks of text together, truncate to the maximum number of tokens, and return the result
  return docs.join("\n").substring(0, maxTokens)
}
