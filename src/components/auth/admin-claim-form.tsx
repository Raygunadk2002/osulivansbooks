'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function AdminClaimForm({ onSuccess }: { onSuccess: () => void }) {
  const [claimCode, setClaimCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/claim-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim admin role');
      }

      toast.success('Successfully claimed admin role!');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim admin role. Please try again.');
      console.error('Admin claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Claim Admin Role</CardTitle>
        <CardDescription>
          Enter the admin claim code to become an administrator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimCode">Admin Claim Code</Label>
            <Input
              id="claimCode"
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              placeholder="Enter admin claim code"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Claiming...' : 'Claim Admin Role'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
