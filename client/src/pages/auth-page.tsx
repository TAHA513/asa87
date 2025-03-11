
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PasswordStrength = {
  score: number;
  message: string;
  color: string;
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  let message = "ضعيف جداً";
  let color = "bg-red-500";

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      message = "ضعيف جداً";
      color = "bg-red-500";
      break;
    case 2:
      message = "ضعيف";
      color = "bg-orange-500";
      break;
    case 3:
      message = "متوسط";
      color = "bg-yellow-500";
      break;
    case 4:
      message = "قوي";
      color = "bg-lime-500";
      break;
    case 5:
      message = "قوي جداً";
      color = "bg-green-500";
      break;
  }

  return { score, message, color };
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    message: "ضعيف جداً",
    color: "bg-red-500",
  });

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
      role: "staff" as const,
      permissions: [],
    },
  });

  const onRegisterSuccess = () => {
    registerForm.reset();
    setActiveTab("login");
  };

  const handlePasswordChange = (value: string) => {
    setPasswordStrength(getPasswordStrength(value));
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* أشكال زخرفية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl transform translate-x-1/4 translate-y-1/4 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* شكل شبكي خلفي */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
             }}
        />
      </div>

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 items-center relative z-10">
        {/* جانب الشعار */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border border-border/50">
          <div className="text-9xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient" 
               style={{ fontFamily: 'Cairo, sans-serif' }}>
            SAS
          </div>
          <div className="text-2xl text-center text-foreground font-semibold max-w-md animate-fade-in"
               style={{ fontFamily: 'Cairo, sans-serif' }}>
            نظام إدارة الأعمال المتكامل
          </div>
          
          {/* ميزات النظام */}
          <div className="mt-8 w-full space-y-2 animate-fade-in-delayed">
            {[
              "إدارة المبيعات والمخزون",
              "تحليلات أداء الأعمال",
              "إدارة العملاء والموردين",
              "تقارير مالية متقدمة"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="rounded-full bg-primary/10 p-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* جانب النموذج */}
        <div className="w-full">
          <Card className="w-full backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="md:hidden flex justify-center mb-4">
                <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient"
                    style={{ fontFamily: 'Cairo, sans-serif' }}>
                  SAS
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">مرحباً بك</CardTitle>
              <CardDescription>
                {activeTab === "login" ? "قم بتسجيل الدخول للوصول إلى حسابك" : "أنشئ حساب جديد للبدء"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="register">حساب جديد</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((data) => {
                        loginMutation.mutate(data);
                      })}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المستخدم" {...field} />
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
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="أدخل كلمة المرور"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 h-8 w-8 transform -translate-y-1/2 p-0"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {loginMutation.isError && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {loginMutation.error instanceof Error
                              ? loginMutation.error.message
                              : "حدث خطأ أثناء تسجيل الدخول"}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) => {
                        registerMutation.mutate(data, {
                          onSuccess: onRegisterSuccess,
                        });
                      })}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الاسم الكامل</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل الاسم الكامل" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل اسم المستخدم" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="أدخل البريد الإلكتروني"
                                  {...field}
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
                                <Input placeholder="أدخل رقم الهاتف" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="أدخل كلمة المرور"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePasswordChange(e.target.value);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 h-8 w-8 transform -translate-y-1/2 p-0"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${passwordStrength.color} transition-all`}
                                    style={{
                                      width: `${(passwordStrength.score / 5) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs">{passwordStrength.message}</span>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {registerMutation.isError && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {registerMutation.error instanceof Error
                              ? registerMutation.error.message
                              : "حدث خطأ أثناء إنشاء الحساب"}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* تذييل الصفحة */}
      <div className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SAS - جميع الحقوق محفوظة
      </div>
    </div>
  );
}
