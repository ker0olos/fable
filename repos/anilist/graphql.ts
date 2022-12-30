// deno-lint-ignore no-explicit-any
type Variables = { [key: string]: any };

// deno-lint-ignore no-explicit-any
export function gql(chunks: TemplateStringsArray, ...variables: any[]): string {
  return chunks.reduce(
    (accumulator, chunk, index) =>
      `${accumulator}${chunk}${index in variables ? variables[index] : ''}`,
    '',
  );
}

// deno-lint-ignore no-explicit-any
export async function request<T = any, V = Variables>(
  query: string,
  variables?: V,
): Promise<T> {
  const url = 'https://graphql.anilist.co';

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  const response = await fetch(url, options);

  const json = await response.json();

  if (response.ok) {
    return json?.data;
  } else {
    throw new Error(json);
  }
}
