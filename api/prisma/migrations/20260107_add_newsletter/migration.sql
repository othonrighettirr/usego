-- CreateTable
CREATE TABLE IF NOT EXISTS "Newsletter" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "jid" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Newsletter_instanceId_jid_key" ON "Newsletter"("instanceId", "jid");

-- AddForeignKey
ALTER TABLE "Newsletter" ADD CONSTRAINT "Newsletter_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
