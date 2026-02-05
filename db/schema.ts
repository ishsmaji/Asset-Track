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
} from "drizzle-orm/pg-core";

/* ============================================================
   ENUMS
============================================================ */

export const organizationTypeEnum = pgEnum("org_type", [
  "Government",
  "Corporate",
  "Education",
  "HealthCare",
  "Non-Profit",
]);

export const userRoleEnum = pgEnum("user_role", [
  "User",
  "Approver",
  "Auditor",
  "Admin",
  "Parent-Admin",
]);

export const requisitionStatusEnum = pgEnum("requisition_status", [
  "Pending",
  "Approved",
  "Rejected",
  "Order-Initiated",
  "In-Progress",
  "Received",
  "Moved-To-Registry",
]);

export const requisitionTypeEnum = pgEnum("requisition_type", [
  "PURCHASE",
  "MAINTENANCE",
]);

export const assetConditionEnum = pgEnum("asset_condition", [
  "New",
  "Good",
  "Damaged",
  "Repair-Required",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "Active",
  "Unused",
  "Under-Maintenance",
  "Transfered",
]);

export const assignmentStageEnum = pgEnum("assignment_stage", [
  "TO_APPROVER",
  "TO_AUDITOR",
]);

export const approvalActionEnum = pgEnum("approval_action", [
  "APPROVED",
  "REJECTED",
]);

export const assetActionTypeEnum = pgEnum("asset_action_type", [
  "ASSIGN_USER",
  "TRANSFER_BRANCH",
  "MAINTENANCE",
  "MARK_UNUSED",
]);

/* ============================================================
   SUBSCRIPTION PLANS (DO NOT CHANGE)
============================================================ */

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 50 }).notNull().unique(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),

  maxAssets: integer("max_assets").notNull(),
  maxUsers: integer("max_users").notNull(),

  features: text("features").array().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================================
   ORGANIZATIONS
============================================================ */

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull().unique(),
  type: organizationTypeEnum("type").notNull(),

  planId: integer("plan_id")
    .references(() => subscriptionPlans.id, { onDelete: "restrict" })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================================
   BRANCHES
============================================================ */

export const branches = pgTable(
  "branches",
  {
    id: serial("id").primaryKey(),

    orgId: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),

    address: text("address").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniqueBranchCodePerOrg: unique("unique_branch_code_per_org").on(
      t.orgId,
      t.code
    ),
    orgIdx: index("idx_branches_org_id").on(t.orgId),
  })
);

/* ============================================================
   USERS (branchId is nullable)
============================================================ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),

    orgId: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branchId: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),

    password: varchar("password", { length: 255 }).notNull(),

    role: userRoleEnum("role").notNull().default("User"),

    isActive: boolean("is_active").notNull().default(true),

    token: varchar("token", { length: 512 }),

    otp: varchar("otp", { length: 6 }),
    otpExpiry: timestamp("otp_expiry"),

    resetPasswordToken: varchar("reset_password_token", { length: 255 }),
    resetPasswordExpires: bigint("reset_password_expires", { mode: "number" }),

    profileImageUrl: varchar("profile_image_url", { length: 512 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    orgIdx: index("idx_users_org_id").on(t.orgId),
    branchIdx: index("idx_users_branch_id").on(t.branchId),
  })
);

/* ============================================================
   ASSET REQUISITIONS (purchase + maintenance)
============================================================ */

export const assetRequisitions = pgTable(
  "asset_requisitions",
  {
    id: serial("id").primaryKey(),

    orgId: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branchId: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    requesterId: integer("requester_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    requisitionType: requisitionTypeEnum("requisition_type")
      .notNull()
      .default("PURCHASE"),

    // Only for MAINTENANCE requisition
    assetId: integer("asset_id"),

    requisitionTitle: varchar("requisition_title", { length: 255 }).notNull(),

    priority: varchar("priority", { length: 20 }).notNull().default("MEDIUM"),

    status: requisitionStatusEnum("status").notNull().default("Pending"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    orgIdx: index("idx_req_org_id").on(t.orgId),
    branchIdx: index("idx_req_branch_id").on(t.branchId),
    requesterIdx: index("idx_req_requester_id").on(t.requesterId),
    assetIdx: index("idx_req_asset_id").on(t.assetId),
  })
);

/* ============================================================
   ASSET REQUISITION ITEMS
============================================================ */

export const assetRequisitionItems = pgTable(
  "asset_requisition_items",
  {
    id: serial("id").primaryKey(),

    requisitionId: integer("requisition_id")
      .references(() => assetRequisitions.id, { onDelete: "cascade" })
      .notNull(),

    requestedBy: integer("requested_by")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    assetType: varchar("asset_type", { length: 100 }).notNull(),

    quantity: integer("quantity").notNull(),

    specification: text("specification"),
    justification: text("justification"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    reqIdx: index("idx_req_items_req_id").on(t.requisitionId),
    userIdx: index("idx_req_items_user_id").on(t.requestedBy),
  })
);

/* ============================================================
   REQUISITION APPROVALS
============================================================ */

export const requisitionApprovals = pgTable("requisition_approvals", {
  id: serial("id").primaryKey(),

  requisitionId: integer("requisition_id")
    .references(() => assetRequisitions.id, { onDelete: "cascade" })
    .notNull(),

  approverId: integer("approver_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  action: approvalActionEnum("action").notNull(),

  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================================
   REQUISITION ASSIGNMENTS (Approver -> Auditor)
============================================================ */

export const requisitionAssignments = pgTable("requisition_assignments", {
  id: serial("id").primaryKey(),

  requisitionId: integer("requisition_id")
    .references(() => assetRequisitions.id, { onDelete: "cascade" })
    .notNull(),

  assignedBy: integer("assigned_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  assignedTo: integer("assigned_to")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  stage: assignmentStageEnum("stage").notNull(),

  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================================
   REQUISITION AUDIT LOGS
============================================================ */

export const requisitionAuditLogs = pgTable("requisition_audit_logs", {
  id: serial("id").primaryKey(),

  requisitionId: integer("requisition_id")
    .references(() => assetRequisitions.id, { onDelete: "cascade" })
    .notNull(),

  auditorId: integer("auditor_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  invoiceUrl: varchar("invoice_url", { length: 512 }),
  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================================
   ASSET REGISTRY
============================================================ */

export const assetRegistry = pgTable(
  "asset_registry",
  {
    id: serial("id").primaryKey(),

    orgId: integer("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    branchId: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    requisitionId: integer("requisition_id").references(
      () => assetRequisitions.id,
      { onDelete: "set null" }
    ),

    assetCode: varchar("asset_code", { length: 50 }).notNull().unique(),

    assetName: varchar("asset_name", { length: 255 }).notNull(),

    majorCategory: varchar("major_category", { length: 100 }).notNull(),
    subCategory: varchar("sub_category", { length: 100 }),

    department: varchar("department", { length: 100 }),
    physicalLocation: varchar("physical_location", { length: 255 }),

    acquisitionDate: timestamp("acquisition_date"),
    acquisitionCost: decimal("acquisition_cost", { precision: 12, scale: 2 }),

    supplierVendor: varchar("supplier_vendor", { length: 255 }),

    condition: assetConditionEnum("condition").notNull().default("New"),
    status: assetStatusEnum("status").notNull().default("Active"),

    acquisitionBy: integer("acquisition_by").references(() => users.id, {
      onDelete: "set null",
    }),

    description: text("description"),

    // array of URLs
    photos: text("photos").array(),

    qrCodeUrl: varchar("qr_code_url", { length: 512 }),

    usedFor: varchar("used_for", { length: 255 }),

    movedToRegistryAt: timestamp("moved_to_registry_at").defaultNow(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    orgIdx: index("idx_asset_org_id").on(t.orgId),
    branchIdx: index("idx_asset_branch_id").on(t.branchId),
  })
);

/* ============================================================
   ASSET ACTIONS
============================================================ */

export const assetActions = pgTable(
  "asset_actions",
  {
    id: serial("id").primaryKey(),

    assetId: integer("asset_id")
      .references(() => assetRegistry.id, { onDelete: "cascade" })
      .notNull(),

    actionType: assetActionTypeEnum("action_type").notNull(),

    fromBranchId: integer("from_branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    toBranchId: integer("to_branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    fromUserId: integer("from_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    toUserId: integer("to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    remarks: text("remarks"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    assetIdx: index("idx_actions_asset_id").on(t.assetId),
  })
);

/* ============================================================
   ASSET ACTIVITY TIMELINE
============================================================ */

export const assetActivityTimeline = pgTable(
  "asset_activity_timeline",
  {
    id: serial("id").primaryKey(),

    assetId: integer("asset_id")
      .references(() => assetRegistry.id, { onDelete: "cascade" })
      .notNull(),

    activityTitle: varchar("activity_title", { length: 255 }).notNull(),
    activityDetails: text("activity_details"),

    performedBy: integer("performed_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    assetIdx: index("idx_timeline_asset_id").on(t.assetId),
  })
);
