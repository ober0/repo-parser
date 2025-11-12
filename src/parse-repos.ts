import {Dir, File, GitLabApi} from "./tools/gitlab.api";
import {OpenaiApi} from "./tools/openai.api";
import {ChromaClient} from "chromadb";
import {chroma} from "./chroma";

async function main(){
    const gitlabApi = new GitLabApi()

    // TODO получить из бд список спаршеных реп

    const allRepos = await gitlabApi.getAllRepos()
    const openai = new OpenaiApi()


    for (let el of allRepos) {
        console.log(`Обрабатывается репа: ${el.id}`)

        const fullRepo = await gitlabApi.getRepo(el.id)

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
        traverse(fullRepo)

        const collection = await chroma.getOrCreateCollection({
            name: `repo-${el.id}`
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

            // TODO записать в бд спаршенную репу

            console.log(`Добавлен: ${file.name}`)
        }
    }

    // const query = '{ "PRIVATE-TOKEN": token }'
    // const queryEmbedding = await openai.createEmbedding(query)
    //
    // const results = await collection.query({
    //     queryEmbeddings: [queryEmbedding],
    //     nResults: 3
    // })
    //
    // console.log('Похожие результаты:')
    // for (const [i, doc] of results.documents[0].entries()) {
    //     console.log('---')
    //     console.log('Путь:', results.metadatas[0][i]?.path)
    //     console.log('Фрагмент:', doc?.slice(0, 200), '...')
    // }
    //
    // await openai.createEmbedding(files[0].content)
}


main()