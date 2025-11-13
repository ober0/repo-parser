import express from 'express'
import bodyParser from 'body-parser'
import {hooks} from "./commit-hooks";
import 'dotenv/config'


const app = express()
const PORT = process.env.PORT || 3000
const SECRET = process.env.GITLAB_SECRET

app.use(bodyParser.json())

app.post('/gitlab/webhook', async (req, res) => {
    try {
        const payload = req.body

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

        const token = req.headers['x-gitlab-token']
        console.log(token, SECRET)
        if (!SECRET || token !== SECRET) {
            console.error(`Попытка отправить невалидный хук. ip: ${String(ip)}`)
            return res.status(403).send('Неверный токен')
        }

        await hooks(payload)

        res.status(200).send('Ok')
    } catch (err) {
        console.error('Ошибка при обработке вебхука:', err)
        res.status(500).send('Internal Server Error')
    }
})

app.listen(PORT, () => console.log(`Сервак запущен`))
