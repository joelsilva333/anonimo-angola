import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { SponsorInterface } from "@/app/interfaces/sponsor"

export default function SponsorBanner({ sponsor }: { sponsor: SponsorInterface }) {
	return (
		<motion.div
			whileHover={{ scale: 1.01 }}
			transition={{ duration: 0.2 }}
			className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
			<span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold px-6 pt-4">
				Publicidade
			</span>

			<Link
				href={sponsor.link}
				target="_blank"
				rel="noopener noreferrer sponsored"
				className="flex flex-col gap-3 px-6 pb-6 pt-2">
				<div className="flex items-center gap-4">
					<Image
						src={sponsor.imageUrl}
						width={64}
						height={64}
						unoptimized
						alt={sponsor.name}
						className="rounded-2xl object-cover w-16 h-16 bg-gray-100"
					/>
					<div className="flex flex-col">
						<p className="font-semibold text-lg">{sponsor.name}</p>
						<span className="text-sm text-secondary font-medium">
							{sponsor.ctaLabel || "Saber mais"}
						</span>
					</div>
				</div>
			</Link>
		</motion.div>
	)
}
