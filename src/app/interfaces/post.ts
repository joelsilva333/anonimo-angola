export interface PostInterface {
	id: string
	user_id: string
	anon_name: string
	profile_picture?: string
	text: string
	created_at: Date
	updated_at: Date
	status: "active" | "flagged" | "deleted"
}
