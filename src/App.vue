<template>
  <v-app>
    <v-app-bar color="primary" dark elevation="4">
      <v-app-bar-title>
        <v-icon class="me-2">mdi-shield-check</v-icon>
        Bitwise Permission System
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{
          isDark ? "mdi-weather-sunny" : "mdi-weather-night"
        }}</v-icon>
      </v-btn>
    </v-app-bar>

    <router-view />

    <!-- Global Notification Snackbar -->
    <v-snackbar
      v-model="notificationState.show"
      :color="notificationState.color"
      :timeout="notificationState.timeout"
      location="top right"
      :multi-line="notificationState.message.length > 50"
    >
      <div class="d-flex align-center">
        <v-icon v-if="notificationState.icon" class="me-2">
          {{ notificationState.icon }}
        </v-icon>
        {{ notificationState.message }}
      </div>
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          size="small"
          @click="notificationState.show = false"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { useTheme } from "vuetify";
import { notificationState } from "@/plugins/notifications";

export default {
  setup() {
    const theme = useTheme();
    return { theme, notificationState };
  },
  mounted() {
    // Load theme from localStorage on component mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.theme.change(savedTheme);
    }
  },
  computed: {
    /**
     * Check if the current theme is dark.
     * @returns {boolean} True if the theme is dark, false otherwise.
     */
    isDark() {
      return this.theme.global.current.value.dark;
    },
  },
  methods: {
    /**
     * Toggle the application theme between light and dark modes.
     * Updates the theme globally and saves the current theme to localStorage.
     * @returns {void}
     */
    toggleTheme() {
      const newTheme = this.theme.global.current.value.dark ? "light" : "dark";
      this.theme.change(newTheme);
      // Save theme to localStorage
      localStorage.setItem("theme", newTheme);
    },
  },
};
</script>
