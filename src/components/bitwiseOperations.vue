<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
        <v-data-table
          :headers="headers"
          :items="permissions"
          :items-per-page="-1"
          hide-default-footer
          class="elevation-1 rounded-lg"
          no-data-text="No permissions defined yet"
        >
          <template #no-data>
            <v-container fluid>
              <v-alert type="info" variant="tonal">
                No permissions defined yet. Add some to start using bitwise
                operations.
              </v-alert>
            </v-container>
          </template>

          <template #top>
            <v-container fluid>
              <v-row class="mt-2">
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="newPermissionName"
                    ref="newPermissionInput"
                    label="New Permission Name"
                    density="comfortable"
                    placeholder="e.g., READ_MESSAGES"
                    variant="outlined"
                    @keydown.enter="addPermission"
                    dense
                    :rules="[rules.required, rules.unique]"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    color="primary"
                    icon="mdi-plus"
                    @click="addPermission"
                    :disabled="!isValidPermissionName"
                  />
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.value="{ item }">
            <v-chip color="secondary" size="small">
              {{ item.value }}
            </v-chip>
          </template>

          <template v-slot:item.binary="{ item }">
            <code class="text-mono">{{
              item.value.toString(2).padStart(8, "0")
            }}</code>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="tonal"
              @click="removePermission(item.name)"
            />
          </template>
        </v-data-table>
      </v-col>

      <!-- Permission Checker -->
      <v-col cols="12" md="6">
        <v-card elevation="3">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-calculator</v-icon>
            Permission Checker
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model.number="checkValue"
              label="Enter Number to Check"
              type="number"
              variant="outlined"
              :rules="[rules.number]"
              @input="checkPermissions"
            />

            <div class="d-flex align-center mb-3">
              <span class="text-body-2 me-2">Binary:</span>
              <code class="text-mono bg-grey-lighten-4 pa-1 rounded">
                {{
                  (checkValue || 0)
                    .toString(2)
                    .padStart(
                      Math.max(8, nextPowerOfTwo.toString(2).length),
                      "0"
                    )
                }}
              </code>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="text-h6 mb-3">
              Included Permissions
              <v-chip
                v-if="includedPermissions.length"
                color="success"
                size="small"
                class="ml-2"
              >
                {{ includedPermissions.length }}
              </v-chip>
            </div>

            <v-row v-if="includedPermissions.length">
              <v-col cols="12">
                <v-chip-group column>
                  <v-chip
                    v-for="permission in includedPermissions"
                    :key="permission.name"
                    color="success"
                    variant="elevated"
                    class="ma-1"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    {{ permission.name }}
                    <v-tooltip activator="parent" location="bottom">
                      Value: {{ permission.value }} ({{
                        permission.value.toString(2)
                      }})
                    </v-tooltip>
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>

            <v-alert
              v-else-if="checkValue > 0"
              type="info"
              variant="tonal"
              class="mt-3"
            >
              No permissions match this value
            </v-alert>

            <v-alert v-else type="warning" variant="tonal" class="mt-3">
              Enter a number to check permissions
            </v-alert>

            <!-- Quick Actions -->
            <v-divider class="my-4"></v-divider>

            <div class="text-h6 mb-3">Quick Actions</div>

            <v-row>
              <v-col cols="6">
                <v-btn
                  block
                  variant="outlined"
                  color="primary"
                  @click="calculateAllPermissions"
                  :disabled="permissions.length === 0"
                >
                  <v-icon class="me-1">mdi-sigma</v-icon>
                  All Permissions
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  block
                  variant="outlined"
                  color="secondary"
                  @click="clearCheck"
                >
                  <v-icon class="me-1">mdi-refresh</v-icon>
                  Clear
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "bitwiseOperations",
  data() {
    return {
      permissions: [],
      newPermissionName: "",
      checkValue: 0,
      includedPermissions: [],
      headers: [
        { title: "Permission Name", key: "name", sortable: true },
        { title: "Value", key: "value", sortable: true },
        { title: "Binary", key: "binary", sortable: false },
        { title: "Actions", key: "actions", sortable: false, width: "100px" },
      ],
      rules: {
        required: (value) => !!value || "Required",
        unique: (value) =>
          !this.permissions.find((p) => p.name === value) ||
          "Permission name must be unique",
        number: (value) => !value || !isNaN(value) || "Must be a valid number",
      },
    };
  },
  computed: {
    isValidPermissionName() {
      return (
        this.newPermissionName &&
        !this.permissions.find((p) => p.name === this.newPermissionName) &&
        this.newPermissionName.trim().length > 0
      );
    },
    nextPowerOfTwo() {
      return this.permissions.length > 0
        ? Math.pow(2, this.permissions.length)
        : 1;
    },
  },
  watch: {
    checkValue() {
      this.checkPermissions();
    },
  },
  methods: {
    addPermission() {
      if (!this.isValidPermissionName) return;

      if (this.permissions.length >= 32) {
        this.$toastr.error("Maximum of 32 permissions reached");
        return;
      }

      const value = Math.pow(2, this.permissions.length);
      this.permissions.push({
        name: this.newPermissionName,
        value: value,
      });

      this.newPermissionName = "";
      this.checkPermissions();
      this.$nextTick(() => {
        this.$refs.newPermissionInput.focus();
      });
    },
    addExamplePermission(name) {
      if (this.permissions.find((p) => p.name === name)) return;

      const value = Math.pow(2, this.permissions.length);
      this.permissions.push({
        name: name,
        value: value,
      });

      this.checkPermissions();
    },
    removePermission(name) {
      const index = this.permissions.findIndex((p) => p.name === name);
      if (index > -1) {
        this.permissions.splice(index, 1);
        // Recalculate all permission values to maintain power of 2 sequence
        this.permissions.forEach((permission, idx) => {
          permission.value = Math.pow(2, idx);
        });
        this.checkPermissions();
      }
    },
    checkPermissions() {
      if (!this.checkValue || this.checkValue <= 0) {
        this.includedPermissions = [];
        return;
      }

      this.includedPermissions = this.permissions.filter((permission) => {
        return (this.checkValue & permission.value) === permission.value;
      });
    },
    calculateAllPermissions() {
      if (this.permissions.length === 0) return;

      const total = this.permissions.reduce(
        (sum, permission) => sum + permission.value,
        0
      );
      this.checkValue = total;
      this.checkPermissions();
    },
    clearCheck() {
      this.checkValue = 0;
      this.includedPermissions = [];
    },
  },
};
</script>
