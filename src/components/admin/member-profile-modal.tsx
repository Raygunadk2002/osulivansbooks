'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  BookOpen, 
  MessageSquare, 
  Key, 
  Edit, 
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface MemberProfile {
  profile: {
    user_id: string;
    email: string;
    display_name: string | null;
    created_at: string;
  };
  member: {
    user_id: string;
    role: 'MEMBER' | 'ADMIN';
    created_at: string;
  };
  bookings: Array<{
    id: string;
    title: string | null;
    status: string;
    start_ts: string;
    end_ts: string;
    created_at: string;
  }>;
  notices: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  stats: {
    totalBookings: number;
    totalNotices: number;
    memberSince: string;
  };
}

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function MemberProfileModal({ isOpen, onClose, userId }: MemberProfileModalProps) {
  const [memberData, setMemberData] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    email: ''
  });
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const fetchMemberData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMemberData(data);
        setEditForm({
          display_name: data.profile.display_name || '',
          email: data.profile.email
        });
      } else {
        toast.error('Failed to fetch member data');
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to fetch member data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchMemberData();
    }
  }, [isOpen, userId, fetchMemberData]);

  const handleEdit = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('Member details updated successfully');
        setEditing(false);
        fetchMemberData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(`Failed to update member: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    }
  };

  const handleResetPassword = async () => {
    if (!userId) return;

    setResettingPassword(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setNewPassword(data.password);
        toast.success('Password reset successfully');
        
        if (data.emailSent) {
          toast.success('New password sent via email');
        } else if (data.emailError) {
          toast.error(`Email failed to send: ${data.emailError}`);
        }
      } else {
        const error = await response.json();
        toast.error(`Failed to reset password: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Profile
          </DialogTitle>
          <DialogDescription>
            View and manage member details, bookings, and activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading member data...</p>
          </div>
        ) : memberData ? (
          <div className="space-y-6">
            {/* Member Info Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {memberData.member.role === 'ADMIN' ? (
                        <Shield className="h-5 w-5 text-purple-500" />
                      ) : (
                        <User className="h-5 w-5 text-blue-500" />
                      )}
                      {memberData.profile.display_name || memberData.profile.email.split('@')[0]}
                    </CardTitle>
                    <CardDescription>
                      Member since {new Date(memberData.stats.memberSince).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(!editing)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editing ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      disabled={resettingPassword}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {resettingPassword ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        placeholder="Enter display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleEdit}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{memberData.profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <Badge 
                          variant={memberData.member.role === 'ADMIN' ? 'default' : 'secondary'}
                          className={memberData.member.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800 border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        >
                          {memberData.member.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {new Date(memberData.stats.memberSince).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Bookings</p>
                        <p className="text-sm text-gray-600">{memberData.stats.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                )}

                {newPassword && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Password Reset Successfully!</h4>
                    <div>
                      <span className="text-sm font-medium text-green-700">New Password:</span>
                      <span className="ml-2 font-mono text-sm bg-yellow-100 px-2 py-1 rounded border text-yellow-800">
                        {newPassword}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      This password has been sent to the user via email.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bookings History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Booking History ({memberData.stats.totalBookings})
                </CardTitle>
                <CardDescription>
                  All booking requests made by this member
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberData.bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings found</p>
                    <p className="text-sm">This member hasn&apos;t made any booking requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberData.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(booking.status)}
                          <div>
                            <h4 className="font-medium">
                              {booking.title || 'Untitled Booking'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.start_ts).toLocaleDateString()} - {new Date(booking.end_ts).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notices Created */}
            {memberData.stats.totalNotices > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notices Created ({memberData.stats.totalNotices})
                  </CardTitle>
                  <CardDescription>
                    Notices posted by this member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memberData.notices.map((notice) => (
                      <div key={notice.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{notice.title}</h4>
                        <p className="text-sm text-gray-500">
                          Posted {new Date(notice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Failed to load member data</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
