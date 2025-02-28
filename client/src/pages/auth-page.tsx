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
  CardDescription,
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Logo Side */}
        <div className="hidden md:flex flex-col items-center justify-center p-8">
          <div className="text-9xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient" 
               style={{ fontFamily: 'Cairo, sans-serif' }}>
            SAS
          </div>
          <div className="text-2xl text-center text-muted-foreground font-semibold max-w-md"
               style={{ fontFamily: 'Cairo, sans-serif' }}>
            نظام إدارة الأعمال المتكامل
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center md:hidden mb-8">
            <h1 className="text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
                style={{ fontFamily: 'Cairo, sans-serif' }}>
              SAS
            </h1>
          </div>

          <Card className="backdrop-blur-sm bg-card/95 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {activeTab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login" 
                  ? "مرحباً بعودتك! قم بتسجيل الدخول للمتابعة" 
                  : "قم بإنشاء حساب جديد للبدء"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="register">حساب جديد</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
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
                              <Input {...field} className="bg-background/50" />
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
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  className="bg-background/50"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePasswordChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-auto py-1"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
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

                <TabsContent value="register" className="mt-0">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) =>
                        registerMutation.mutate(data, {
                          onSuccess: onRegisterSuccess,
                        })
                      )}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-background/50" />
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
                                <Input {...field} className="bg-background/50" />
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
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    className="bg-background/50"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handlePasswordChange(e.target.value);
                                    }}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute left-2 top-1/2 -translate-y-1/2 h-auto py-1"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="mt-2">
                                <div className="text-sm text-muted-foreground">
                                  قوة كلمة المرور: {passwordStrength.message}
                                </div>
                                <Progress
                                  value={(passwordStrength.score / 5) * 100}
                                  className={cn("h-1", passwordStrength.color)}
                                />
                              </div>
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
                                  className="bg-background/50"
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
                                  className="bg-background/50"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        )}
                        إنشاء حساب
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}