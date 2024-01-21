import { PrimaryGeneratedColumn } from "typeorm";

export class AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;
}