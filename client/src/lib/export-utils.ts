import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense, Category } from "@/types";
import { format } from "date-fns";

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateCSV = (expenses: Expense[], categories: Category[]): string => {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((expense) => {
    const category = categories.find((c) => c.id === expense.categoryId);
    // Escape quotes in description
    const description = (expense.description || "").replace(/"/g, '""');
    return [
      format(new Date(expense.date), "yyyy-MM-dd"),
      category ? category.name : "Uncategorized",
      `"${description}"`,
      expense.amount,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
};

export const generatePDF = (expenses: Expense[], categories: Category[]) => {
  const doc = new jsPDF();

  const tableColumn = ["Date", "Category", "Description", "Amount"];
  const tableRows: any[] = [];

  // Sort by date descending
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedExpenses.forEach((expense) => {
    const category = categories.find((c) => c.id === expense.categoryId);
    const expenseData = [
      format(new Date(expense.date), "yyyy-MM-dd"),
      category ? category.name : "Uncategorized",
      expense.description || "",
      expense.amount,
    ];
    tableRows.push(expenseData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    headStyles: { fillColor: [41, 128, 185] }, // Blue header
  });

  doc.text("Expense Report", 14, 15);
  doc.save(`budget-buddy-expenses-${new Date().toISOString().slice(0, 10)}.pdf`);
};
