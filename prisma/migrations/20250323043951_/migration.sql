-- CreateIndex
CREATE INDEX "Inventory_lastPull_idx" ON "Inventory"("lastPull" DESC);

-- CreateIndex
CREATE INDEX "PackCharacter_rating_idx" ON "PackCharacter"("rating" DESC);
