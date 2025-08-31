import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBudgetSchema, insertCategorySchema, insertBudgetAllocationSchema, insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Budget routes
  app.get("/api/budget/:month", async (req, res) => {
    try {
      const budget = await storage.getBudget(req.params.month);
      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budget", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      res.json(budget);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/budget/:id", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(req.params.id, validatedData);
      res.json(budget);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Budget allocation routes
  app.get("/api/budget/:budgetId/allocations", async (req, res) => {
    try {
      const allocations = await storage.getBudgetAllocations(req.params.budgetId);
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budget/:budgetId/allocations", async (req, res) => {
    try {
      const validatedData = insertBudgetAllocationSchema.parse({
        ...req.body,
        budgetId: req.params.budgetId,
      });
      const allocation = await storage.createBudgetAllocation(validatedData);
      res.json(allocation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/allocations/:id", async (req, res) => {
    try {
      const validatedData = insertBudgetAllocationSchema.partial().parse(req.body);
      const allocation = await storage.updateBudgetAllocation(req.params.id, validatedData);
      res.json(allocation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Expense routes
  app.get("/api/budget/:budgetId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(req.params.budgetId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budget/:budgetId/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        budgetId: req.params.budgetId,
        date: new Date(req.body.date),
      });
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/budget/:budgetId/categories-with-allocations", async (req, res) => {
    try {
      const categories = await storage.getCategoriesWithAllocations(req.params.budgetId);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/budget/:budgetId/summary", async (req, res) => {
    try {
      const summary = await storage.getBudgetSummary(req.params.budgetId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
