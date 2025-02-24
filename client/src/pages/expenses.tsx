import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Expense, ExpenseCategory } from "@shared/schema";

export default function ExpensesPage() {
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expenses/categories"],
  });

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  if (isLoadingCategories || isLoadingExpenses) {
    return (
      <div className="flex h-screen">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 p-8">
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">المصروفات</h2>
              <p className="text-muted-foreground">
                إدارة المصروفات وفئات المصروفات
              </p>
            </div>
            <div className="space-x-4 rtl:space-x-reverse">
              <Sheet>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة فئة مصروفات
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>إضافة فئة مصروفات جديدة</SheetTitle>
                    <SheetDescription>
                      قم بإدخال معلومات فئة المصروفات الجديدة
                    </SheetDescription>
                  </SheetHeader>
                  {/* Add category form will go here */}
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مصروف
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>إضافة مصروف جديد</SheetTitle>
                    <SheetDescription>
                      قم بإدخال معلومات المصروف الجديد
                    </SheetDescription>
                  </SheetHeader>
                  {/* Add expense form will go here */}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>فئات المصروفات</CardTitle>
                <CardDescription>
                  {categories.length === 0 
                    ? "لم يتم إضافة أي فئات مصروفات بعد"
                    : `${categories.length} فئات مصروفات`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد فئات مصروفات. قم بإضافة فئة جديدة باستخدام الزر أعلاه.
                  </div>
                ) : (
                  <div className="divide-y">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {category.budgetAmount && (
                          <div className="text-lg font-semibold">
                            {Number(category.budgetAmount).toLocaleString()} د.ع
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المصروفات الحالية</CardTitle>
                <CardDescription>
                  {expenses.length === 0
                    ? "لم يتم تسجيل أي مصروفات بعد"
                    : `${expenses.length} مصروفات مسجلة`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مصروفات. قم بإضافة مصروف جديد باستخدام الزر أعلاه.
                  </div>
                ) : (
                  <div className="divide-y">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{expense.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(expense.date), "PP", { locale: ar })}
                          </p>
                        </div>
                        <div className="text-lg font-semibold">
                          {Number(expense.amount).toLocaleString()} د.ع
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}