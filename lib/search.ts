
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
// import { SupabaseHybridSearch } from "langchain/retrievers/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';


// const jsonFilePath = path.resolve(__dirname, '../data/scheme_data.json');
const jsonFilePath = path.resolve(__dirname, '../data/rice_data.json');
const data = JSON.parse(fs.readFileSync(jsonFilePath, { encoding: 'utf-8' }));

let pageContent: string[] = [];
let metadata: object[] = [];

for (let item of data) {
  pageContent.push(item.pageContent); // Save the 'pageContent' of the current object
  metadata.push(item.metadata); // Save the 'metadata' of the current object
}

// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

export async function search(query: string)  {
  
    try {
    
    const privateKey = process.env.SUPABASE_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);

    const client = createClient(url, privateKey);

    // const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    const vectorStore = await SupabaseVectorStore.fromTexts(
      pageContent,
      metadata,
      // ['Hello world', 'Bye bye', "What's this?"],
      // [{ id: 2 }, { id: 1 }, { id: 3 }],
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    // const resultOne = await vectorStore.similaritySearch(query, 1);

    // const retriever = new SupabaseHybridSearch(embeddings, {
    //   client,
    //   //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
    //   similarityK: 2,
    //   keywordK: 2,
    //   tableName: "documents",
    //   similarityQueryName: "match_documents",
    //   keywordQueryName: "kw_match_documents",
    // });
    
    // const resultOne = await retriever.getRelevantDocuments(query);
    const resultOne = await vectorStore.similaritySearch(query, 3);
    // const resultOne = await retriever.keywordSearch(query, 10);

    // console.log(resultOne)
    
    const search_response = {
        name: resultOne[0].metadata.scheme_name,
        // benefits: resultOne[0].metadata.benefits,
        link: resultOne[0].metadata.url,
        pageContent: resultOne[0].pageContent
    }

    return search_response;
  } catch (error) {
    console.error(error);
    
  }
};