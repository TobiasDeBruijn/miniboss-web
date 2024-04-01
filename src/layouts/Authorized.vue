<template>
    <v-app>
        <default-bar />

        <default-view />
    </v-app>
</template>

<script setup lang="ts">

import DefaultView from "./components/View.vue";
import DefaultBar from "./components/AppBar.vue";

import {onMounted} from "vue";
import {ClientInfo} from "@/scripts/oauth";

onMounted(async () => {
    await checkLogin();
})

async function checkLogin() {
    const wilford = await ClientInfo.getInfo()
    await wilford.checkTokenValidity();
}
</script>