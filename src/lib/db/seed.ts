import { hash } from "bcryptjs";
import { db, users, teams, positions, electionSettings } from "./index";

async function seed() {
  if (!process.env.DATABASE_URL && !process.env.LOCAL_DATABASE_URL) {
    console.warn("No DATABASE_URL found; using local fallback database URL");
  }

  const passwordHash = await hash("Admin@2024", 10);

  const [adminUser] = await db
    .insert(users)
    .values({
      full_name: "ALM Admin",
      email: "admin@alm.org",
      phone: "+250000000000",
      member_id: "ALM-ADMIN-001",
      password_hash: passwordHash,
      role: "admin",
      is_approved: true,
    })
    .returning({ id: users.id });

  const [teamA] = await db
    .insert(teams)
    .values({ name: "Team A", description: "First competing team" })
    .returning({ id: teams.id });

  const [teamB] = await db
    .insert(teams)
    .values({ name: "Team B", description: "Second competing team" })
    .returning({ id: teams.id });

  const positionRecords: Array<{
    title: "president" | "vice_president" | "general_secretary" | "financial_secretary";
    display_name: string;
    is_combined: boolean;
  }> = [
    { title: "president", display_name: "President", is_combined: false },
    { title: "vice_president", display_name: "Vice President", is_combined: false },
    { title: "general_secretary", display_name: "General Secretary", is_combined: false },
    { title: "financial_secretary", display_name: "Financial Secretary", is_combined: false },
  ];

  await Promise.all(
    [teamA.id, teamB.id].flatMap((teamId) =>
      positionRecords.map((position) =>
        db.insert(positions).values({
          title: position.title,
          display_name: position.display_name,
          is_combined: position.is_combined,
          team_id: teamId,
        }),
      ),
    ),
  );

  await db.insert(electionSettings).values({
    election_name: "ALM General Elections 2024",
    is_active: false,
    allow_registration: true,
    created_by: adminUser.id,
  });

  console.log("🌱 Database seed completed successfully.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
