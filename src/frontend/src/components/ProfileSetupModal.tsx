import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      // Save a minimal profile with empty fields - the interview will collect the actual data
      await saveProfile.mutateAsync({
        hobbies: [],
        careerGoals: '', // Keep this empty so the interview starts fresh
        education: '',
        workHistory: '',
        skills: [],
      });
      toast.success(`Welcome ${name}! Let's discover your ideal career path.`);
      // Close modal after successful save
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Allow closing the modal
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          // Allow escape key to close
          handleOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Welcome to CareerPath AI</DialogTitle>
          <DialogDescription>Let's get started by learning your name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
