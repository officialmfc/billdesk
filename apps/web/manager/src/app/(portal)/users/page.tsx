'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { UserCreationDialog } from '@/components/users/UserCreationDialog';
import { useQuery } from '@mfc/data-access';
import { useMemo, useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  business_name: string | null;
  user_type: string;
  default_role: string;
  is_active: boolean;
  address: string | null;
  updated_at: string;
}

export default function UsersPage(): React.ReactElement {
  const [filter, setFilter] = useState<"all" | "vendor" | "business">("all");

  // Build filters based on selected filter
  const filters = useMemo(() => {
    if (filter === "all") return undefined;
    return { user_type: filter };
  }, [filter]);

  // Use useQuery with automatic caching and real-time updates
  const { data: allUsers = [], loading } = useQuery<User>('users', {
    filters,
    orderBy: { field: 'name', direction: 'asc' },
  });

  const users = allUsers;

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "vendor":
        return "bg-blue-500";
      case "business":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "seller":
        return "bg-purple-500";
      case "buyer":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage all users in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{users.length} users</Badge>
          <UserCreationDialog onSuccess={() => {
             // The useQuery hook will automatically update via realtime subscription
             // but we can also manually invalidate if needed
             console.log("User created, list should update");
          }} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "vendor" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("vendor")}
              >
                Vendors
              </Button>
              <Button
                variant={filter === "business" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("business")}
              >
                Business
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        {user.business_name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.phone}
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRoleColor(user.default_role)}
                        >
                          {user.default_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="bg-green-50">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log("View user:", user.id);
                              // TODO: Navigate to user details
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log("Edit user:", user.id);
                              // TODO: Open edit dialog
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Realtime Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Realtime updates enabled</span>
            </div>
            <p className="text-muted-foreground">
              This page automatically updates when users are added, modified, or
              deleted in the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
