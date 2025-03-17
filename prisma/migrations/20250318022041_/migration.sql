-- CreateEnum
CREATE TYPE "MEDIA_TYPE" AS ENUM ('ANIME', 'MANGA', 'OTHER');

-- CreateEnum
CREATE TYPE "MEDIA_FORMAT" AS ENUM ('TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC', 'MANGA', 'NOVEL', 'ONE_SHOT', 'VIDEO_GAME');

-- CreateEnum
CREATE TYPE "MEDIA_RELATION" AS ENUM ('ADAPTATION', 'PREQUEL', 'SEQUEL', 'PARENT', 'CONTAINS', 'SIDE_STORY', 'SPIN_OFF', 'OTHER');

-- CreateEnum
CREATE TYPE "CHARACTER_ROLE" AS ENUM ('MAIN', 'SUPPORTING', 'BACKGROUND');

-- CreateTable
CREATE TABLE "Options" (
    "guildId" TEXT NOT NULL,
    "dupes" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "excluded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "characterId" TEXT,
    "mediaId" TEXT,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "availableTokens" INTEGER NOT NULL DEFAULT 0,
    "guarantees" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "dailyTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "availablePulls" INTEGER NOT NULL DEFAULT 10,
    "lastPull" TIMESTAMP(3),
    "rechargeTimestamp" TIMESTAMP(3),
    "stealTimestamp" TIMESTAMP(3),
    "partyMember1Id" TEXT,
    "partyMember2Id" TEXT,
    "partyMember3Id" TEXT,
    "partyMember4Id" TEXT,
    "partyMember5Id" TEXT,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "Character" (
    "characterId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "nickname" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("characterId","userId","guildId")
);

-- CreateTable
CREATE TABLE "PackInstall" (
    "id" TEXT NOT NULL,
    "byId" TEXT,
    "packId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pack" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "description" TEXT,
    "author" TEXT,
    "image" TEXT,
    "url" TEXT,
    "nsfw" BOOLEAN,
    "webhookUrl" TEXT,
    "private" BOOLEAN,
    "conflicts" TEXT[],

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalUrl" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mediaId" TEXT,
    "characterId" TEXT,

    CONSTRAINT "ExternalUrl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackMedia" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alternative" TEXT[],
    "type" "MEDIA_TYPE" NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "format" "MEDIA_FORMAT",
    "description" TEXT,
    "image" TEXT,
    "idAL" INTEGER,
    "idMal" INTEGER,
    "tags" TEXT[],
    "genres" TEXT[],

    CONSTRAINT "PackMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackCharacter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternative" TEXT[],
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "rating" INTEGER NOT NULL,
    "gender" TEXT,
    "age" TEXT,
    "image" TEXT,

    CONSTRAINT "PackCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRelation" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "role" "CHARACTER_ROLE",
    "mediaId" TEXT,

    CONSTRAINT "CharacterRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaRelation" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "relation" "MEDIA_RELATION",

    CONSTRAINT "MediaRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PackMaintainers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PackMaintainers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_characterId_key" ON "Like"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_mediaId_key" ON "Like"("userId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember1Id_key" ON "Inventory"("partyMember1Id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember2Id_key" ON "Inventory"("partyMember2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember3Id_key" ON "Inventory"("partyMember3Id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember4Id_key" ON "Inventory"("partyMember4Id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember5Id_key" ON "Inventory"("partyMember5Id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember1Id_userId_guildId_key" ON "Inventory"("partyMember1Id", "userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember2Id_userId_guildId_key" ON "Inventory"("partyMember2Id", "userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember3Id_userId_guildId_key" ON "Inventory"("partyMember3Id", "userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember4Id_userId_guildId_key" ON "Inventory"("partyMember4Id", "userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partyMember5Id_userId_guildId_key" ON "Inventory"("partyMember5Id", "userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "PackInstall_packId_guildId_key" ON "PackInstall"("packId", "guildId");

-- CreateIndex
CREATE INDEX "_PackMaintainers_B_index" ON "_PackMaintainers"("B");

-- AddForeignKey
ALTER TABLE "Options" ADD CONSTRAINT "Options_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "PackCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "PackMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_partyMember1Id_userId_guildId_fkey" FOREIGN KEY ("partyMember1Id", "userId", "guildId") REFERENCES "Character"("characterId", "userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_partyMember2Id_userId_guildId_fkey" FOREIGN KEY ("partyMember2Id", "userId", "guildId") REFERENCES "Character"("characterId", "userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_partyMember3Id_userId_guildId_fkey" FOREIGN KEY ("partyMember3Id", "userId", "guildId") REFERENCES "Character"("characterId", "userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_partyMember4Id_userId_guildId_fkey" FOREIGN KEY ("partyMember4Id", "userId", "guildId") REFERENCES "Character"("characterId", "userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_partyMember5Id_userId_guildId_fkey" FOREIGN KEY ("partyMember5Id", "userId", "guildId") REFERENCES "Character"("characterId", "userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "Inventory"("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "PackCharacter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "PackMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackInstall" ADD CONSTRAINT "PackInstall_byId_fkey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackInstall" ADD CONSTRAINT "PackInstall_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackInstall" ADD CONSTRAINT "PackInstall_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pack" ADD CONSTRAINT "Pack_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalUrl" ADD CONSTRAINT "ExternalUrl_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "PackMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalUrl" ADD CONSTRAINT "ExternalUrl_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "PackCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackMedia" ADD CONSTRAINT "PackMedia_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackCharacter" ADD CONSTRAINT "PackCharacter_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "PackCharacter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "PackMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelation" ADD CONSTRAINT "MediaRelation_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "PackMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelation" ADD CONSTRAINT "MediaRelation_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "PackMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackMaintainers" ADD CONSTRAINT "_PackMaintainers_A_fkey" FOREIGN KEY ("A") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackMaintainers" ADD CONSTRAINT "_PackMaintainers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
