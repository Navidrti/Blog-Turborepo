'use client';

import { updatePost } from '@/lib/actions/postActions';
import { useActionState } from 'react';
import UpsertPostForm from '@/app/user/create-post/_components/upsertPostForm';
import { Post } from '@/lib/types/modelTypes';

type Props = {
  post: Post;
};

const UpdatePostContainer = ({ post }: Props) => {
  const [state, action] = useActionState(
    updatePost as (state: any, payload: FormData) => Promise<any>,
    {
      data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        published: !!post.published,
        tags: post.tags?.map((tag) => tag.name).join(','),
        previousThumbnailUrl: post.thumbnail ?? undefined,
      },
    }
  );

  return <UpsertPostForm state={state} formAction={action} />;
};

export default UpdatePostContainer;
