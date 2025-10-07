'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateForDisplay, formatDateRange } from '@/lib/gaps';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Clock, Shield, Calendar, Users, MessageSquare, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface PendingBooking {
  id: string;
  status: string;
  start_ts: string;
  end_ts: string;
  title: string;
  notes: string;
  created_at: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface Member {
  user_id: string;
  role: string;
}

interface Settings {
  house_name: string;
  join_code: string;
  admin_claim_code: string;
  ics_token: string;
}

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [blockData, setBlockData] = useState({ startDate: '', endDate: '', title: '' });
  const [visitData, setVisitData] = useState({ startDate: '', endDate: '', title: '', notes: '' });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/membership');
      if (response.ok) {
        const data = await response.json();
        if (data.member?.role === 'ADMIN') {
          setMember(data.member);
          setSettings(data.settings);
          fetchPendingBookings();
        } else {
          toast.error('Admin access required');
          window.location.href = '/';
        }
      } else {
        toast.error('Authentication required');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      toast.error('Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch('/api/admin/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch pending bookings:', error);
      toast.error('Failed to load pending bookings');
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject' | 'hold') => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Booking ${action}d successfully`);
        fetchPendingBookings();
      } else {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} booking`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} booking`);
      console.error(`${action} booking error:`, error);
    }
  };

  const handleBlockPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        toast.success('Blocked period created successfully');
        setShowBlockModal(false);
        setBlockData({ startDate: '', endDate: '', title: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create blocked period');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create blocked period');
      console.error('Block period error:', error);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      if (response.ok) {
        toast.success('Visit created successfully');
        setShowVisitModal(false);
        setVisitData({ startDate: '', endDate: '', title: '', notes: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create visit');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create visit');
      console.error('Create visit error:', error);
    }
  };

  const rotateICSToken = async () => {
    try {
      const response = await fetch('/api/admin/rotate-ics', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => prev ? { ...prev, ics_token: data.newToken } : null);
        toast.success('ICS token rotated successfully');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rotate ICS token');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rotate ICS token');
      console.error('Rotate ICS token error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!member || member.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin access required</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <Badge variant="destructive">Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Bookings
              </CardTitle>
              <CardDescription>
                Review and approve/reject booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">
                            {booking.title || 'Untitled Booking'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {booking.profiles?.display_name || booking.profiles?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateRange(new Date(booking.start_ts), new Date(booking.end_ts))}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{booking.status}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'approve')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'hold')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Hold
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending bookings</p>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Manage house settings and create maintenance periods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() => setShowBlockModal(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Block Period
              </Button>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowVisitModal(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={rotateICSToken}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rotate ICS Token
              </Button>
            </CardContent>
          </Card>

          {/* House Settings */}
          <Card>
            <CardHeader>
              <CardTitle>House Settings</CardTitle>
              <CardDescription>
                Current house configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>House Name</Label>
                <p className="text-sm text-gray-600">{settings?.house_name}</p>
              </div>
              <div>
                <Label>Join Code</Label>
                <p className="text-sm text-gray-600 font-mono">
                  {settings?.join_code ? '••••••••••••' : 'Not set'}
                </p>
              </div>
              <div>
                <Label>Admin Claim Code</Label>
                <p className="text-sm text-gray-600 font-mono">
                  {settings?.admin_claim_code ? '••••••••••••' : 'Not set'}
                </p>
              </div>
              <div>
                <Label>ICS Token</Label>
                <p className="text-sm text-gray-600 font-mono">
                  {settings?.ics_token ? settings.ics_token.substring(0, 8) + '...' : 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Block Period Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Period</DialogTitle>
            <DialogDescription>
              Create a blocked period for maintenance or other reasons
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBlockPeriod} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blockTitle">Title</Label>
              <Input
                id="blockTitle"
                value={blockData.title}
                onChange={(e) => setBlockData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Maintenance"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blockStart">Start Date</Label>
                <Input
                  id="blockStart"
                  type="date"
                  value={blockData.startDate}
                  onChange={(e) => setBlockData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blockEnd">End Date</Label>
                <Input
                  id="blockEnd"
                  type="date"
                  value={blockData.endDate}
                  onChange={(e) => setBlockData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Block Period</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Modal */}
      <Dialog open={showVisitModal} onOpenChange={setShowVisitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Visit</DialogTitle>
            <DialogDescription>
              Schedule a maintenance or inspection visit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVisit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitTitle">Title</Label>
              <Input
                id="visitTitle"
                value={visitData.title}
                onChange={(e) => setVisitData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Annual Inspection"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitStart">Start Date</Label>
                <Input
                  id="visitStart"
                  type="date"
                  value={visitData.startDate}
                  onChange={(e) => setVisitData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitEnd">End Date</Label>
                <Input
                  id="visitEnd"
                  type="date"
                  value={visitData.endDate}
                  onChange={(e) => setVisitData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitNotes">Notes (optional)</Label>
              <Textarea
                id="visitNotes"
                value={visitData.notes}
                onChange={(e) => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVisitModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule Visit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
