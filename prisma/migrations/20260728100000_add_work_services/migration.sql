-- CreateTable
CREATE TABLE `WorkService` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WorkService_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientWorkService` (
    `clientWorkId` VARCHAR(191) NOT NULL,
    `workServiceId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`clientWorkId`, `workServiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ClientWorkService_workServiceId_idx` ON `ClientWorkService`(`workServiceId`);

-- AddForeignKey
ALTER TABLE `ClientWorkService` ADD CONSTRAINT `ClientWorkService_clientWorkId_fkey` FOREIGN KEY (`clientWorkId`) REFERENCES `ClientWork`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientWorkService` ADD CONSTRAINT `ClientWorkService_workServiceId_fkey` FOREIGN KEY (`workServiceId`) REFERENCES `WorkService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default service options
INSERT INTO `WorkService` (`id`, `name`, `slug`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('svc-branding', 'Branding', 'branding', 0, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('svc-packaging-design', 'Packaging Design', 'packaging-design', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('svc-web-design', 'Web Design', 'web-design', 2, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('svc-social-media', 'Social Media', 'social-media', 3, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('svc-illustrations', 'Illustrations', 'illustrations', 4, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- Backfill every existing ClientWork with three example tags
INSERT INTO `ClientWorkService` (`clientWorkId`, `workServiceId`, `sortOrder`)
SELECT `id`, 'svc-branding', 0 FROM `ClientWork`;

INSERT INTO `ClientWorkService` (`clientWorkId`, `workServiceId`, `sortOrder`)
SELECT `id`, 'svc-web-design', 1 FROM `ClientWork`;

INSERT INTO `ClientWorkService` (`clientWorkId`, `workServiceId`, `sortOrder`)
SELECT `id`, 'svc-social-media', 2 FROM `ClientWork`;
