import { Pinecone } from "@pinecone-database/pinecone";

let pinecone;

export const getIndex = () => {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set in environment variables");
  }
  if (!process.env.PINECONE_INDEX) {
    throw new Error("PINECONE_INDEX is not set in environment variables");
  }

  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pinecone.index(process.env.PINECONE_INDEX);
};
