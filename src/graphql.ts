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

export function request(
  { url, token }: { url: string; token?: string },
  // deno-lint-ignore no-explicit-any
): <T = any, V = Variables>(
  query: string,
  variables?: V | undefined,
) => Promise<T> {
  // deno-lint-ignore no-explicit-any
  return async <T = any, V = Variables>(
    query: string,
    variables?: V,
  ): Promise<T> => {
    const options: {
      method: string;
      headers: Headers;
      body: string;
    } = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
      body: JSON.stringify({
        query,
        variables,
      }),
    };

    if (token) {
      options.headers.append('authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, options);

    const json = await response.json();

    if (json.errors || !response.ok) {
      throw new Error(JSON.stringify(json.errors ?? json));
    }

    return json?.data;
  };
}
