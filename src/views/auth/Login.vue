<template>
    <v-container>
        <div v-if="banner != null">
            <v-banner :text="banner">
                <template v-slot:actions>
                    <!--                    Empty-->
                </template>
            </v-banner>
        </div>
        <v-card max-width="600" class="mx-auto">
            <v-card-title>Login</v-card-title>
            <v-card-subtitle v-if="!hideAll">Please log in with your EspoCRM account</v-card-subtitle>
            <v-card-text v-if="!hideAll">
                <div v-if="enterUsernamePassword">
                    <v-form v-model="usernamePasswordValid">
                        <v-text-field
                            v-model="username"
                            :rules="requiredRules"
                            label="Username"
                        ></v-text-field>
                        <v-text-field
                            v-model="password"
                            type="password"
                            :rules="requiredRules"
                            label="Password"
                        ></v-text-field>
                    </v-form>
                </div>
            </v-card-text>
            <v-card-actions v-if="!hideAll">
                <v-btn
                    class="text-grey"
                    to="/auth/login">
                    Don't have an account? Register
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="loading"
                    color="primary"
                    :disabled="(enterUsernamePassword && !usernamePasswordValid) || loading"
                    @click="login">
                    Login
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import {onMounted, Ref, ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {server} from "@/main";
import {ClientInfo} from "@/scripts/oauth";

const route = useRoute();
const router = useRouter();

const requiredRules = <((v: string | undefined) => string)[]> [
    v => !!v || "Required"
];

let banner: Ref<string | null> = ref(null);

let enterUsernamePassword = ref(true);
let hideAll = ref(false);

const usernamePasswordValid = ref(true);

const username: Ref<string | null> = ref(null);
const password: Ref<string | null> = ref(null);

const loading = ref(false);

onMounted(async () => {
    await router.isReady();

    if(route.query['authorization'] == null) {
        const client = await ClientInfo.getInfo();
        client.redirectToLogin();
    }
})

async function login() {
    const r = await fetch(`${server}/api/v1/oauth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'username': username.value,
            'password': password.value,
            'authorization': route.query['authorization']
        })
    });

    switch(r.status) {
        case 200:
        interface Response {
            status: boolean,
        }
            const v: Response = await r.json();

            if(!v.status) {
                banner.value = "Invalid username or password";
                break;
            }

            if(v.status) {
                await router.push(`/auth/authorize?authorization=${route.query['authorization']}`);
                return;
            }

            break;
        case 403:
            // Returned in case a (subset)set of requested scopes isnt allowed
            banner.value = "You are not allowed to access the requested resource. Please contact your administrator."

            // Hide input fields, don't need them anymore
            hideAll.value = true;
            break;
        default:
            banner.value = r.statusText;
            break;
    }
}
</script>