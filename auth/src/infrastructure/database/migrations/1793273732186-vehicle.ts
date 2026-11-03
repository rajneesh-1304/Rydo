import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Vehicle1793273732186 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        `);

        await queryRunner.createTable(
            new Table({
                name: "vehicle",
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
                        name: "model",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "plate_number",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "color",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "license_number",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "license_expiration_date",
                        type: "date",
                        isNullable: false,
                    },
                    {
                        name: "insurance_number",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "insurance_expiration_date",
                        type: "date",
                        isNullable: false,
                    },
                    {
                        name: "car_image",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "driver_id",
                        type: "int",
                        isUnique: true,
                        isNullable: false,
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
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ["driver_id"],
                        referencedTableName: "driver",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("vehicle");
    }

}
