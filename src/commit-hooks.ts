import {processingCommit} from "./commit-processing";
import {PayloadPushType} from "./types/payload";

const baseUrl: string = process.env.GITLAB_URL!
const token = process.env.GITLAB_TOKEN;
if (!token) throw new Error('No GitLab token');

async function processPush(hook: PayloadPushType) {

    await Promise.all(
        hook.commits.map(async (commit) => {
            const res = await fetch(`${baseUrl}projects/${hook.project.id}/repository/commits/${commit.id}/diff`, {
                headers: { "PRIVATE-TOKEN": token! }
            });
            const diffResponse = await res.json();

            const diff: {
                path: {
                    old: string,
                    new: string,
                },
                newFile: boolean,
                data: string,
            }[] = diffResponse.map((el: Record<string, string>) => {
                return {
                    path: {
                        old: el.old_path,
                        new: el.new_path,
                    },
                    newFile: el.new_file,
                    data: el.diff,
                }
            })

            await processingCommit(diff, hook)
        })
    )


}

// допустим сюда приходит отбивка от гитлаба
async function hooks(hook: PayloadPushType) {

    if (hook.event_name === 'push'){
        await processPush(hook)
    }


}

// TODO эксперсс котроллер для поимки хуков