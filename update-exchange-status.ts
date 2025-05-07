import { db } from './server/db';
import { exchanges } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateExchangeStatus() {
  try {
    // ID de l'échange à mettre à jour (basé sur les logs, l'ID est 9)
    const exchangeId = 9;
    
    // Mettre à jour le statut de l'échange à "accepted"
    const result = await db.update(exchanges)
      .set({ status: "accepted" })
      .where(eq(exchanges.id, exchangeId))
      .returning();
    
    if (result.length > 0) {
      console.log(`Échange ID ${exchangeId} a été mis à jour avec succès au statut "accepted"`);
      console.log("Détails de l'échange:", result[0]);
    } else {
      console.log(`Aucun échange trouvé avec l'ID ${exchangeId}`);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'échange:", error);
  }
}

// Exécuter la fonction
updateExchangeStatus().catch(console.error);