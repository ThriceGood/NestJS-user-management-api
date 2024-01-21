import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1705417129355 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `CREATE TABLE public.role (
                id serial4 NOT NULL,
                name varchar NOT NULL,
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id),
                CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE (name)
            );`
        )

        await queryRunner.query(
            `CREATE TABLE public.user (
                id serial4 NOT NULL,
                "firstName" varchar NOT NULL,
                "lastName" varchar NOT NULL,
                "nickName" varchar NOT NULL,
                email varchar NOT NULL,
                "roleId" int4 NULL,
                "profileImage" varchar NULL,
                password varchar NOT NULL,
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)
            );`
        )

        await queryRunner.query(
            `
            ALTER TABLE public.user 
            ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" 
            FOREIGN KEY ("roleId") 
            REFERENCES role(id);`
        )

        await queryRunner.query(
            `INSERT INTO public.role (name) VALUES ('ADMIN'), ('USER');`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(
            `DELETE FROM public.user;`
        )
        
        await queryRunner.query(
            `DELETE FROM public.role;`
        )

        await queryRunner.query(
            `DROP TABLE public.user;`
        )

        await queryRunner.query(
            `DROP TABLE public.role;`
        )
    }

}
