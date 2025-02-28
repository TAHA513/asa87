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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
      role: "staff" as const, // تحديد النوع بشكل صريح
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 gap-8">
        <div className="flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>SAS</h1>
            <div className="w-24 h-24 mx-auto bg-black rounded-full mb-4 animate-bounce"></div>
          </div>

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
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
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
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          قوة كلمة المرور: {passwordStrength.message}
                        </div>
                        <Progress
                          value={(passwordStrength.score / 5) * 100}
                          className={`h-2 ${passwordStrength.color}`}
                        />
                      </div>
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
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
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
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          قوة كلمة المرور: {passwordStrength.message}
                        </div>
                        <Progress
                          value={(passwordStrength.score / 5) * 100}
                          className={`h-2 ${passwordStrength.color}`}
                        />
                      </div>
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
          <div className="text-9xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            SAS
          </div>
        </div>
      </div>
    </div>
  );
}