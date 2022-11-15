import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

const client = new GraphQLClient('https://graphql.anilist.co');

// export async function search(
//   variables: { search: string; page: number },
// ): Promise<Response> {
//   const query = gql`
//     query ($page: Int, $search: String) {
//       Page(page: $page, perPage: 1) {
//         pageInfo {
//           total
//           currentPage
//           lastPage
//           hasNextPage
//           perPage
//         }
//         media(search: $search) {
//           type,
//           coverImage {
//             large
//             medium
//             color
//           },
//           title {
//             romaji
//             english
//           }
//         }
//       }
//     }
//   `;

//   return await client.request(query, variables);
// }

export async function getAnime(
  variables: { search: string },
): Promise<Response> {
  const query = gql`
    query ($search: String) {
      Media(search: $search, type: ANIME, sort:POPULARITY_DESC) {
        title {
          english
        }
        nextAiringEpisode {
          airingAt
        },
      }
    }
  `;

  return await client.request(query, variables);
}
