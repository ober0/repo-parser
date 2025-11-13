import {OpenaiApi} from "./tools/openai.api";
import {AiSchema, AiSystemPrompt} from "./types/openai/prompt";
import {AiResponse, PromptType} from "./types/openai/types";
import {PayloadPushType} from "./types/payload";
import {chroma} from "./tools/chroma";
import {prisma} from "./tools/prisma";
import { v4 as uuidv4 } from 'uuid'
import {debuglog} from "node:util";


export async function processingCommit(diff: {
    path: {
        old: string,
        new: string,
    },
    newFile: boolean,
    deletedFile: boolean,
    data: string,
}[][], hook: PayloadPushType): Promise<void> {
    const openai = new OpenaiApi()

    const collection = await chroma.getOrCreateCollection({
        name: `repo-${hook.project.id}`
    })

    const filesContent: {path: string, data: string}[][][] = []
    for (let commit of diff) {
        const data = await Promise.all(
            commit.map(async (file) => {
                const vectors = await openai.createEmbedding(file.data)

                const results = await collection.query({
                    queryEmbeddings: [vectors],
                    nResults: 3
                })

                const result: {
                    path: string,
                    data: string
                }[] = []


                for (const [i, doc] of results.documents[0].entries()) {
                    result.push({
                        path: results.metadatas[0][i]?.path as string ?? '',
                        data: doc as string ?? ''
                    })
                }

                return result
            })
        )
        filesContent.push(data)
    }

    console.log(`Получен контекст для коммитов ${hook.commits.map(el => el.id)}`)

    const context = filesContent.flat(2)
    const analyseContent = diff.flat(1)

    const prompt: PromptType[] = [
        {
            role: 'system',
            content: JSON.stringify({
                prompt: AiSystemPrompt,
                schema: AiSchema
            }),
        },
        {
            role: 'user',
            content: `История (контекст): ${JSON.stringify(context)}`,
        },
        {
            role: 'user',
            content: `Код для анализа: ${JSON.stringify(analyseContent)}`,
        }
    ]


    console.log(`Промпт сгенерирован. Символов ${JSON.stringify(prompt).length}`)

    let aiResponse: AiResponse
    // try{
    //     aiResponse = await openai.sendAiRequest<AiResponse>(prompt)
    // }catch(err){
    //     console.error(`Ошибка при запросе в ИИ: ${err}`)
    //     return
    // }

    aiResponse = {
        minutes: 5,
        rating: 10,
        review: 'Hello'
    }

    console.log(`Успешно получен ответ от ИИ. Символов:  ${JSON.stringify(aiResponse).length}`)

    const processingEntity = await prisma.processing.create({
        data: {
            minutes: aiResponse.minutes ?? 0,
            rating: aiResponse.rating ?? 5,
            review: aiResponse.review ?? 'Отсутствует ревью'
        }
    })

    console.log(JSON.stringify(hook.commits, null, 2))

    await Promise.all(
        hook.commits.map(async (commit) => {
            await prisma.commit.create({
                data: {
                    gitlabId: commit.id,
                    url: commit.url,
                    message: commit.message,
                    title: commit.title,
                    createdAt: new Date(Number(commit.timestamp)),
                    authorName: commit.author.name,
                    authorEmail: commit.author.email,
                    added: commit.added,
                    modified: commit.modified,
                    removed: commit.removed,
                    processing: {
                        connect: {
                            id: processingEntity.id
                        }
                    }
                }
            })
        })
    )

    for (const el of diff.flat()) {
        const name = el.path.new
            ? el.path.new.split('/').pop() as string
            : `no-found-name-${uuidv4()}`

        const filePath = el.path.new || el.path.old

        try {
            await collection.delete({ ids: [name] }).catch(() => null)

            console.log(`${process.env.GITLAB_URL}/projects/${hook.project.id}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${hook.after}`)

            const fileRes = await fetch(
                `${process.env.GITLAB_URL}/projects/${hook.project.id}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`,
                { headers: { "PRIVATE-TOKEN": process.env.GITLAB_TOKEN! } }
            )

            if (!fileRes.ok) {
                console.error(`Не удалось загрузить файл ${filePath}: ${fileRes.statusText}`)
                continue
            }

            const fileContent = await fileRes.text()

            const embedding = await openai.createEmbedding(fileContent)

            await collection.add({
                ids: [name],
                embeddings: [embedding],
                metadatas: [{ path: filePath }],
                documents: [fileContent],
            })

            console.log(`Файл ${filePath} обновлён в хроме`)
        } catch (err) {
            console.error(`Ошибка при обработке ${filePath}:`, err)
        }
    }


}