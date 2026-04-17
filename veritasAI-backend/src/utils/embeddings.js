import { pipeline } from "@xenova/transformers";

let extractor;

export const getEmbedding = async (text) => {
  if (!text || typeof text !== "string") return [];

  try {
    if (!extractor) {
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
    }

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  } catch (error) {
    console.error("Embedding error:", error.message);
    return [];
  }
};
