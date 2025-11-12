import {Dir, File, GitLabApi} from "./tools/gitlab.api";
import {OpenaiApi} from "./tools/openai.api";
import {ChromaClient} from "chromadb";
import {chroma} from "./tools/chroma";
import {prisma} from "./tools/prisma";
import {Repo} from "../prisma/generated/client";
import {debuglog} from "node:util";

async function main(){
    const gitlabApi = new GitLabApi()

    const repos: Repo[] = await prisma.repo.findMany()
    const reposIds: number[] = repos.map((repo) => repo.gitlabId)

    const allRepos = await gitlabApi.getAllRepos()
    const openai = new OpenaiApi()

    for (let el of allRepos) {
        if (reposIds.includes(el.id)) {
            continue;
        }
        console.log(`Обрабатывается репа: ${el.id}`)

        const fullRepo = await gitlabApi.getRepo(el.id)

        const files: File[] = []
        const traverse = (dir: Dir) => {
            for (const child of dir.children) {
                if (child.type === 'file') {
                    if (child.content.length > 10000) {
                        const length = child.content.length;
                        const batches = length % 10000 + 1

                        for (let i = 0; i < batches; i++) {
                            files.push({
                                ...child,
                                content: child.content.slice(batches*10000,(batches+1) * 10000),
                            })
                        }
                    }
                    else {
                        files.push(child)
                    }

                } else if (child.type === 'dir') {
                    traverse(child)
                }
            }
        }
        traverse(fullRepo)

        const collection = await chroma.getOrCreateCollection({
            name: `repo-${el.id}`
        })

        console.log(`Получена коллекция хрома`)
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
        console.log('Репозиторий сохранен в chroma')

        console.log(el)
        const {id, description, name, web_url, created_at, last_activity_at} = el
        await prisma.repo.create({
            data: {
                gitlabId: id,
                description,
                name,
                url: web_url,
                createdAt: new Date(created_at),
                lastActivity: new Date(last_activity_at),
                chromaUpdatedAt: new Date()
            }
        })

        console.log("Репозиторий сохранен в бд")

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