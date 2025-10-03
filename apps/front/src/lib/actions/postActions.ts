'use server';

import { print } from 'graphql';
import { authFetchGraphQL, fetchGraphQL } from '../fetchGraphQL';
import {
  CREATE_POST_MUTATION,
  DELETE_POST_MUTATION,
  GET_POST_BY_ID,
  GET_POSTS,
  GET_USER_POSTS,
  UPDATE_POST_MUTATION,
} from '../gqlQueries';
import { Post } from '../types/modelTypes';
import { transformTakeSkip } from '../helpers';
import { PostFormState } from '../types/formState';
import { PostFormSchema } from '../zodSchemas/postFormSchema';
import { z } from 'zod';
import { uploadThumbnail } from '../upload';

// fetch all posts
export const fetchPosts = async ({
  page,
  pageSize,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const { skip, take } = transformTakeSkip({ page, pageSize });
  const data = await fetchGraphQL(print(GET_POSTS), { skip, take });

  return { posts: data.posts as Post[], totalPosts: data.postCount };
};

// fetch post by id
export const fetchPostById = async (id: number) => {
  const data = await fetchGraphQL(print(GET_POST_BY_ID), { id });

  return data.getPostById as Post;
};

// fetch user posts
export async function fetchUserPosts({
  page,
  pageSize,
}: {
  page?: number;
  pageSize: number;
}) {
  const { take, skip } = transformTakeSkip({ page, pageSize });

  const data = await authFetchGraphQL(print(GET_USER_POSTS), {
    take,
    skip,
  });

  return {
    posts: data.getUserPosts as Post[],
    totalPosts: data.userPostCount as number,
  };
}

export async function saveNewPost(
  state: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const validatedFields = PostFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);

    // Map tree.properties to the flat { field: string[] } shape your PostFormState expects
    const errors: Record<string, string[]> = {};
    if (tree.properties) {
      for (const [key, value] of Object.entries(tree.properties)) {
        if (value && 'errors' in value) {
          errors[key] = value.errors;
        }
      }
    }

    return {
      data: Object.fromEntries(formData.entries()),
      errors,
    };
  }

  let thumbnailUrl = '';

  if (validatedFields.data.thumbnail)
    thumbnailUrl = await uploadThumbnail(validatedFields.data.thumbnail);

  // Todo: call GraphQL api

  const data = await authFetchGraphQL(print(CREATE_POST_MUTATION), {
    input: {
      ...validatedFields.data,
      thumbnail: thumbnailUrl,
    },
  });

  if (data) return { message: 'Success! New Post Saved', ok: true };
  return {
    message: 'Oops, Something Went Wrong',
    data: Object.fromEntries(formData.entries()),
  };
}

export async function updatePost(
  state: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const validatedFields = PostFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);

    const errors: Record<string, string[]> = {};
    if (tree.properties) {
      for (const [key, value] of Object.entries(tree.properties)) {
        if (value && 'errors' in value) {
          errors[key] = value.errors;
        }
      }
    }

    return {
      data: Object.fromEntries(formData.entries()),
      errors,
    };
  }

  // Only now validatedFields.data is guaranteed
  const { thumbnail, ...inputs } = validatedFields.data;

  let thumbnailUrl = '';

  if (thumbnail) thumbnailUrl = await uploadThumbnail(thumbnail);

  const data = await authFetchGraphQL(print(UPDATE_POST_MUTATION), {
    input: {
      ...inputs,
      ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
    },
  });

  if (data) return { message: 'Success! The Post Updated', ok: true };
  return {
    message: 'Oops, Something Went Wrong',
    data: Object.fromEntries(formData.entries()),
  };
}

export async function deletePost(postId: number) {
  const data = await authFetchGraphQL(print(DELETE_POST_MUTATION), {
    postId,
  });
  return data.deletePost;
}
