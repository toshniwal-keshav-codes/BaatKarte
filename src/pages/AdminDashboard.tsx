import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Users,
  MessagesSquare,
  MessageSquare,
  Shield,
  ShieldCheck,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Activity,
  History,
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
} from "lucide-react";

import { adminApi, type PublicUser, type AuditLogItem, type AdminConversationItem } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    document.title = "Admin Dashboard — BaatKarte";
  }, []);

  // ── States ───────────────────────────────────────────────────────────
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  
  const [convPage, setConvPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  // Dialogs state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<PublicUser | null>(null);
  const [deleteConvTarget, setDeleteConvTarget] = useState<AdminConversationItem | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: PublicUser; newRole: "user" | "admin" } | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", userPage, userSearch, userRoleFilter],
    queryFn: () =>
      adminApi.getUsers({
        page: userPage,
        limit: 10,
        search: userSearch,
        role: userRoleFilter,
      }),
  });

  const conversationsQuery = useQuery({
    queryKey: ["admin", "conversations", convPage],
    queryFn: () => adminApi.getConversations({ page: convPage, limit: 10 }),
  });

  const auditLogsQuery = useQuery({
    queryKey: ["admin", "audit-logs", auditPage],
    queryFn: () => adminApi.getAuditLogs({ page: auditPage, limit: 10 }),
  });

  const profileQuery = useQuery({
    queryKey: ["admin", "user-profile", selectedUserId],
    queryFn: () => (selectedUserId ? adminApi.getUserProfile(selectedUserId) : null),
    enabled: !!selectedUserId,
  });

  // ── Mutations ────────────────────────────────────────────────────────
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: (_, vars) => {
      toast.success(`User role updated to ${vars.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setRoleChangeTarget(null);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: (data) => {
      toast.success(data.message || "User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDeleteUserTarget(null);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteConversation(id),
    onSuccess: (data) => {
      toast.success(data.message || "Conversation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDeleteConvTarget(null);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const stats = statsQuery.data?.stats;

  return (
    <div className="min-h-screen bg-[#08070f] text-white flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#141422]/90 backdrop-blur-md px-4 py-3 md:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/inbox"
            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Inbox</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <Shield className="size-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Admin Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin"] })}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="size-4 mr-1.5" />
            Refresh
          </Button>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 py-1">
            Admin Mode
          </Badge>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#141422] border-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">Total Users</CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Skeleton className="h-8 w-16 bg-white/10" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
              )}
              <p className="text-xs text-white/40 mt-1">
                {stats?.adminCount ?? 0} Administrators
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#141422] border-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">Total Conversations</CardTitle>
              <MessagesSquare className="size-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Skeleton className="h-8 w-16 bg-white/10" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalConversations ?? 0}</div>
              )}
              <p className="text-xs text-white/40 mt-1">Active direct message pairs</p>
            </CardContent>
          </Card>

          <Card className="bg-[#141422] border-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">Total Messages</CardTitle>
              <MessageSquare className="size-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Skeleton className="h-8 w-16 bg-white/10" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalMessages ?? 0}</div>
              )}
              <p className="text-xs text-white/40 mt-1">Stored with 7-day TTL</p>
            </CardContent>
          </Card>

          <Card className="bg-[#141422] border-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">Active Online Users</CardTitle>
              <Activity className="size-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Skeleton className="h-8 w-16 bg-white/10" />
              ) : (
                <div className="text-2xl font-bold">{stats?.onlineUsersCount ?? 0}</div>
              )}
              <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Live socket connections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#141422] border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 rounded-lg">
              <Users className="size-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="conversations" className="data-[state=active]:bg-white/10 rounded-lg">
              <MessagesSquare className="size-4 mr-2" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="data-[state=active]:bg-white/10 rounded-lg">
              <History className="size-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: USERS ───────────────────────────────────────────────── */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-[#141422] border-white/5 text-white">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription className="text-white/50">
                    Search, view detailed profiles, grant admin access, or delete user accounts.
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search name, email, username..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <Select
                    value={userRoleFilter}
                    onValueChange={(val) => {
                      setUserRoleFilter(val);
                      setUserPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-xs">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141422] border-white/10 text-white">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/60">User</TableHead>
                      <TableHead className="text-white/60">Username</TableHead>
                      <TableHead className="text-white/60">Role</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Joined</TableHead>
                      <TableHead className="text-right text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersQuery.isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell><Skeleton className="h-10 w-36 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-white/10" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto bg-white/10" /></TableCell>
                        </TableRow>
                      ))
                    ) : usersQuery.data?.users.length === 0 ? (
                      <TableRow className="border-white/5">
                        <TableCell colSpan={6} className="h-32 text-center text-white/40">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersQuery.data?.users.map((u) => (
                        <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 border border-white/10">
                                <AvatarImage src={u.avatarUrl} />
                                <AvatarFallback className="bg-white/10 text-xs">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">{u.name}</div>
                                <div className="text-xs text-white/40">{u.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/70">@{u.username}</TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "admin" ? "default" : "secondary"}
                              className={
                                u.role === "admin"
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : "bg-white/10 text-white/60"
                              }
                            >
                              {u.role === "admin" ? (
                                <ShieldCheck className="size-3 mr-1 inline" />
                              ) : null}
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.isOnline ? (
                              <span className="inline-flex items-center text-xs text-emerald-400">
                                <span className="size-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                                Online
                              </span>
                            ) : (
                              <span className="text-xs text-white/40">Offline</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-white/40">
                            {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Details"
                                onClick={() => setSelectedUserId(u.id)}
                                className="size-8 text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Eye className="size-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                disabled={u.id === currentUser?.id}
                                onClick={() =>
                                  setRoleChangeTarget({
                                    user: u,
                                    newRole: u.role === "admin" ? "user" : "admin",
                                  })
                                }
                                className="size-8 text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 disabled:opacity-30"
                              >
                                {u.role === "admin" ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete User"
                                disabled={u.id === currentUser?.id}
                                onClick={() => setDeleteUserTarget(u)}
                                className="size-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {usersQuery.data?.pagination && (
                  <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                    <span className="text-xs text-white/40">
                      Page {usersQuery.data.pagination.page} of {usersQuery.data.pagination.pages} (
                      {usersQuery.data.pagination.total} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => p - 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage >= (usersQuery.data.pagination.pages || 1)}
                        onClick={() => setUserPage((p) => p + 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: CONVERSATIONS ───────────────────────────────────────── */}
          <TabsContent value="conversations" className="space-y-4">
            <Card className="bg-[#141422] border-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Conversations & Message Moderation</CardTitle>
                <CardDescription className="text-white/50">
                  Inspect active conversations or purge full chat history.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/60">Participants</TableHead>
                      <TableHead className="text-white/60">Last Message</TableHead>
                      <TableHead className="text-white/60">Message Count</TableHead>
                      <TableHead className="text-white/60">Last Active</TableHead>
                      <TableHead className="text-right text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversationsQuery.isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell><Skeleton className="h-8 w-40 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-white/10" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto bg-white/10" /></TableCell>
                        </TableRow>
                      ))
                    ) : conversationsQuery.data?.conversations.length === 0 ? (
                      <TableRow className="border-white/5">
                        <TableCell colSpan={5} className="h-32 text-center text-white/40">
                          No active conversations found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      conversationsQuery.data?.conversations.map((c) => (
                        <TableRow key={c.id} className="border-white/5 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {c.participants.map((p) => (
                                <div key={p.id} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 text-xs">
                                  <Avatar className="size-5">
                                    <AvatarImage src={p.avatarUrl} />
                                    <AvatarFallback className="text-[9px]">
                                      {p.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{p.name}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-white/70 max-w-xs truncate">
                            {c.lastMessage?.content || <span className="italic text-white/30">No messages</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                              {c.messageCount} msgs
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-white/40">
                            {c.lastMessageAt ? format(new Date(c.lastMessageAt), "MMM d, HH:mm") : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConvTarget(c)}
                              className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4 mr-1.5" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {conversationsQuery.data?.pagination && (
                  <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                    <span className="text-xs text-white/40">
                      Page {conversationsQuery.data.pagination.page} of {conversationsQuery.data.pagination.pages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={convPage <= 1}
                        onClick={() => setConvPage((p) => p - 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={convPage >= (conversationsQuery.data.pagination.pages || 1)}
                        onClick={() => setConvPage((p) => p + 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: AUDIT LOGS ──────────────────────────────────────────── */}
          <TabsContent value="audit-logs" className="space-y-4">
            <Card className="bg-[#141422] border-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Administrative Audit Trail</CardTitle>
                <CardDescription className="text-white/50">
                  Immutable record of security and moderation actions performed by administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/60">Timestamp</TableHead>
                      <TableHead className="text-white/60">Admin</TableHead>
                      <TableHead className="text-white/60">Action</TableHead>
                      <TableHead className="text-white/60">Target</TableHead>
                      <TableHead className="text-white/60">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogsQuery.isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-white/10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 bg-white/10" /></TableCell>
                        </TableRow>
                      ))
                    ) : auditLogsQuery.data?.auditLogs.length === 0 ? (
                      <TableRow className="border-white/5">
                        <TableCell colSpan={5} className="h-32 text-center text-white/40">
                          No audit entries logged yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogsQuery.data?.auditLogs.map((log) => (
                        <TableRow key={log._id} className="border-white/5 hover:bg-white/5 font-mono text-xs">
                          <TableCell className="text-white/50 whitespace-nowrap font-sans">
                            {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                          </TableCell>
                          <TableCell className="font-sans text-white/90">
                            {log.adminId?.name || "System"} ({log.adminId?.email || "N/A"})
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.action.startsWith("DELETE")
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-primary/10 text-primary border-primary/30"
                              }
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/70">
                            {log.targetType}: <span className="text-white/40">{log.targetId}</span>
                          </TableCell>
                          <TableCell className="text-white/60 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {auditLogsQuery.data?.pagination && (
                  <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                    <span className="text-xs text-white/40">
                      Page {auditLogsQuery.data.pagination.page} of {auditLogsQuery.data.pagination.pages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={auditPage <= 1}
                        onClick={() => setAuditPage((p) => p - 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={auditPage >= (auditLogsQuery.data.pagination.pages || 1)}
                        onClick={() => setAuditPage((p) => p + 1)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── MODAL: USER PROFILE ──────────────────────────────────────────── */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="bg-[#141422] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
            <DialogDescription className="text-white/50">
              System information and usage metrics for this user.
            </DialogDescription>
          </DialogHeader>

          {profileQuery.isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-16 w-full bg-white/10" />
              <Skeleton className="h-12 w-full bg-white/10" />
            </div>
          ) : profileQuery.data ? (
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <Avatar className="size-14 border border-white/10">
                  <AvatarImage src={profileQuery.data.user.avatarUrl} />
                  <AvatarFallback className="bg-white/10 text-base">
                    {profileQuery.data.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-lg">{profileQuery.data.user.name}</h4>
                  <p className="text-sm text-white/50">@{profileQuery.data.user.username}</p>
                  <p className="text-xs text-white/40 mt-0.5">{profileQuery.data.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profileQuery.data.metrics.conversationsCount}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">Conversations</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {profileQuery.data.metrics.messagesCount}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">Messages Sent</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-white/60">
                <div className="flex justify-between border-b border-white/5 py-1.5">
                  <span>Role Privilege:</span>
                  <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                    {profileQuery.data.user.role}
                  </Badge>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5">
                  <span>Account Status:</span>
                  <span className={profileQuery.data.user.isOnline ? "text-emerald-400 font-medium" : "text-white/40"}>
                    {profileQuery.data.user.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Joined Date:</span>
                  <span>
                    {profileQuery.data.user.createdAt
                      ? format(new Date(profileQuery.data.user.createdAt), "PPP")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: ROLE CHANGE CONFIRMATION ──────────────────────────────── */}
      <AlertDialog open={!!roleChangeTarget} onOpenChange={(open) => !open && setRoleChangeTarget(null)}>
        <AlertDialogContent className="bg-[#141422] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-amber-400" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to change the role of <strong>{roleChangeTarget?.user.name}</strong> ({roleChangeTarget?.user.email}) to <strong>{roleChangeTarget?.newRole}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roleChangeTarget) {
                  updateRoleMutation.mutate({
                    id: roleChangeTarget.user.id,
                    role: roleChangeTarget.newRole,
                  });
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── DIALOG: DELETE USER CONFIRMATION ──────────────────────────────── */}
      <AlertDialog open={!!deleteUserTarget} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <AlertDialogContent className="bg-[#141422] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action is permanent! Deleting <strong>{deleteUserTarget?.name}</strong> ({deleteUserTarget?.email}) will permanently purge their account, all initiated conversations, and sent messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteUserTarget) {
                  deleteUserMutation.mutate(deleteUserTarget.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── DIALOG: DELETE CONVERSATION CONFIRMATION ──────────────────────── */}
      <AlertDialog open={!!deleteConvTarget} onOpenChange={(open) => !open && setDeleteConvTarget(null)}>
        <AlertDialogContent className="bg-[#141422] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this conversation between{" "}
              <strong>{deleteConvTarget?.participants.map((p) => p.name).join(" & ")}</strong>? All messages inside this conversation will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConvTarget) {
                  deleteConvMutation.mutate(deleteConvTarget.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
