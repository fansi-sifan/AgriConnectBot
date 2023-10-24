
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
// import { SupabaseHybridSearch } from "langchain/retrievers/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { createClient } from "@supabase/supabase-js";
// import fs from 'fs';
// import path from 'path';


// const jsonFilePath = path.resolve(__dirname, '../data/scheme_data.json');
// // const jsonFilePath = path.resolve(__dirname, '../data/rice_data.json');
// const data = JSON.parse(fs.readFileSync(jsonFilePath, { encoding: 'utf-8' }));

// let pageContent: string[] = [];
// let metadata: object[] = [];

// for (let item of data) {
//   pageContent.push(item.pageContent); // Save the 'pageContent' of the current object
//   metadata.push(item.metadata); // Save the 'metadata' of the current object
// }

// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

export async function search(query: string)  {
  
    try {
    
    const privateKey = process.env.SUPABASE_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);

    const client = createClient(url, privateKey);

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    // const vectorStore = await SupabaseVectorStore.fromTexts(
    //   pageContent,
    //   metadata,
      // ['Hello world', 'Bye bye', "What's this?"],
      // [{ id: 2 }, { id: 1 }, { id: 3 }],
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        // queryName: "match_documents",
        queryName: "match_schemes",
      }
    );

    // const retriever = new SupabaseHybridSearch(embeddings, {
    //   client,
    //   //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
    //   similarityK: 2,
    //   keywordK: 2,
    //   tableName: "documents",
    //   similarityQueryName: "match_documents",
    //   keywordQueryName: "kw_match_documents",
    // });
    
   
    const retriever = ScoreThresholdRetriever.fromVectorStore(vectorStore, {
      minSimilarityScore: 0.8, // Finds results with at least this similarity score
      maxK: 10, // The maximum K value to use. Use it based to your chunk size to make sure you don't run out of tokens
      kIncrement: 2, // How much to increase K by each time. It'll fetch N results, then N + kIncrement, then N + kIncrement * 2, etc.
    });

    const resultOne = await retriever.getRelevantDocuments(query);


    // const resultOne = await vectorStore.maxMarginalRelevanceSearch(query,{ k: 5 });
    
    const search_response = resultOne.map(item => {
      return {
        name: item.metadata.scheme_name,
        link: item.metadata.url,
        pageContent: item.pageContent
      };
    });

    console.log(search_response)

    return search_response;
  } catch (error) {
    console.error(error);
    
  }
};