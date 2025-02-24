import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm({
    resolver: zodResolver(
      insertUserSchema.pick({
        username: true,
        password: true,
      })
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      role: "staff",
      permissions: [],
    },
  });

  const onRegisterSuccess = () => {
    registerForm.reset();
    setActiveTab("login");
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            نظام إدارة الأعمال
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            حل متكامل لإدارة أعمالك يشمل المبيعات والمخزون وإدارة الموظفين
          </p>

          <Card>
            <CardHeader>
              <CardTitle>تسجيل الدخول / إنشاء حساب</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="register">تسجيل جديد</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((data) =>
                        loginMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        )}
                        تسجيل الدخول
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) =>
                        registerMutation.mutate(data, {
                          onSuccess: onRegisterSuccess,
                        })
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        )}
                        تسجيل جديد
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">المميزات الرئيسية</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>إدارة المبيعات الشاملة</li>
              <li>تتبع المخزون</li>
              <li>دعم العملات المتعددة (USD/IQD)</li>
              <li>إدارة الموظفين</li>
              <li>لوحة التحليلات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}