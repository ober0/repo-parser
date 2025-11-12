import {OpenaiApi} from "./tools/openai.api";
import {AiSchema, AiSystemPrompt} from "./types/openai/prompt";
import {AiResponse, PromptType} from "./types/openai/types";
import {PayloadPushType} from "./types/payload";

export async function processingCommit(diff: {
    path: {
        old: string,
        new: string,
    },
    newFile: boolean,
    data: string,
}[], hook: PayloadPushType): Promise<void> {
    const openai = new OpenaiApi()


    // TODO получить контекст


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
            content: `Коммит для анализа: ${JSON.stringify(diff)}`,
        }
    ]


    let aiResponse: AiResponse
    try{
        aiResponse = await openai.sendAiRequest<AiResponse>(prompt)
    }catch(err){
        console.error(err)
    }

    // TODO: сохранить обработанный комит




}