import "dotenv/config";
import bcrypt from "bcrypt";
import SingletonDb from "@/database";
import { Role } from "@/database/entities/roleEntity";
import { User } from "@/database/entities/userEntity";
import { env } from "@/common/utils/envConfig";

async function seed() {
  try {
    await SingletonDb.initialize();
    const ds = SingletonDb.getConnection();

    const roleRepo = ds.getRepository(Role);
    const userRepo = ds.getRepository(User);

    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;
    const adminUsername = "admin";
    const saltRounds = env.SALT_ROUNDS;

    console.log("Seeding admin user with email:", adminEmail);

    let adminRole = await roleRepo.findOne({ where: { name: "admin" } });
    if (!adminRole) {
      adminRole = roleRepo.create({ name: "admin" });
      await roleRepo.save(adminRole);
      console.log("Created role: admin");
    } else {
      console.log("Admin role already exists");
    }

    const existing = await userRepo.findOne({
      where: { email: adminEmail },
      relations: ["roles"],
    });

    if (existing) {
      // ensure role association exists
      const hasAdmin = (existing.roles || []).some((r) => r.name === "admin");
      if (!hasAdmin) {
        existing.roles = [...(existing.roles || []), adminRole];
        await userRepo.save(existing);
        console.log("Added admin role to existing user");
      } else {
        console.log(
          "Admin user already exists with admin role. No changes made."
        );
      }
      process.exit(0);
    }

    const hashed = await bcrypt.hash(adminPassword, saltRounds);

    const newUser = userRepo.create({
      email: adminEmail,
      password: hashed,
      roles: [adminRole],
      username: adminUsername,
    });

    await userRepo.save(newUser);

    console.log("Admin user created:", adminEmail);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", (err as Error).message);
    process.exit(1);
  }
}

seed();
