import {server} from "@/main";

export class WilfordInfo {
    host: string;
    loginRedirect: string;
    clientId: string;
    redirectUri: string;

    constructor(host: string, login_redirect: string, client_id: string, redirect_uri: string) {
        this.host = host;
        this.loginRedirect = login_redirect;
        this.clientId = client_id;
        this.redirectUri = redirect_uri;
    }

    static async getInfo(): Promise<WilfordInfo> {
        const r = await fetch(`${server}/api/v1/wilford`);
        interface Response {
            host: string,
            login_redirect: string,
            client_id: string,
            redirect_uri: string,
        }

        const j: Response = await r.json();
        return new WilfordInfo(
            j.host,
            j.login_redirect,
            j.client_id,
            j.redirect_uri
        )
    }

    redirectToLogin(manager: boolean = false) {
        const scopes = manager ? "tenderweave.manager tenderweave" : "tenderweave";
        window.location.href = `${this.host}/api/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${scopes}`;
    }

    async checkTokenValidity(manager: boolean = false): Promise<string[]> {
        if(!window.localStorage.getItem('access_token') || !window.localStorage.getItem('access_token_expiry')) {
            this.redirectToLogin(manager);
        }

        // Check if the token expires within 5 minutes
        const expiresAt = Number.parseInt(window.localStorage.getItem('access_token_expiry')!);
        if(expiresAt - 300 <= (Date.now() / 1000)) {
            console.log("Token almost expired. Forcing reauthorization");
            this.redirectToLogin(manager);
        }

        const r = await fetch(`${this.host}/api/v1/auth/token-info`, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('access_token')}`
            }
        });

        if(r.status == 401) {
            this.redirectToLogin(manager);
            return [];
        }

        interface Response {
            scope: string
        }

        const j: Response = await r.json();
        const scopes = j.scope.split(" ");

        if(!scopes.includes("tenderweave")) {
            this.redirectToLogin(manager);
            return [];
        }

        if(manager && !scopes.includes("tenderweave.manager")) {
            this.redirectToLogin(manager);
            return [];
        }

        return scopes;
    }
}

export class UserInfo {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static async loadInfo(wilford: WilfordInfo): Promise<UserInfo> {
        const r = await fetch(`${wilford.host}/api/v1/user/info`, {
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('access_token')}`
            }
        })

        interface Response {
            name: string,
        }

        const j: Response = await r.json();
        return new UserInfo(j.name);
    }
}