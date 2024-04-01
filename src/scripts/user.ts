import {server} from "@/main";
import {ClientInfo} from "@/scripts/oauth";

interface _User {
    name: string,
    userId: string,
    email: string,
    is_admin: boolean,
}

export class User {
    name: string;
    userId: string;
    email: string;
    isAdmin: boolean;

    constructor(name: string, userId: string, email: string, isAdmin: boolean) {
        this.name = name;
        this.userId = userId;
        this.email = email;
        this.isAdmin = isAdmin;
    }

    static async getCurrent(): Promise<User> {
        const r = await fetch(`${server}/api/v1/user/info`, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('access_token')}`
            }
        })

        if(r.status == 401) {
            const client = await ClientInfo.getInfo();
            window.location.href = client.getAuthorizationRedirect();
        }

        const j: _User = await r.json();
        return new User(j.name, j.userId, j.email, j.is_admin);
    }

    static async register(name: string, email: string, password: string): Promise<boolean> {
        const r = await fetch(`${server}/api/v1/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            })
        })

        return r.ok;
    }
}