import {Dir, File, GitLabApi} from "./tools/gitlab.api";
import {OpenaiApi} from "./tools/openai.api";
import {ChromaClient} from "chromadb";

import './chroma'
import './parse-repos'

async function main(){
    const gitlabApi = new GitLabApi()

    const repo = await gitlabApi.getRepo(38)


    const files: File[] = []
    const traverse = (dir: Dir) => {
        for (const child of dir.children) {
            if (child.type === 'file') {
                if (child.content.length > 50000) {
                    const length = child.content.length;
                    const batches = length % 50000 + 1

                    for (let i = 0; i < batches; i++) {

                    }
                }
                files.push(child)
            } else if (child.type === 'dir') {
                traverse(child)
            }
        }
    }
    traverse(repo)

    const openai = new OpenaiApi()
    const chroma = new ChromaClient({
        host: "localhost",
        port: 8000,
        ssl: false
    })

    const collection = await chroma.getOrCreateCollection({
        name: 'office'
    })

    console.log(`Файлов найдено: ${files.length}`)

    for (const file of files) {
        const embedding = await openai.createEmbedding(file.content)

        await collection.add({
            ids: [file.name],
            embeddings: [embedding],
            metadatas: [{ path: file.name }],
            documents: [file.content]
        })

        console.log(`Добавлен: ${file.name}`)
    }


    const query = '{ "PRIVATE-TOKEN": token }'
    const queryEmbedding = await openai.createEmbedding(query)

    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 3
    })

    console.log('Похожие результаты:')
    for (const [i, doc] of results.documents[0].entries()) {
        console.log('---')
        console.log('Путь:', results.metadatas[0][i]?.path)
        console.log('Фрагмент:', doc?.slice(0, 200), '...')
    }

    await openai.createEmbedding(files[0].content)
}


main()