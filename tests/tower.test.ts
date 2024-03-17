// // deno-lint-ignore-file no-explicit-any

// import { assertEquals } from '$std/assert/mod.ts';

// import { FakeTime } from '$std/testing/time.ts';

// import { assertSpyCalls, returnsNext, stub } from '$std/testing/mock.ts';

// import tower, {
//   getEnemyMaxSkillLevel,
//   getEnemyRating,
//   getEnemySkillSlots,
//   getFloorExp,
//   MAX_FLOORS,
// } from '~/src/tower.ts';

// import db from '~/db/mod.ts';
// import utils from '~/src/utils.ts';
// import config from '~/src/config.ts';

// import { MediaType } from '~/src/types.ts';

// import type { AniListCharacter, AniListMedia } from '~/packs/anilist/types.ts';

// Deno.test('max floors', () => {
//   assertEquals(MAX_FLOORS, 20);
// });

// Deno.test('exp gained amount floors 1-10', () => {
//   assertEquals(getFloorExp(1), 1);
//   assertEquals(getFloorExp(2), 1);
//   assertEquals(getFloorExp(3), 1);
//   assertEquals(getFloorExp(4), 1);

//   assertEquals(getFloorExp(5), 2);

//   assertEquals(getFloorExp(6), 1.5);
//   assertEquals(getFloorExp(7), 1.5);
//   assertEquals(getFloorExp(8), 1.5);
//   assertEquals(getFloorExp(9), 1.5);

//   assertEquals(getFloorExp(10), 3);
// });

// Deno.test('exp gained amount floors 11-20', () => {
//   assertEquals(getFloorExp(11), 2);
//   assertEquals(getFloorExp(12), 2);
//   assertEquals(getFloorExp(13), 2);
//   assertEquals(getFloorExp(14), 2);

//   assertEquals(getFloorExp(15), 4);

//   assertEquals(getFloorExp(16), 3);
//   assertEquals(getFloorExp(17), 3);
//   assertEquals(getFloorExp(18), 3);
//   assertEquals(getFloorExp(19), 3);

//   assertEquals(getFloorExp(20), 6);
// });

// Deno.test('test enemy rating floors 1-10', () => {
//   assertEquals(getEnemyRating(1), 1);
//   assertEquals(getEnemyRating(2), 1);
//   assertEquals(getEnemyRating(3), 1);

//   assertEquals(getEnemyRating(4), 2);
//   assertEquals(getEnemyRating(6), 2);

//   assertEquals(getEnemyRating(7), 3);
//   assertEquals(getEnemyRating(8), 3);
//   assertEquals(getEnemyRating(9), 3);

//   assertEquals(getEnemyRating(5), 4);
//   assertEquals(getEnemyRating(10), 5);
// });

// Deno.test('test enemy rating floors 11-20', () => {
//   assertEquals(getEnemyRating(11), 1);
//   assertEquals(getEnemyRating(12), 1);
//   assertEquals(getEnemyRating(13), 1);

//   assertEquals(getEnemyRating(14), 2);
//   assertEquals(getEnemyRating(16), 2);

//   assertEquals(getEnemyRating(17), 3);
//   assertEquals(getEnemyRating(18), 3);
//   assertEquals(getEnemyRating(19), 3);

//   assertEquals(getEnemyRating(15), 4);
//   assertEquals(getEnemyRating(20), 5);
// });

// Deno.test('test enemy skill slots floors 1-10', () => {
//   assertEquals(getEnemySkillSlots(1), 0);
//   assertEquals(getEnemySkillSlots(2), 0);
//   assertEquals(getEnemySkillSlots(3), 0);
//   assertEquals(getEnemySkillSlots(4), 0);

//   assertEquals(getEnemySkillSlots(5), 1);
//   assertEquals(getEnemySkillSlots(6), 1);
//   assertEquals(getEnemySkillSlots(7), 1);
//   assertEquals(getEnemySkillSlots(8), 1);
//   assertEquals(getEnemySkillSlots(9), 1);

//   assertEquals(getEnemySkillSlots(10), 2);
// });

// Deno.test('test enemy skill slots floors 11-20', () => {
//   assertEquals(getEnemySkillSlots(11), 2);
//   assertEquals(getEnemySkillSlots(12), 2);
//   assertEquals(getEnemySkillSlots(13), 2);
//   assertEquals(getEnemySkillSlots(14), 2);

//   assertEquals(getEnemySkillSlots(15), 3);
//   assertEquals(getEnemySkillSlots(16), 3);
//   assertEquals(getEnemySkillSlots(17), 3);
//   assertEquals(getEnemySkillSlots(18), 3);
//   assertEquals(getEnemySkillSlots(19), 3);

//   assertEquals(getEnemySkillSlots(20), 4);
// });

// Deno.test('test enemy skill levels floors 1-10', () => {
//   assertEquals(getEnemyMaxSkillLevel(1), 1);
//   assertEquals(getEnemyMaxSkillLevel(2), 1);
//   assertEquals(getEnemyMaxSkillLevel(3), 1);
//   assertEquals(getEnemyMaxSkillLevel(4), 1);

//   assertEquals(getEnemyMaxSkillLevel(5), 1);
//   assertEquals(getEnemyMaxSkillLevel(6), 1);
//   assertEquals(getEnemyMaxSkillLevel(7), 1);
//   assertEquals(getEnemyMaxSkillLevel(8), 1);
//   assertEquals(getEnemyMaxSkillLevel(9), 1);

//   assertEquals(getEnemyMaxSkillLevel(10), 2);
// });

// Deno.test('test enemy skill levels floors 11-20', () => {
//   assertEquals(getEnemyMaxSkillLevel(11), 2);
//   assertEquals(getEnemyMaxSkillLevel(12), 2);
//   assertEquals(getEnemyMaxSkillLevel(13), 2);
//   assertEquals(getEnemyMaxSkillLevel(14), 2);

//   assertEquals(getEnemyMaxSkillLevel(15), 3);
//   assertEquals(getEnemyMaxSkillLevel(16), 3);
//   assertEquals(getEnemyMaxSkillLevel(17), 3);
//   assertEquals(getEnemyMaxSkillLevel(18), 3);
//   assertEquals(getEnemyMaxSkillLevel(19), 3);

//   assertEquals(getEnemyMaxSkillLevel(20), 4);
// });

// Deno.test('/tower view', async (test) => {
//   await test.step('no floor cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: undefined,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 2 - Undiscovered',
//                 '<:currentfloor:1128724907245711452> Floor 1 - Current',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: true,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('1 floor cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: 1,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
//                 '<:currentfloor:1128724907245711452> Floor 2 - Current',
//                 '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('2 floors cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: 2,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
//                 '<:currentfloor:1128724907245711452> Floor 3 - Current',
//                 '<:clearedfloor:1131872032456446053> Floor 2 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('5 floors cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: 5,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:undiscoveredfloor:1128724910609551481> Floor 8 - Undiscovered',
//                 '<:undiscoveredfloor:1128724910609551481> Floor 7 - Undiscovered',
//                 '<:currentfloor:1128724907245711452> Floor 6 - Current',
//                 '<:clearedfloor:1131872032456446053> Floor 5 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 4 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('max-2 floors cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: MAX_FLOORS - 2,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:undiscoveredfloor:1128724910609551481> Floor 20 - Undiscovered',
//                 '<:currentfloor:1128724907245711452> Floor 19 - Current',
//                 '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('max-1 floors cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: MAX_FLOORS - 1,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:currentfloor:1128724907245711452> Floor 20 - Current',
//                 '<:clearedfloor:1131872032456446053> Floor 19 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: false,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });

//   await test.step('max floors cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'getInventory',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: MAX_FLOORS,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.view({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: [
//                 '<:clearedfloor:1131872032456446053> Floor 20 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 19 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
//                 '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
//               ].join('\n'),
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'tchallenge=user_id',
//                   disabled: true,
//                   label: '/bt challenge',
//                   style: 2,
//                   type: 2,
//                 },
//                 {
//                   custom_id: 'treclear',
//                   disabled: false,
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });
// });

// Deno.test('/reclear', async (test) => {
//   await test.step('normal', async () => {
//     const timeStub = new FakeTime();

//     const media: AniListMedia[] = [
//       {
//         id: '0',
//         type: MediaType.Anime,
//         title: {
//           english: 'title',
//         },
//       },
//     ];

//     const characters: AniListCharacter[] = [
//       {
//         id: '1',
//         name: {
//           full: 'name 1',
//         },
//       },
//       {
//         id: '2',
//         name: {
//           full: 'name 2',
//         },
//       },
//       {
//         id: '3',
//         name: {
//           full: 'name 3',
//         },
//       },
//       {
//         id: '4',
//         name: {
//           full: 'name 4',
//         },
//       },
//       {
//         id: '5',
//         name: {
//           full: 'name 5',
//         },
//       },
//     ];

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       returnsNext([
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         undefined,
//       ]),
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const consumeKeyStub = stub(
//       db,
//       'consumeKey',
//       () => 1,
//     );

//     const getInventoryStub = stub(
//       db,
//       'rechargeConsumables',
//       () =>
//         ({
//           user: {},
//           inventory: {
//             floorsCleared: 1,
//           },
//         }) as any,
//     );

//     const getUserPartyStub = stub(
//       db,
//       'getUserParty',
//       () =>
//         ({
//           member1: {
//             id: 'anilist:1',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {},
//           },
//           member2: {
//             id: 'anilist:2',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {},
//           },
//           member3: {
//             id: 'anilist:3',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//           member4: {
//             id: 'anilist:4',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//           member5: {
//             id: 'anilist:5',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//         }) as any,
//     );

//     const atomicMock = {
//       set: () => atomicMock,
//       commit: () => ({ ok: true }),
//     };

//     const atomicStub = stub(
//       db.kv,
//       'atomic',
//       () => atomicMock as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.reclear({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 2);

//       assertEquals(
//         fetchStub.calls[1].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[1].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               title: 'Floor 1 x1',
//               description: '**name 1** 1/10 EXP\n' +
//                 '**name 2** 1/10 EXP\n' +
//                 '**name 3** 1/10 EXP\n' +
//                 '**name 4** 1/10 EXP\n' +
//                 '**name 5** 1/10 EXP',
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'treclear',
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//       getUserPartyStub.restore();
//       consumeKeyStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('level ups', async () => {
//     const timeStub = new FakeTime();

//     const media: AniListMedia[] = [
//       {
//         id: '0',
//         type: MediaType.Anime,
//         title: {
//           english: 'title',
//         },
//       },
//     ];

//     const characters: AniListCharacter[] = [
//       {
//         id: '1',
//         name: {
//           full: 'name 1',
//         },
//       },
//       {
//         id: '2',
//         name: {
//           full: 'name 2',
//         },
//       },
//       {
//         id: '3',
//         name: {
//           full: 'name 3',
//         },
//       },
//       {
//         id: '4',
//         name: {
//           full: 'name 4',
//         },
//       },
//       {
//         id: '5',
//         name: {
//           full: 'name 5',
//         },
//       },
//     ];

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       returnsNext([
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         undefined,
//       ]),
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const consumeKeyStub = stub(
//       db,
//       'consumeKey',
//       () => 3,
//     );

//     const gainExpStub = stub(
//       db,
//       'gainExp',
//       () => ({
//         levelUp: 1,
//         skillPoints: 1,
//         statPoints: 3,
//         exp: 10,
//         expToLevel: 20,
//       }),
//     );

//     const getInventoryStub = stub(
//       db,
//       'rechargeConsumables',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: 1,
//           },
//           user: {},
//         }) as any,
//     );

//     const getUserPartyStub = stub(
//       db,
//       'getUserParty',
//       () =>
//         ({
//           member1: {
//             id: 'anilist:1',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 29.5,
//             },
//           },
//           member2: {
//             id: 'anilist:2',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member3: {
//             id: 'anilist:3',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member4: {
//             id: 'anilist:4',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member5: {
//             id: 'anilist:5',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//         }) as any,
//     );

//     const atomicMock = {
//       set: () => atomicMock,
//       commit: () => ({ ok: true }),
//     };

//     const atomicStub = stub(
//       db.kv,
//       'atomic',
//       () => atomicMock as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = tower.reclear({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 2);

//       assertEquals(
//         fetchStub.calls[1].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[1].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               title: 'Floor 1 x3',
//               description:
//                 '**name 1** leveled up and gained 3 stat points and 1 skill point.\n' +
//                 '**name 2** leveled up and gained 3 stat points and 1 skill point.\n' +
//                 '**name 3** leveled up and gained 3 stat points and 1 skill point.\n' +
//                 '**name 4** leveled up and gained 3 stat points and 1 skill point.\n' +
//                 '**name 5** leveled up and gained 3 stat points and 1 skill point.',
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'treclear',
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//       getUserPartyStub.restore();
//       consumeKeyStub.restore();
//       gainExpStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('level ups 2x', async () => {
//     const timeStub = new FakeTime();

//     const media: AniListMedia[] = [
//       {
//         id: '0',
//         type: MediaType.Anime,
//         title: {
//           english: 'title',
//         },
//       },
//     ];

//     const characters: AniListCharacter[] = [
//       {
//         id: '1',
//         name: {
//           full: 'name 1',
//         },
//       },
//       {
//         id: '2',
//         name: {
//           full: 'name 2',
//         },
//       },
//       {
//         id: '3',
//         name: {
//           full: 'name 3',
//         },
//       },
//       {
//         id: '4',
//         name: {
//           full: 'name 4',
//         },
//       },
//       {
//         id: '5',
//         name: {
//           full: 'name 5',
//         },
//       },
//     ];

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       returnsNext([
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         undefined,
//       ]),
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const consumeKeyStub = stub(
//       db,
//       'consumeKey',
//       () => 5,
//     );

//     const gainExpStub = stub(
//       db,
//       'gainExp',
//       () => ({
//         levelUp: 2,
//         skillPoints: 2,
//         statPoints: 6,
//         exp: 10,
//         expToLevel: 20,
//       }),
//     );

//     const getInventoryStub = stub(
//       db,
//       'rechargeConsumables',
//       () =>
//         ({
//           user: {},
//           inventory: {
//             floorsCleared: 1,
//           },
//         }) as any,
//     );

//     const getUserPartyStub = stub(
//       db,
//       'getUserParty',
//       () =>
//         ({
//           member1: {
//             id: 'anilist:1',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 29.5,
//             },
//           },
//           member2: {
//             id: 'anilist:2',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member3: {
//             id: 'anilist:3',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member4: {
//             id: 'anilist:4',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//           member5: {
//             id: 'anilist:5',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               level: 1,
//               exp: 9.85,
//             },
//           },
//         }) as any,
//     );

//     const atomicMock = {
//       set: () => atomicMock,
//       commit: () => ({ ok: true }),
//     };

//     const atomicStub = stub(
//       db.kv,
//       'atomic',
//       () => atomicMock as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.reclear({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 2);

//       assertEquals(
//         fetchStub.calls[1].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[1].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               title: 'Floor 1 x5',
//               description:
//                 '**name 1** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
//                 '**name 2** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
//                 '**name 3** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
//                 '**name 4** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
//                 '**name 5** leveled up 2x and gained 6 stat points and 2 skill points.',
//             },
//           ],
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   custom_id: 'treclear',
//                   label: '/reclear',
//                   style: 2,
//                   type: 2,
//                 },
//               ],
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//       getUserPartyStub.restore();
//       consumeKeyStub.restore();
//       gainExpStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('no keys available', async () => {
//     const timeStub = new FakeTime('2011/1/25 00:00 UTC');

//     const media: AniListMedia[] = [
//       {
//         id: '0',
//         type: MediaType.Anime,
//         title: {
//           english: 'title',
//         },
//       },
//     ];

//     const characters: AniListCharacter[] = [
//       {
//         id: '1',
//         name: {
//           full: 'name 1',
//         },
//       },
//       {
//         id: '2',
//         name: {
//           full: 'name 2',
//         },
//       },
//       {
//         id: '3',
//         name: {
//           full: 'name 3',
//         },
//       },
//       {
//         id: '4',
//         name: {
//           full: 'name 4',
//         },
//       },
//       {
//         id: '5',
//         name: {
//           full: 'name 5',
//         },
//       },
//     ];

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       returnsNext([
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         {
//           ok: true,
//           text: (() =>
//             Promise.resolve(JSON.stringify({
//               data: {
//                 Page: {
//                   media,
//                   characters,
//                 },
//               },
//             }))),
//         } as any,
//         undefined,
//       ]),
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const date = new Date();

//     date.setHours(date.getHours() - 2);

//     const getInventoryStub = stub(
//       db,
//       'rechargeConsumables',
//       () =>
//         ({
//           user: {},
//           inventory: {
//             availableKeys: 0,
//             keysTimestamp: date.toISOString(),
//             floorsCleared: 1,
//           },
//         }) as any,
//     );

//     const getUserPartyStub = stub(
//       db,
//       'getUserParty',
//       () =>
//         ({
//           member1: {
//             id: 'anilist:1',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {},
//           },
//           member2: {
//             id: 'anilist:2',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {},
//           },
//           member3: {
//             id: 'anilist:3',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//           member4: {
//             id: 'anilist:4',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//           member5: {
//             id: 'anilist:5',
//             mediaId: 'anilist:0',
//             rating: 1,
//             combat: {
//               stats: {},
//             },
//           },
//         }) as any,
//     );

//     const t = {
//       set: () => t,
//       commit: () => ({ ok: true }),
//     };

//     const atomicStub = stub(
//       db.kv,
//       'atomic',
//       () => t as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = tower.reclear({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           components: [],
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description: "You don't have any more keys!",
//             },
//             {
//               type: 'rich',
//               description: '_+1 key <t:1295907000:R>_',
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//       getUserPartyStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('no floor cleared', async () => {
//     const timeStub = new FakeTime();

//     const fetchStub = stub(
//       utils,
//       'fetchWithRetry',
//       () => undefined as any,
//     );

//     const getUserStub = stub(
//       db,
//       'getUser',
//       () => 'user' as any,
//     );

//     const getGuildStub = stub(
//       db,
//       'getGuild',
//       () => 'guild' as any,
//     );

//     const getInstanceStub = stub(
//       db,
//       'getInstance',
//       () => 'instance' as any,
//     );

//     const getInventoryStub = stub(
//       db,
//       'rechargeConsumables',
//       () =>
//         ({
//           inventory: {
//             floorsCleared: undefined,
//           },
//         }) as any,
//     );

//     config.combat = true;
//     config.appId = 'app_id';
//     config.origin = 'http://localhost:8000';

//     try {
//       const message = await tower.reclear({
//         token: 'test_token',
//         userId: 'user_id',
//         guildId: 'guild_id',
//       });

//       assertEquals(message.json(), {
//         type: 4,
//         data: {
//           attachments: [],
//           components: [],
//           embeds: [{
//             type: 'rich',
//             image: {
//               url: 'http://localhost:8000/assets/spinner3.gif',
//             },
//           }],
//         },
//       });

//       await timeStub.runMicrotasks();

//       assertSpyCalls(fetchStub, 1);

//       assertEquals(
//         fetchStub.calls[0].args[0],
//         'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
//       );

//       assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

//       assertEquals(
//         JSON.parse(
//           (fetchStub.calls[0].args[1]?.body as FormData)?.get(
//             'payload_json',
//           ) as any,
//         ),
//         {
//           components: [],
//           attachments: [],
//           embeds: [
//             {
//               type: 'rich',
//               description:
//                 'Clear at least one floor of the `/battle tower` first',
//             },
//           ],
//         },
//       );
//     } finally {
//       delete config.appId;
//       delete config.origin;
//       delete config.combat;

//       timeStub.restore();
//       fetchStub.restore();

//       getGuildStub.restore();
//       getInstanceStub.restore();
//       getUserStub.restore();
//       getInventoryStub.restore();
//     }
//   });
// });
