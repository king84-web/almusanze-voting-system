import { z } from "zod";

const baseRegisterSchema = z.object({
  full_name: z.string().min(3, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  member_id: z.string().min(3, "Member ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password"),
});

export const registerSchema = baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const registerRequestSchema = baseRegisterSchema.omit({ confirmPassword: true });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const candidateSchema = z.object({
  full_name: z.string().min(3, "Candidate name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  position_id: z.string().uuid("Position is required"),
  team_id: z.string().uuid("Team is required"),
  running_mate_name: z.string().optional(),
  running_mate_picture: z.string().optional(),
});

export const electionSettingsSchema = z.object({
  election_name: z.string().min(5, "Election name is required"),
  is_active: z.boolean(),
  voting_start: z.string().min(1, "Voting start is required"),
  voting_end: z.string().min(1, "Voting end is required"),
  allow_registration: z.boolean(),
});

export const voteSchema = z.object({
  candidate_id: z.string().uuid("Candidate is required"),
  position_id: z.string().uuid("Position is required"),
  team_id: z.string().uuid("Team is required"),
});
