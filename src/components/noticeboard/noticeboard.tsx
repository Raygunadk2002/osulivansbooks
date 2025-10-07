'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Pin, 
  PinOff, 
  Trash2, 
  MessageSquare, 
  Clock, 
  User, 
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string;
  };
}

interface NoticeboardProps {
  isAdmin: boolean;
}

export function Noticeboard({ isAdmin }: NoticeboardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState({
    title: '',
    body: ''
  });
  const [editNotice, setEditNotice] = useState({
    title: '',
    body: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      } else {
        toast.error('Failed to fetch notices');
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const createNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.body.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotice),
      });

      if (response.ok) {
        await response.json();
        toast.success('Notice created successfully');
        setNewNotice({ title: '', body: '' });
        setShowCreateDialog(false);
        fetchNotices();
      } else {
        const error = await response.json();
        toast.error(`Failed to create notice: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error('Failed to create notice');
    }
  };

  const togglePin = async (noticeId: string, pinned: boolean) => {
    try {
      const endpoint = pinned ? 'unpin' : 'pin';
      const response = await fetch(`/api/admin/notices/${noticeId}/${endpoint}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Notice ${pinned ? 'unpinned' : 'pinned'} successfully`);
        fetchNotices();
      } else {
        const error = await response.json();
        toast.error(`Failed to ${pinned ? 'unpin' : 'pin'} notice: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update notice');
    }
  };

  const deleteNotice = async (noticeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
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
        const error = await response.json();
        toast.error(`Failed to delete notice: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setEditNotice({
      title: notice.title,
      body: notice.body
    });
    setShowEditDialog(true);
  };

  const updateNotice = async () => {
    if (!editingNotice || !editNotice.title.trim() || !editNotice.body.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await fetch(`/api/notices/${editingNotice.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editNotice),
      });

      if (response.ok) {
        await response.json();
        toast.success('Notice updated successfully');
        setEditNotice({ title: '', body: '' });
        setEditingNotice(null);
        setShowEditDialog(false);
        fetchNotices();
      } else {
        const error = await response.json();
        toast.error(`Failed to update notice: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('Failed to update notice');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const isNewNotice = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // New if less than 24 hours old
  };

  const getNoticeIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('urgent') || lowerTitle.includes('important')) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (lowerTitle.includes('update') || lowerTitle.includes('news')) return <Info className="h-5 w-5 text-blue-500" />;
    if (lowerTitle.includes('success') || lowerTitle.includes('completed')) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (lowerTitle.includes('warning') || lowerTitle.includes('issue')) return <XCircle className="h-5 w-5 text-orange-500" />;
    return <MessageSquare className="h-5 w-5 text-gray-500" />;
  };

  const pinnedNotices = notices.filter(notice => notice.pinned);
  const regularNotices = notices.filter(notice => !notice.pinned);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Noticeboard
          </h2>
          <p className="text-gray-600 mt-1">Stay updated with house news and announcements</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>
                Share important information with all house members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="Enter notice title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="body"
                  value={newNotice.body}
                  onChange={(e) => setNewNotice({ ...newNotice, body: e.target.value })}
                  placeholder="Enter notice content..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={createNotice} className="flex-1">
                  Create Notice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Notice Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
              <DialogDescription>
                Update the notice title and content below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editNotice.title}
                  onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
                  placeholder="Enter notice title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-body"
                  value={editNotice.body}
                  onChange={(e) => setEditNotice({ ...editNotice, body: e.target.value })}
                  placeholder="Enter notice content..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={updateNotice} className="flex-1">
                  Update Notice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notices yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share something with the house!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Notice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notices */}
          {pinnedNotices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">Pinned Notices</h3>
                <div className="h-px bg-gradient-to-r from-yellow-400 to-transparent flex-1"></div>
              </div>
              <div className="grid gap-4">
                {pinnedNotices.map((notice) => (
                  <Card key={notice.id} className="border-l-4 border-l-yellow-400 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getNoticeIcon(notice.title)}
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {notice.title}
                              {isNewNotice(notice.created_at) && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  NEW
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notice.profiles?.display_name || notice.profiles?.email || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(notice.created_at)}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(notice)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePin(notice.id, true)}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <PinOff className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteNotice(notice.id, notice.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{notice.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Notices */}
          {regularNotices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">Recent Notices</h3>
                <div className="h-px bg-gradient-to-r from-blue-400 to-transparent flex-1"></div>
              </div>
              <div className="grid gap-4">
                {regularNotices.map((notice) => (
                  <Card key={notice.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getNoticeIcon(notice.title)}
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {notice.title}
                              {isNewNotice(notice.created_at) && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  NEW
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notice.profiles?.display_name || notice.profiles?.email || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(notice.created_at)}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(notice)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePin(notice.id, false)}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <Pin className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteNotice(notice.id, notice.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{notice.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
