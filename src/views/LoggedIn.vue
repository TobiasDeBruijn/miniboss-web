<template>
    <v-container>
        <v-banner :text="errorBanner" v-if="errorBanner">
            <template v-slot:actions>
            </template>
        </v-banner>

        <v-card v-if="loading">
            <v-card-title>Almost there..</v-card-title>
            <v-card-subtitle>Finishing up logging in</v-card-subtitle>
            <v-card-text>
                <v-progress-circular indeterminate></v-progress-circular>
            </v-card-text>
        </v-card>

        <v-card v-else>
            <v-card-title>Logged in</v-card-title>
            <v-card-subtitle v-if="!errorBanner">Welcome to Tenderweave.</v-card-subtitle>

            <v-card-actions>

            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

interface Data {
    errorBanner?: string,
    loading: boolean
}

export default defineComponent({
    data(): Data {
        return {
            errorBanner: undefined,
            loading: true,
        }
    },
    mounted() {
        this.$router.onReady(() => {
            this.setAccessToken();
        })
    },
    methods: {
        setAccessToken() {
            const params = this.parseQuery(this.$route.hash);
            if(params.has('access_token')) {
                window.localStorage.setItem('access_token', params.get('access_token')!);
                const expiresAt = (Date.now() / 1000) + Number.parseInt(params.get('expires_in')!);
                window.localStorage.setItem('access_token_expiry', expiresAt.toString());
            } else {
                this.errorBanner = "Could not log in."
            }

            this.loading = false;
            this.$router.push('/');
        },
        parseQuery(queryString: string): Map<string, string> {
            let query: Map<string, string> = new Map();
            let pairs = ((queryString[0] === '?' || queryString[0] === '#') ? queryString.substring(1) : queryString).split('&');
            for (let i = 0; i < pairs.length; i++) {
                let pair = pairs[i].split('=');
                query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
            }
            return query;
        }
    }
})
</script>