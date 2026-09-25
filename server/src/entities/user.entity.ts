import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm"

export type UserRole = "user" | "admin" | "anonymous"

export type CommentPermission = "everyone" | "authenticated" | "nobody"
export type DmPermission = "everyone" | "connections" | "nobody"

@Entity("")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string

	@Column()
	anon_name!: string

	@Column()
	profile_picture!: string

	@Column()
	password_hash!: string

	@Column({ default: true })
	is_active!: boolean

	@Column({ type: "timestamp", nullable: true })
	last_login_at!: Date

	@CreateDateColumn()
	created_at!: Date

	@Column()
	phone_number!: string

	@Column({ type: "varchar", default: "user" })
	role!: UserRole

	/**
	 * Hash irreversível (HMAC-SHA256) do ID da conta Google usada para
	 * entrar/vincular. Nunca guardamos o email, nome ou foto do Google —
	 * apenas este hash, que serve só para reconhecer o utilizador que
	 * regressa, sem que seja possível descobrir a identidade real a partir
	 * da base de dados.
	 */
	@Column({ type: "varchar", nullable: true, unique: true })
	google_id_hash!: string | null

	/**
	 * false apenas para contas criadas via Google sem o utilizador ainda ter
	 * escolhido o seu nome anónimo definitivo (fica com um nome temporário
	 * até lá). O frontend bloqueia o uso da app com um modal enquanto isto
	 * for false. Contas criadas com nome escolhido manualmente já nascem
	 * com true.
	 */
	@Column({ type: "boolean", default: true })
	onboarding_completed!: boolean

	/**
	 * Preenchido quando a conta é suspensa automaticamente por uso indevido
	 * repetido (3 conteúdos bloqueados pela IA em 7 dias). `is_active` passa
	 * a false e o login/os pedidos autenticados deixam de funcionar.
	 */
	@Column({ type: "text", nullable: true })
	banned_reason!: string | null

	@Column({ type: "timestamp", nullable: true })
	banned_at!: Date | null

	/** Preferências de notificação — cada uma controla um tipo de aviso em tempo real/sino. */
	@Column({ type: "boolean", default: true })
	notify_likes!: boolean

	@Column({ type: "boolean", default: true })
	notify_comments!: boolean

	@Column({ type: "boolean", default: true })
	notify_follows!: boolean

	@Column({ type: "boolean", default: true })
	notify_messages!: boolean

	/**
	 * Quando activo, a autoria dos teus desabafos/comentários/respostas deixa
	 * de mostrar o teu nome anónimo habitual — aparece como "Anônimo" e sem
	 * link para o perfil. Impede que alguém associe várias publicações tuas
	 * à mesma identidade só de olhar para o feed.
	 */
	@Column({ type: "boolean", default: false })
	anonymous_mode!: boolean

	/** Quem pode comentar nos teus desabafos. */
	@Column({ type: "varchar", default: "everyone" })
	comment_permission!: CommentPermission

	/** Quem pode iniciar uma conversa privada contigo. */
	@Column({ type: "varchar", default: "connections" })
	dm_permission!: DmPermission
}
