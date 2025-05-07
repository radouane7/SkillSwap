import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { migrateSubscriptionFields, migrateExchangeFields } from "./migrations";
import { migrateFirebaseFields } from "./migrations/20250410_add_firebase_fields";
import { addCountryCityFields } from "./migrations/add-country-city-fields";
import { addNotificationsTable } from "./migrations/add-notifications-table";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Exécuter les migrations avant de démarrer le serveur
  try {
    await migrateSubscriptionFields();
    console.log("Migration des champs d'abonnement réussie");
  } catch (error) {
    console.error("Erreur lors de la migration des champs d'abonnement:", error);
  }
  
  try {
    await migrateExchangeFields();
    console.log("Migration des champs d'échange réussie");
  } catch (error) {
    console.error("Erreur lors de la migration des champs d'échange:", error);
  }
  
  try {
    await migrateFirebaseFields();
    console.log("Migration des champs Firebase réussie");
  } catch (error) {
    console.error("Erreur lors de la migration des champs Firebase:", error);
  }
  
  try {
    await addCountryCityFields();
    console.log("Migration des champs pays/ville réussie");
  } catch (error) {
    console.error("Erreur lors de la migration des champs pays/ville:", error);
  }
  
  try {
    await addNotificationsTable();
    console.log("Migration de la table notifications réussie");
  } catch (error) {
    console.error("Erreur lors de la migration de la table notifications:", error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
