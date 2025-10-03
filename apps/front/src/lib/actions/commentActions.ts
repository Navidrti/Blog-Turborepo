'use server';

import { print } from 'graphql';
import { authFetchGraphQL, fetchGraphQL } from '../fetchGraphQL';
import { CREATE_COMMENT_MUTATION, GET_POST_COMMENTS } from '../gqlQueries';
import { CommentEntity } from '../types/modelTypes';
import { CreateCommentFormState } from '../types/formState';
import { CommentFormSchema } from '../zodSchemas/commentFormSchema';
import { z } from 'zod'; // <-- needed for treeifyError

export async function getPostComments({
  postId,
  skip,
  take,
}: {
  postId: number;
  skip: number;
  take: number;
}) {
  const data = await fetchGraphQL(print(GET_POST_COMMENTS), {
    postId,
    take,
    skip,
  });
  return {
    comments: data.getPostComments as CommentEntity[],
    count: data.postCommentCount as number,
  };
}

export async function saveComment(
  state: CreateCommentFormState,
  formData: FormData
): Promise<CreateCommentFormState> {
  const validatedFields = CommentFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const treeified = z.treeifyError(validatedFields.error);

    return {
      data: Object.fromEntries(formData.entries()),
      errors: {
        content: treeified.properties?.content?.errors, // map only what you need
      },
    };
  }

  const data = await authFetchGraphQL(print(CREATE_COMMENT_MUTATION), {
    input: {
      ...validatedFields.data,
    },
  });
  if (data)
    return {
      message: 'Success! Your comment saved!',
      ok: true,
      open: false,
    };
  return {
    message: 'Oops! Something went wrong!',
    ok: false,
    open: true,
    data: Object.fromEntries(formData.entries()),
  };
}
