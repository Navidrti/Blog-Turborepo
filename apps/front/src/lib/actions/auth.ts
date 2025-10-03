'use server';

import { redirect } from 'next/navigation';
import { fetchGraphQL } from '../fetchGraphQL';
import { CREATE_USER_MUTATION, SIGN_IN_MUTATION } from '../gqlQueries';
import { SignUpFormState } from '../types/formState';
import { SignUpFormSchema } from '../zodSchemas/signUpFormSchema';
import { print } from 'graphql';
import { z } from 'zod';
import { LoginFormSchema } from '../zodSchemas/loginFormSchema';
import { revalidatePath } from 'next/cache';
import { createSession } from '../session';

// ✅ our custom flatten function (replacement for deprecated flatten)
function flattenTree(err: z.ZodError<any>): SignUpFormState['errors'] {
  const tree = z.treeifyError(err) as any;
  const out: SignUpFormState['errors'] = {};

  const props = tree.properties ?? {};
  if (props.name?.errors) out.name = props.name.errors;
  if (props.email?.errors) out.email = props.email.errors;
  if (props.password?.errors) out.password = props.password.errors;

  return out;
}

export async function singUp(
  state: SignUpFormState | undefined,
  formData: FormData
): Promise<SignUpFormState> {
  state = state ?? { data: {}, errors: {} };

  const validatedFields = SignUpFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      data: Object.fromEntries(formData.entries()),
      errors: flattenTree(validatedFields.error), // ✅ using custom flatten
    };
  }

  const data = await fetchGraphQL(print(CREATE_USER_MUTATION), {
    input: { ...validatedFields.data },
  });

  if (data.errors) {
    return {
      data: Object.fromEntries(formData.entries()),
      errors: {},
      message: 'Something went wrong',
    };
  }

  redirect('/auth/signin');
}

export async function signIn(
  state: SignUpFormState | undefined,
  formData: FormData
): Promise<SignUpFormState> {
  state = state ?? { data: {}, errors: {} }; // provide default

  const validatedFields = LoginFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      data: Object.fromEntries(formData.entries()),
      errors: flattenTree(validatedFields.error),
    };
  }

  const data = await fetchGraphQL(print(SIGN_IN_MUTATION), {
    input: {
      ...validatedFields.data,
    },
  });

  if (data.errors) {
    return {
      data: Object.fromEntries(formData.entries()),
      errors: {}, // required field
      message: 'Invalid Credentials',
    };
  }
  await createSession({
    user: {
      id: data.signIn.id,
      name: data.signIn.name,
      avatar: data.signIn.avatar,
    },
    accessToken: data.signIn.accessToken,
  });
  revalidatePath('/');
  redirect('/');
}
