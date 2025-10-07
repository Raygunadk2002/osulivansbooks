'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, User, Shield, Mail, Calendar, Search, Filter, Users, UserPlus, Eye } from 'lucide-react';
import { MemberProfileModal } from './member-profile-modal';

interface User {
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  members: Array<{
    role: 'MEMBER' | 'ADMIN';
    created_at: string;
  }>;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MEMBER' | 'ADMIN'>('ALL');
  const [newUser, setNewUser] = useState({
    email: '',
    display_name: '',
    role: 'MEMBER' as 'MEMBER' | 'ADMIN'
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberProfile, setShowMemberProfile] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, filterUsers]);

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.members[0]?.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email) {
      toast.error('Email is required');
      return;
    }

    setIsCreating(true);
    setGeneratedPassword(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store the generated password to show in the dialog
        if (data.password) {
          setGeneratedPassword(data.password);
        }
        
        // Show success message
        toast.success(data.message);
        
        // Show email status
        if (data.emailSent) {
          toast.success('Welcome email sent to user');
        } else if (data.emailError) {
          toast.error(`Email failed to send: ${data.emailError}`);
        }
        
        fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Failed to create user';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'MEMBER' | 'ADMIN') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Failed to update role';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`User ${email} deleted successfully`);
        fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Failed to delete user';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleIcon = (role: 'MEMBER' | 'ADMIN') => {
    return role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };


  const closeDialog = () => {
    setShowCreateForm(false);
    setNewUser({ email: '', display_name: '', role: 'MEMBER' });
    setGeneratedPassword(null);
    setIsCreating(false);
  };

  const openMemberProfile = (userId: string) => {
    setSelectedMemberId(userId);
    setShowMemberProfile(true);
  };

  const closeMemberProfile = () => {
    setShowMemberProfile(false);
    setSelectedMemberId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-gray-600 mt-1">Manage house members and their permissions</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="h-4 w-4" />
              Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New House Member</DialogTitle>
              <DialogDescription>
                Create a new user account for house access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="member@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'MEMBER' | 'ADMIN') => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {generatedPassword && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Member Created Successfully!</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-green-700">Email:</span>
                      <span className="ml-2 font-mono text-sm bg-white px-2 py-1 rounded border">{newUser.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-green-700">Password:</span>
                      <span className="ml-2 font-mono text-sm bg-yellow-100 px-2 py-1 rounded border text-yellow-800">{generatedPassword}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    This password has been sent to the user via email. They can change it after their first login.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={createUser} 
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Member'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeDialog}
                  disabled={isCreating}
                >
                  {generatedPassword ? 'Close' : 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={(value: 'ALL' | 'MEMBER' | 'ADMIN') => setRoleFilter(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="MEMBER">Members</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                House Members
                <Badge variant="secondary" className="ml-2">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
                </Badge>
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading members...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || roleFilter !== 'ALL' ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first house member to get started'
                }
              </p>
              {!searchTerm && roleFilter === 'ALL' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => openMemberProfile(user.user_id)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                      {getRoleIcon(user.members[0]?.role || 'MEMBER')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {user.display_name || user.email.split('@')[0]}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Role Badge */}
                    <Badge 
                      variant={user.members[0]?.role === 'ADMIN' ? 'default' : 'secondary'}
                      className={`px-3 py-1 text-sm font-medium ${
                        user.members[0]?.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800 border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {user.members[0]?.role || 'MEMBER'}
                    </Badge>
                    
                    {/* View Profile Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMemberProfile(user.user_id);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* Role Selector */}
                    <Select 
                      value={user.members[0]?.role || 'MEMBER'} 
                      onValueChange={(value: 'MEMBER' | 'ADMIN') => updateUserRole(user.user_id, value)}
                    >
                      <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Delete Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(user.user_id, user.email);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Profile Modal */}
      <MemberProfileModal
        isOpen={showMemberProfile}
        onClose={closeMemberProfile}
        userId={selectedMemberId}
      />
    </div>
  );
}
