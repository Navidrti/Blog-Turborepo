'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deletePost } from '@/lib/actions/postActions';
import { AlertDialogAction } from '@radix-ui/react-alert-dialog';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const InterceptorDeletePostPage = (props: Props) => {
  const params = use(props.params);
  const postId = parseInt(params.id);
  const router = useRouter();

  const [open, setOpen] = useState(true); // 👈 control modal open/close

  const handleDelete = async () => {
    await deletePost(postId);
    setOpen(false); // 👈 close modal
    router.refresh(); // refresh posts
    router.push('/user/posts'); // navigate back
  };

  const handleCancel = () => {
    setOpen(false); // 👈 close modal
    router.push('/user/posts'); // navigate back
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete This Post!</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InterceptorDeletePostPage;
