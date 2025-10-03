'use client';

import { saveNewPost } from '@/lib/actions/postActions';
import { useActionState } from 'react';
import UpsertPostForm from './upsertPostForm';
import { PostFormState } from '@/lib/types/formState';

const CreatePostContainer = () => {
  const initialState: PostFormState = {
    data: {
      title: '',
      content: '',
      published: false,
      tags: [], // <-- must be string[]
    },
  };

  const [state, action] = useActionState(saveNewPost, initialState);

  return <UpsertPostForm state={state} formAction={action} />;
};

export default CreatePostContainer;
