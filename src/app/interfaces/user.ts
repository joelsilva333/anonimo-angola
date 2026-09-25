export default interface UserInterface {
	id: string
	anon_name: string
	phone_number: string
	role: string
	profile_picture: string
	created_at: Date
	last_login_at: Date
	is_active: boolean
	google_linked?: boolean
	onboarding_completed?: boolean
	notify_likes?: boolean
	notify_comments?: boolean
	notify_follows?: boolean
	notify_messages?: boolean
	anonymous_mode?: boolean
	comment_permission?: "everyone" | "authenticated" | "nobody"
	dm_permission?: "everyone" | "connections" | "nobody"
}
