import {server} from "@/main";

export class ClientInfo {
    loginRedirect: string;
    clientId: string;
    redirectUri: string;

    constructor(login_redirect: string, client_id: string, redirect_uri: string) {
        this.loginRedirect = login_redirect;
        this.clientId = client_id;
        this.redirectUri = redirect_uri;
    }

    static async getInfo(): Promise<ClientInfo> {
        const r = await fetch(`${server}/api/v1/clients/internal`);
        interface Response {
            host: string,
            login_redirect: string,
            client_id: string,
            redirect_uri: string,
        }

        const j: Response = await r.json();
        return new ClientInfo(
            j.login_redirect,
            j.client_id,
            j.redirect_uri
        )
    }

    getAuthorizationRedirect(manager: boolean = false): string {
        const scopes = manager ? "miniboss.manager miniboss" : "miniboss";
        return `${server}/api/v1/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${scopes}`;
    }

    redirectToLogin(manager: boolean = false) {
        window.location.href = this.getAuthorizationRedirect(manager);
    }

    async checkTokenValidity(manager: boolean = false): Promise<string[]> {
        if(!window.localStorage.getItem('access_token')) {
            this.redirectToLogin(manager);
        }

        // Check if the token expires within 5 minutes
        // const expiresAt = Number.parseInt(window.localStorage.getItem('access_token_expiry')!);
        // if(expiresAt - 300 <= (Date.now() / 1000)) {
        //     console.log("Token almost expired. Forcing reauthorization");
        //     this.redirectToLogin(manager);
        // }

        const r = await fetch(`${server}/api/v1/oauth/token-info`, {
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

        if(!scopes.includes("miniboss")) {
            this.redirectToLogin(manager);
            return [];
        }

        if(manager && !scopes.includes("miniboss.manager")) {
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

    static async loadInfo(): Promise<UserInfo> {
        const r = await fetch(`${server}/api/v1/user/info`, {
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