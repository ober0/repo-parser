import './tools/chroma'
import './parse-repos' // если репы парсить не надо - закоментить
import './app'

import {hooks} from "./commit-hooks";

// мок вызов хука на пуш
async function main(){
    await hooks({
        object_kind: 'push',
        event_name: 'push',
        before: 'string',
        after: 'string',
        ref: 'refs/head/main',
        checkout_sha: 'string',
        message: 'test 123',
        user_id: 3,
        user_username: '123',
        project: {
            id: 49,
            name: "test-hooks",
            web_url: "https://git.jsonb.ru/ober0/test-hooks",
            default_branch: "main"
        },
        commits: [{
            id: 'eb37407d44148b876e19c69052ae3e0ac6e86c5d',
            message: 'merge',
            title: 'merge',
            timestamp: Date.now().toString(),
            url: 'https://git.jsonb.ru/ober0/test-hooks/-/commit/eb37407d44148b876e19c69052ae3e0ac6e86c5d',
            author: {
                name: '123',
                email: '123'
            },
            added: ['test.ts'],
            modified: [],
            removed: [],
        }]
    })
}


main()