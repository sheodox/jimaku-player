import {Entity, Column, Index, PrimaryGeneratedColumn} from "typeorm/index";

@Entity({
    name: 'images'
})
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("bytea")
    large: Buffer

    @Column("bytea")
    medium: Buffer

    @Column("bytea")
    small: Buffer

    //a column that only means something to a consumer
    @Column()
    @Index()
    sourceId: string
}
