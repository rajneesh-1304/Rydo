import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Driver1793273727218 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
            CREATE TYPE "public"."driver_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');
            CREATE TYPE "public"."driver_role_enum" AS ENUM('USER', 'DRIVER');
        `);

        await queryRunner.createTable(
            new Table({
                name: "driver",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "uuid",
                        type: "uuid",
                        default: "gen_random_uuid()",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "firebase_uid",
                        type: "varchar",
                        isUnique: true,
                        isNullable: true,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "first_name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "last_name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isUnique: true,
                        isNullable: true,
                    },
                    {
                        name: "image",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "gender",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "dob",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: '"public"."driver_status_enum"',
                        default: "'ACTIVE'",
                        isNullable: false,
                    },
                    {
                        name: "role",
                        type: '"public"."driver_role_enum"',
                        default: "'DRIVER'",
                        isNullable: false,
                    },
                    {
                        name: "provider_id",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("driver");
        await queryRunner.query(`DROP TYPE "public"."driver_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."driver_status_enum"`);
    }

}
