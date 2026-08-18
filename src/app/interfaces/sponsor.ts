export interface SponsorInterface {
	id: string
	name: string
	imageUrl: string
	link: string
	ctaLabel?: string
	active: boolean
	startDate?: string // formato ISO, ex: "2026-08-01"
	endDate?: string // formato ISO, ex: "2026-09-01"
	placement?: "feed" | "sidebar"
}
