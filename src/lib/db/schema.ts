import { pgEnum, pgTable, uuid, text, timestamp, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["member", "admin"]);
export const positionTitle = pgEnum("position_title", ["president", "vice_president", "general_secretary", "financial_secretary"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  member_id: text("member_id").notNull(),
  password_hash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("member"),
  is_approved: boolean("is_approved").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const resetTokens = pgTable("reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expires_at: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: positionTitle("title").notNull(),
  display_name: text("display_name").notNull(),
  is_combined: boolean("is_combined").notNull().default(false),
  team_id: uuid("team_id").references(() => teams.id),
});

export const candidateApplications = pgTable("candidate_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  position_id: uuid("position_id").references(() => positions.id),
  team_id: uuid("team_id").references(() => teams.id),
  party: text("party").notNull(),
  bio: text("bio").notNull(),
  previous_leadership_positions: text("previous_leadership_positions").notNull(),
  letter_of_intent: text("letter_of_intent").notNull(),
  profile_picture: text("profile_picture"),
  running_mate_name: text("running_mate_name"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  team_id: uuid("team_id").references(() => teams.id).notNull(),
  position_id: uuid("position_id").references(() => positions.id).notNull(),
  
  // Main candidate (all positions)
  full_name: text("full_name").notNull(),
  profile_picture: text("profile_picture"),
  party_affiliation: text("party_affiliation"),
  previous_leadership: text("previous_leadership"),
  letter_of_intent: text("letter_of_intent"),
  bio: text("bio"),

  // Running mate fields (President/VP only)
  running_mate_name: text("running_mate_name"),
  running_mate_picture: text("running_mate_picture"),
  running_mate_party: text("running_mate_party"),
  running_mate_previous_leadership: text("running_mate_previous_leadership"),
  running_mate_letter_of_intent: text("running_mate_letter_of_intent"),
  running_mate_bio: text("running_mate_bio"),

  created_at: timestamp("created_at").defaultNow(),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    voter_id: uuid("voter_id").references(() => users.id),
    candidate_id: uuid("candidate_id").references(() => candidates.id),
    position_id: uuid("position_id").references(() => positions.id),
    team_id: uuid("team_id").references(() => teams.id),
    voted_at: timestamp("voted_at").notNull().defaultNow(),
  },
  (table) => ({
    unique_voter_position: uniqueIndex("votes_voter_position_unique").on(table.voter_id, table.position_id),
  }),
);

export const electionSettings = pgTable("election_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  election_name: text("election_name").notNull(),
  is_active: boolean("is_active").notNull().default(false),
  voting_start: timestamp("voting_start"),
  voting_end: timestamp("voting_end"),
  allow_registration: boolean("allow_registration").notNull().default(true),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actor_id: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  metadata: jsonb("metadata").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
