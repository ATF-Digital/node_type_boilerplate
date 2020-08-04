import {MigrationInterface, QueryRunner} from "typeorm";

export class SetDescriptionNull1596459937653 implements MigrationInterface {
    name = 'SetDescriptionNull1596459937653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `services` DROP FOREIGN KEY `FK_bb265099f748d85952d3133ec3a`", undefined);
        await queryRunner.query("ALTER TABLE `services` CHANGE `description_id` `description_id` varchar(255) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `services` ADD CONSTRAINT `FK_bb265099f748d85952d3133ec3a` FOREIGN KEY (`description_id`) REFERENCES `servicedescription`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `services` DROP FOREIGN KEY `FK_bb265099f748d85952d3133ec3a`", undefined);
        await queryRunner.query("ALTER TABLE `services` CHANGE `description_id` `description_id` varchar(255) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `services` ADD CONSTRAINT `FK_bb265099f748d85952d3133ec3a` FOREIGN KEY (`description_id`) REFERENCES `servicedescription`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
    }

}
