import OpenAI from 'openai'
import 'dotenv/config'
import {AiResponse, PromptType} from "../types/openai/types";

export class OpenaiApi {
    private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    async createEmbedding(text: string): Promise<number[]> {
        const res = await this.client.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        })
        return res.data[0].embedding
    }

    async sendAiRequest<T>(prompt: PromptType[]): Promise<T> {
        let aiResponse;

        try {
            aiResponse = await this.client.chat.completions.create({
                model: 'gpt-5-mini',
                messages: prompt,
                response_format: {type: 'json_object'},
                stream: false,
                temperature: 0
            })

        }
        catch (error) {
            console.error(error)
            throw new Error(`Ошибка ChatGPT: ${error}`)
        }

        const serviceResponse = aiResponse.choices[0].message.content

        if (!serviceResponse) {
            throw new Error('Ошибка при обработке запроса')
        }

        return serviceResponse as unknown as T

    }
}
