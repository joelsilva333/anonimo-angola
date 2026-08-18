import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { SponsorInterface } from "@/app/interfaces/sponsor"

function isWithinDateRange(sponsor: SponsorInterface): boolean {
	const now = Date.now()

	if (sponsor.startDate && now < new Date(sponsor.startDate).getTime()) {
		return false
	}

	if (sponsor.endDate && now > new Date(sponsor.endDate).getTime()) {
		return false
	}

	return true
}

export function useGetSponsors() {
	const [sponsors, setSponsors] = useState<SponsorInterface[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		async function fetchSponsors() {
			try {
				setLoading(true)
				const sponsorsQuery = query(
					collection(db, "sponsors"),
					where("active", "==", true),
				)
				const snapshot = await getDocs(sponsorsQuery)

				const results = snapshot.docs
					.map((doc) => ({ id: doc.id, ...doc.data() }) as SponsorInterface)
					.filter(isWithinDateRange)

				if (!cancelled) setSponsors(results)
			} catch (error) {
				console.error("Erro ao buscar patrocinadores:", error)
				if (!cancelled) setSponsors([])
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchSponsors()

		return () => {
			cancelled = true
		}
	}, [])

	return { sponsors, loading }
}
