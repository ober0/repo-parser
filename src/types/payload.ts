export type PayloadPushType = {
    "object_kind": string,
    "event_name": string,
    "before": string,
    "after": string,
    "ref": string,
    "checkout_sha": string,
    "message": string,
    "user_id": number,
    "user_username": string,
    "project": {
        "id": number,
        "name": string,
        "web_url": string,
        "default_branch": string
    },
    "commits": {
        "id": string,
        "message": string,
        "title": string,
        "timestamp": string,
        "url": string,
        "author": {
            "name": "Jordi Mallach",
            "email": "jordi@softcatala.org"
        },
        "added": string[],
        "modified": string[],
        "removed": string[],
    }[]
}