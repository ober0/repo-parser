import OpenAI from 'openai'
import 'dotenv/config'
import {AiResponse, PromptType} from "../types/openai/types";

export class OpenaiApi {
    private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    private readonly openRouterClient = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: process.env.OPENROUTER_API_KEY })

    async createEmbedding(text: string): Promise<number[]> {
        const res = await this.client.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        })
        return res.data[0].embedding
    }

    // async sendAiRequest<T>(prompt: PromptType[]): Promise<T> {
    //     let aiResponse;
    //
    //     try {
    //         aiResponse = await this.client.chat.completions.create({
    //             model: 'gpt-4o-mini',
    //             messages: prompt,
    //             response_format: {type: 'json_object'},
    //             stream: false,
    //             temperature: 0
    //         })
    //
    //     }
    //     catch (error) {
    //         console.error(error)
    //         throw new Error(`Ошибка ChatGPT: ${error}`)
    //     }
    //
    //     const serviceResponse = aiResponse.choices[0].message.content
    //
    //     if (!serviceResponse) {
    //         throw new Error('Ошибка при обработке запроса')
    //     }
    //
    //     return serviceResponse as unknown as T
    //
    // }

    async sendAiRequest<T>(prompt: PromptType[]): Promise<T> {
        let aiResponse;

        try {
            aiResponse = await this.openRouterClient.chat.completions.create({
                model: 'tngtech/deepseek-r1t-chimera:free',
                messages: prompt,
                response_format: {type: 'json_object'},
                stream: false
            })

        }
        catch (error) {
            console.error(error)
            throw new Error(`Ошибка Deepseek: ${error}`)
        }

        const serviceResponse = aiResponse.choices[0].message.content

        if (!serviceResponse) {
            throw new Error('Ошибка при обработке запроса')
        }

        return serviceResponse as unknown as T

    }
}
