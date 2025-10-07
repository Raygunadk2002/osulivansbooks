'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pin, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Notice {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
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

export default function NoticeboardPage() {
  const { user, signOut } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', body: '' });

  useEffect(() => {
    checkMembership();
  }, []);

  const checkMembership = async () => {
    try {
      const response = await fetch('/api/membership');
      if (response.ok) {
        const data = await response.json();
        setMember(data.member);
        fetchNotices();
      } else {
        toast.error('Membership required');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to check membership:', error);
      toast.error('Failed to verify membership');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      toast.error('Failed to load notices');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotice),
      });

      if (response.ok) {
        toast.success('Notice created successfully');
        setShowCreateModal(false);
        setNewNotice({ title: '', body: '' });
        fetchNotices();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create notice');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create notice');
      console.error('Create notice error:', error);
    }
  };

  const handlePinNotice = async (noticeId: string, pinned: boolean) => {
    try {
      const action = pinned ? 'unpin' : 'pin';
      const response = await fetch(`/api/admin/notices/${noticeId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Notice ${pinned ? 'unpinned' : 'pinned'} successfully`);
        fetchNotices();
      } else {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} notice`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${pinned ? 'unpin' : 'pin'} notice`);
      console.error('Pin notice error:', error);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notices/${noticeId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Notice deleted successfully');
        fetchNotices();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete notice');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete notice');
      console.error('Delete notice error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Membership required</p>
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
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold">Noticeboard</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">House Notices</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Notice
          </Button>
        </div>

        {notices.length > 0 ? (
          <div className="space-y-4">
            {notices.map((notice) => (
              <Card key={notice.id} className={notice.pinned ? 'border-blue-200 bg-blue-50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center">
                        {notice.pinned && <Pin className="h-4 w-4 mr-2 text-blue-600" />}
                        {notice.title}
                      </CardTitle>
                      <CardDescription>
                        by {notice.profiles?.display_name || notice.profiles?.email} • {formatDate(notice.created_at)}
                      </CardDescription>
                    </div>
                    {member.role === 'ADMIN' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePinNotice(notice.id, notice.pinned)}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteNotice(notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {notice.body}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notices yet</h3>
              <p className="text-gray-500 mb-4">Be the first to post a notice for the house</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Notice
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Notice Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notice</DialogTitle>
            <DialogDescription>
              Share information with other house members
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notice title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={newNotice.body}
                onChange={(e) => setNewNotice(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your message here..."
                rows={6}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Post Notice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
