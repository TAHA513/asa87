import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Users } from "lucide-react";
import type { User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";


export default function Staff() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      await apiRequest("POST", "/api/change-password", {
        currentPassword,
        newPassword,
      });

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Users className="h-6 w-6" />
              <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
            </div>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">كلمة المرور الحالية</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  Manage your staff and their roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Role</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Recent activity from staff members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 text-sm">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-muted-foreground">Logged in 2 hours ago</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}