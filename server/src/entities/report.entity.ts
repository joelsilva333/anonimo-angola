import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "./user.entity"

export enum ReportTargetType {
	POST = "post",
	COMMENT = "comment",
	ANSWER = "answer",
}

export enum ReportStatus {
	PENDING = "pending",
	RESOLVED = "resolved",
	DISMISSED = "dismissed",
}

@Entity()
export class Report {
	@PrimaryGeneratedColumn("uuid")
	id!: string

	@Column()
	reason!: string

	@CreateDateColumn()
	created_at!: Date

	@Column({
		type: "enum",
		enum: ReportTargetType,
	})
	target_type!: ReportTargetType

	@Column({ type: "uuid" })
	target_id!: string

	@Column({ type: "text", nullable: true })
	details!: string | null

	@Column({
		type: "enum",
		enum: ReportStatus,
		default: ReportStatus.PENDING,
	})
	status!: ReportStatus

	@Column({ type: "timestamp", nullable: true })
	resolved_at!: Date | null

	@Column({ type: "uuid", nullable: true })
	resolved_by!: string | null

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user!: User
}
