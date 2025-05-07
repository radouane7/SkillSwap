import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
  // Exécuter une requête SQL directe pour trouver les utilisateurs avec des compétences en langues
  const result = await db.execute(sql`
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      s.name as skill_name
    FROM 
      users u
      JOIN user_skills us ON u.id = us.user_id
      JOIN skills s ON us.skill_id = s.id
      JOIN skill_categories sc ON s.category_id = sc.id
    WHERE 
      sc.name = 'Langues'
      AND us.is_offered = true
    ORDER BY 
      u.id, s.name
  `);
  
  // Organiser les résultats par utilisateur
  const userMap = new Map();
  
  for (const row of result) {
    const userId = row.id;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: userId,
        username: row.username,
        email: row.email,
        skills: [row.skill_name]
      });
    } else {
      const user = userMap.get(userId);
      if (!user.skills.includes(row.skill_name)) {
        user.skills.push(row.skill_name);
      }
    }
  }
  
  // Convertir en tableau pour affichage
  const users = Array.from(userMap.values());
  console.log("Utilisateurs avec des compétences en Langues:", users);
}

main().catch(console.error).finally(() => process.exit(0));