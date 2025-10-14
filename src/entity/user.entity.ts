import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity()
export class User{

    @PrimaryColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    phoneNumber: string;

    @Column()
    password: string;

    @Column({nullable: true})
    refreshToken?: string
}