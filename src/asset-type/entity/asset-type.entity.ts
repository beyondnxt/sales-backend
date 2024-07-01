import { Asset } from "src/asset/entity/asset.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'asset-type' })
export class AssetType {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: null })
    assetDueDays: string

    @Column({ default: false })
    deleted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ default: null })
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number

    @OneToMany(() => Asset, asset => asset.assetType)
    asset: Asset[];
}