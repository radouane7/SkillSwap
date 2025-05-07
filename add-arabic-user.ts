import { db } from "./server/db";
import { users, userSkills, skills } from "./shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./server/auth";

async function main() {
  try {
    // Trouver l'ID de la compétence Arabe
    const arabeSkill = await db.select().from(skills).where(eq(skills.name, "Arabe")).limit(1);
    
    if (!arabeSkill.length) {
      console.log("Compétence Arabe non trouvée");
      return;
    }
    
    const arabeSkillId = arabeSkill[0].id;
    console.log("ID de la compétence Arabe:", arabeSkillId);
    
    // Créer un nouvel utilisateur
    const hashedPassword = await hashPassword("password123");
    
    const [newUser] = await db.insert(users).values({
      username: "karim.hassan",
      email: "karim.hassan@example.com",
      password: hashedPassword,
      firstName: "Karim",
      lastName: "Hassan",
      bio: "Professeur d'arabe et traducteur, passionné de littérature et de culture arabe.",
      location: "Lyon",
      profileImage: "/avatars/avatar9.jpg",
      rating: 5,
      reviewCount: 15,
      verified: true,
      subscriptionStatus: "free",
      monthlyProposalCount: 0,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionExpiresAt: null
    }).returning();
    
    console.log("Nouvel utilisateur créé:", newUser);
    
    // Ajouter la compétence en arabe à l'utilisateur
    const [userSkill] = await db.insert(userSkills).values({
      userId: newUser.id,
      skillId: arabeSkillId,
      isOffered: true,
      experienceLevel: "expert",
      description: "J'enseigne l'arabe depuis plus de 10 ans. Je peux vous aider avec l'arabe littéraire et dialectal."
    }).returning();
    
    console.log("Compétence en arabe ajoutée:", userSkill);
    
    console.log("Opération réussie! Nouvel utilisateur ID:", newUser.id);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
  } finally {
    process.exit(0);
  }
}

main();