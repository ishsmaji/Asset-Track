import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  text,
  decimal,
  boolean,
  bigint,
  pgEnum,
  index,
  unique,
  jsonb
} from "drizzle-orm/pg-core";

/* ============================================================
   ENUMS
============================================================ */

export const organization_type_enum = pgEnum("org_type", [
  "Government",
  "Corporate",
  "Education",
  "HealthCare",
  "Non-Profit",
]);

export const user_role_enum = pgEnum("user_role", [
  "User",
  "Approver",
  "Auditor",
  "Admin",
  "Parent-Admin",
]);

export const requisition_status_enum = pgEnum("requisition_status", [
  "Pending",
  "Approved",
  "Rejected",
  "Order-Initiated",
  "In-Progress",
  "Received",
  "Moved-To-Registry",
]);

export const requisition_type_enum = pgEnum("requisition_type", [
  "Purchase",
  "Maintenance",
]);

export const asset_condition_enum = pgEnum("asset_condition", [
  "New",
  "Good",
  "Damaged",
  "Repair-Required",
]);

export const asset_status_enum = pgEnum("asset_status", [
  "Active",
  "Unused",
  "Under-Maintenance",
  "Transfered",
]);

export const assignment_stage_enum = pgEnum("assignment_stage", [
  "To_Approver",
  "To_Auditor",
  "Completed"
]);

export const approval_action_enum = pgEnum("approval_action", [
  "Approved",
  "Rejected",
]);

export const asset_action_type_enum = pgEnum("asset_action_type", [
  "Assign_User",
  "Transfer_Branch",
  "Maintenance",
  "Mark_Unused",
]);

/* ============================================================
   SUBSCRIPTION PLANS
============================================================ */

export const subscription_plans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 50 }).notNull().unique(),
  monthly_price: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),

  max_assets: integer("max_assets").notNull(),
  max_users: integer("max_users").notNull(),

  features: jsonb("features").notNull(),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* ============================================================
   ORGANIZATIONS
============================================================ */

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull().unique(),
  type: organization_type_enum("type").notNull(),

  plan_id: integer("plan_id")
    .references(() => subscription_plans.id, { onDelete: "restrict" })
    .notNull(),

  created_at: timestamp("created_at").defaultNow(),
});

/* ============================================================
   BRANCHES
============================================================ */

export const branches = pgTable(
  "branches",
  {
    id: serial("id").primaryKey(),

    org_id: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),

    address: text("address").notNull(),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    unique_branch_code_per_org: unique("unique_branch_code_per_org").on(
      t.org_id,
      t.code
    ),
    idx_branches_org_id: index("idx_branches_org_id").on(t.org_id),
  })
);

/* ============================================================
   USERS
============================================================ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),

    org_id: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branch_id: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),

    password: varchar("password", { length: 255 }).notNull(),

    role: user_role_enum("role").notNull().default("User"),

    is_active: boolean("is_active").notNull().default(true),

    token: varchar("token", { length: 512 }),

    otp: varchar("otp", { length: 6 }),
    otp_expiry: timestamp("otp_expiry"),

    reset_password_token: varchar("reset_password_token", { length: 255 }),
    reset_password_expires: bigint("reset_password_expires", { mode: "number" }),

    profile_image_url: varchar("profile_image_url", { length: 512 }),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idx_users_org_id: index("idx_users_org_id").on(t.org_id),
    idx_users_branch_id: index("idx_users_branch_id").on(t.branch_id),
  })
);

/* ============================================================
   ASSET REQUISITIONS
============================================================ */

export const asset_requisitions = pgTable(
  "asset_requisitions",
  {
    id: serial("id").primaryKey(),

    org_id: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branch_id: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    requester_id: integer("requester_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    requisition_type: requisition_type_enum("requisition_type")
      .notNull()
      .default("Purchase"),

    asset_id: integer("asset_id"),

    requisition_title: varchar("requisition_title", { length: 255 }).notNull(),

    priority: varchar("priority", { length: 20 }).notNull().default("MEDIUM"),

    status: requisition_status_enum("status").notNull().default("Pending"),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    idx_req_org_id: index("idx_req_org_id").on(t.org_id),
    idx_req_branch_id: index("idx_req_branch_id").on(t.branch_id),
    idx_req_requester_id: index("idx_req_requester_id").on(t.requester_id),
    idx_req_asset_id: index("idx_req_asset_id").on(t.asset_id),
  })
);

/* ============================================================
   ASSET REQUISITION ITEMS
============================================================ */

export const asset_requisition_items = pgTable(
  "asset_requisition_items",
  {
    id: serial("id").primaryKey(),

    requisition_id: integer("requisition_id")
      .references(() => asset_requisitions.id, { onDelete: "cascade" })
      .notNull(),

    requested_by: integer("requested_by")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    asset_type: varchar("asset_type", { length: 100 }).notNull(),

    quantity: integer("quantity").notNull(),

    specification: text("specification"),
    justification: text("justification"),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idx_req_items_req_id: index("idx_req_items_req_id").on(t.requisition_id),
    idx_req_items_user_id: index("idx_req_items_user_id").on(t.requested_by),
  })
);

/* ============================================================
   REQUISITION APPROVALS
============================================================ */

export const requisition_approvals = pgTable("requisition_approvals", {
  id: serial("id").primaryKey(),

  requisition_id: integer("requisition_id")
    .references(() => asset_requisitions.id, { onDelete: "cascade" })
    .notNull(),

  approver_id: integer("approver_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  action: approval_action_enum("action").notNull(),

  remarks: text("remarks"),

  created_at: timestamp("created_at").defaultNow(),
});

/* ============================================================
   REQUISITION ASSIGNMENTS
============================================================ */

export const requisition_assignments = pgTable("requisition_assignments", {
  id: serial("id").primaryKey(),

  requisition_id: integer("requisition_id")
    .references(() => asset_requisitions.id, { onDelete: "cascade" })
    .notNull(),

  assigned_by: integer("assigned_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  assigned_to: integer("assigned_to")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  stage: assignment_stage_enum("stage").notNull(),

  remarks: text("remarks"),

  created_at: timestamp("created_at").defaultNow(),
});

/* ============================================================
   REQUISITION AUDIT LOGS
============================================================ */

export const requisition_audit_logs = pgTable("requisition_audit_logs", {
  id: serial("id").primaryKey(),

  requisition_id: integer("requisition_id")
    .references(() => asset_requisitions.id, { onDelete: "cascade" })
    .notNull(),

  auditor_id: integer("auditor_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  invoice_url: varchar("invoice_url", { length: 512 }),
  remarks: text("remarks"),

  created_at: timestamp("created_at").defaultNow(),
});

/* ============================================================
   ASSET REGISTRY
============================================================ */

export const asset_registry = pgTable(
  "asset_registry",
  {
    id: serial("id").primaryKey(),

    org_id: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branch_id: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    requisition_id: integer("requisition_id").references(
      () => asset_requisitions.id,
      { onDelete: "set null" }
    ),

    asset_code: varchar("asset_code", { length: 50 }).notNull().unique(),

    asset_name: varchar("asset_name", { length: 255 }).notNull(),

    major_category: varchar("major_category", { length: 100 }).notNull(),
    sub_category: varchar("sub_category", { length: 100 }),

    department: varchar("department", { length: 100 }),
    physical_location: varchar("physical_location", { length: 255 }),

    acquisition_date: timestamp("acquisition_date"),
    acquisition_cost: decimal("acquisition_cost", { precision: 12, scale: 2 }),

    supplier_vendor: varchar("supplier_vendor", { length: 255 }),

    condition: asset_condition_enum("condition").notNull().default("New"),
    status: asset_status_enum("status").notNull().default("Active"),

    acquisition_by: integer("acquisition_by").references(() => users.id, {
      onDelete: "set null",
    }),

    description: text("description"),

    photos: text("photos").array(),

    qr_code_url: varchar("qr_code_url", { length: 512 }),

    used_for: varchar("used_for", { length: 255 }),

    moved_to_registry_at: timestamp("moved_to_registry_at").defaultNow(),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idx_asset_org_id: index("idx_asset_org_id").on(t.org_id),
    idx_asset_branch_id: index("idx_asset_branch_id").on(t.branch_id),
  })
);

/* ============================================================
   ASSET ACTIONS
============================================================ */

export const asset_actions = pgTable(
  "asset_actions",
  {
    id: serial("id").primaryKey(),

    asset_id: integer("asset_id")
      .references(() => asset_registry.id, { onDelete: "cascade" })
      .notNull(),

    action_type: asset_action_type_enum("action_type").notNull(),

    from_branch_id: integer("from_branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    to_branch_id: integer("to_branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    from_user_id: integer("from_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    to_user_id: integer("to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    remarks: text("remarks"),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idx_actions_asset_id: index("idx_actions_asset_id").on(t.asset_id),
  })
);

/* ============================================================
   ASSET ACTIVITY TIMELINE
============================================================ */

export const asset_activity_timeline = pgTable(
  "asset_activity_timeline",
  {
    id: serial("id").primaryKey(),

    asset_id: integer("asset_id")
      .references(() => asset_registry.id, { onDelete: "cascade" })
      .notNull(),

    activity_title: varchar("activity_title", { length: 255 }).notNull(),
    activity_details: text("activity_details"),

    performed_by: integer("performed_by").references(() => users.id, {
      onDelete: "set null",
    }),

    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idx_timeline_asset_id: index("idx_timeline_asset_id").on(t.asset_id),
  })
);
