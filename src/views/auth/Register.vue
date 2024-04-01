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
            <v-card-title>Register</v-card-title>
            <v-card-subtitle>Register a new Miniboss account</v-card-subtitle>
            <v-card-text>
                <v-form v-model="formValid">
                    <v-text-field
                        v-model="email"
                        :rules="rules.email"
                        label="E-mail"
                    ></v-text-field>
                    <v-text-field
                        v-model="name"
                        :rules="rules.required"
                        label="Name"
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        type="password"
                        :rules="rules.required"
                        label="Password"
                    ></v-text-field>
                    <v-text-field
                        v-model="repeatPassword"
                        type="password"
                        :rules="rules.repeatPassword"
                        label="Repeat password"
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn
                    class="text-grey"
                    to="/auth/login">
                    Already have an account? Login
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="loading"
                    :disabled="!formValid || loading"
                    color="primary"
                    @click="register">
                    Register
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script lang="ts">

import {RuleFn, server} from "@/main";
import {defineComponent} from "vue";
import {User} from "@/scripts/user";

interface Data {
    banner: string | null,
    rules: {
        required: RuleFn[],
        email: RuleFn[],
        repeatPassword: RuleFn[]
    },
    name: string,
    email: string,
    password: string,
    repeatPassword: string,
    loading: boolean,
    formValid: boolean,
}

export default defineComponent({
    data(): Data {
        return {
            banner: null,
            name: "",
            email: "",
            password: "",
            repeatPassword: "",
            loading: false,
            formValid: true,
            rules: {
                required: [
                    v => !!v || "Required"
                ],
                email: [
                    v => !!v || "Required",
                    v => /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(v) || "Invalid e-mail address",
                ],
                repeatPassword: [
                    v => !!v || "Required",
                    v => (v == <any> this.password) || "Passwords do not match"
                ]
            },
        }
    },
    methods: {
        async register() {
            this.loading = true;
            if(await User.register(this.name, this.email, this.password)) {
                this.loading = false;
                await this.$router.push('/auth/login');
            } else {
                this.loading = false;
                this.banner = "Something went wrong. Please try again later";
            }
        }
    }
})

</script>