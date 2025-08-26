"use client"

import { Bell, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Menu from "./Menu"
import { useUser } from "@/app/hooks/user"

export default function Header() {
	const [isMenuOpen, setMenuOpen] = useState<boolean>(false)

	const toggleMenu = () => {
		setMenuOpen(!isMenuOpen)
	}

	const { user, loading } = useUser()

	return (
		<header className="bg-[#D5D5D5] w-full px-16 py-2 max-lg:px-8 flex items-center justify-between sticky top-0 z-50">
			<div className="flex items-center gap-8 max-w-lg w-full">
				<Link href="/">
					<Image
						src={"/logos/bg-none.png"}
						width={100}
						height={44}
						alt="Anônimo Angola Logo"
						className="w-36 object-contain max-lg:w-24"
					/>
				</Link>

				<div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 w-full max-lg:hidden">
					<Search className="text-gray-600" />
					<input
						type="text"
						placeholder="Pesquisar"
						className="bg-transparent outline-none w-full"
					/>
				</div>
			</div>

			<div className="flex  gap-6 relative w-full max-w-xs items-center justify-end">
				<ul className="flex items-center gap-4">
					<li>
						<button className="p-2 rounded-full bg-white/80 hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
							<Bell className="text-gray-600" />
						</button>
					</li>
				</ul>

				<button onClick={toggleMenu} className="cursor-pointer">
					{user?.profile_picture && (
						<Image
							src={user.profile_picture}
							width={38}
							height={385}
							alt={user.anon_name}
							className="rounded-full bg-gray-300"
						/>
					)}
				</button>

				{isMenuOpen && (
					<div className="absolute right-0 top-11 w-fit z-20">
						<Menu setMenuClosed={setMenuOpen} user={user} loading={loading} />
					</div>
				)}
			</div>
		</header>
	)
}
