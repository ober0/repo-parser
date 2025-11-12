import AdmZip from "adm-zip";
import 'dotenv/config';

export interface File {
    type: 'file';
    name: string;
    content: string;
    length: number;
}

export interface Dir {
    type: 'dir';
    name: string;
    children: (Dir | File)[];
}

export class GitLabApi {
    private readonly baseUrl: string = process.env.GITLAB_URL!;
    private readonly apiToken: string;

    constructor() {
        const token = process.env.GITLAB_TOKEN;
        if (!token) throw new Error('No GitLab token');
        this.apiToken = token;
    }

    async getRepo(projectId: number, branch = 'main'): Promise<Dir> {
        const url = `${this.baseUrl}/projects/${projectId}/repository/archive.zip?sha=${branch}`;
        const res = await fetch(url, {
            mode: 'same-origin',
            headers: {
                'PRIVATE-TOKEN': this.apiToken,
                'Accept': 'application/zip'
            }
        });

        if (!res.ok) throw new Error(`Не удалось скачать репозиторий: ${res.status} ${res.statusText}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        let rootDir: Dir | null = null;

        for (const entry of zipEntries) {
            const parts = entry.entryName.split('/').filter(Boolean);
            if (!parts.length) continue;

            if (!rootDir) {
                rootDir = { type: 'dir', name: parts[0], children: [] };
            }

            this.insertEntry(rootDir, parts.slice(1), entry);
        }

        if (!rootDir) throw new Error('Пустой архив или не удалось разобрать структуру');
        return rootDir;
    }

    private insertEntry(root: Dir, parts: string[], entry: AdmZip.IZipEntry) {
        if (parts.length === 0) return;

        const [current, ...rest] = parts;


        if (rest.length === 0 && !entry.isDirectory) {
            const ext = current.split('.').pop()?.toLowerCase() || '';
            const allowed = ['ts', 'js', 'json', 'yml', 'yaml'];
            const excluded = ['tsconfig.json', 'package.json'];

            if (!allowed.includes(ext) || excluded.includes(current)) return;

            const content = entry.getData().toString('utf-8');

            root.children.push({
                type: 'file',
                name: current,
                content,
                length: content.length
            });

            return;
        }

        let dir = root.children.find(
            (el): el is Dir => el.type === 'dir' && el.name === current
        );

        if (!dir) {
            dir = { type: 'dir', name: current, children: [] };
            root.children.push(dir);
        }

        this.insertEntry(dir, rest, entry);
    }
}
