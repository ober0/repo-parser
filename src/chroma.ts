import {ChromaClient} from "chromadb";

export const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false
})