import UserInterface from "@/app/interfaces/user"
import { MoveRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction } from "react"
import Cookies from "universal-cookie"

interface MenuInterface {
	title: string
	onClick?: () => void
}

export default function Menu({
	setMenuClosed,
	user,
}: {
	setMenuClosed: Dispatch<SetStateAction<boolean>>
	user: UserInterface | null
	loading: boolean
}) {
	const router = useRouter()
	const cookies = new Cookies()

	const handleProfileClick = () => {
		router.push("/home/profile")
		setMenuClosed(false)
	}

	const handleLogout = () => {
		setMenuClosed(false)

		localStorage.removeItem("user_data")

		cookies.remove("token", { path: "/" })
		router.push("/login")
	}

	const handleMenuClick = (link: string) => {
		router.push(link)
		setMenuClosed(false)
	}

	const menuItems: MenuInterface[] = [
		{
			title: "Definições",
			onClick: () => handleMenuClick("/settings"),
		},
	]

	return (
		<ul className="w-full flex-col flex rounded-xl bg-white px-2 py-4 gap-2 font-semibold shadow-lg transition-shadow duration-300">
			<li>
				<button
					onClick={handleProfileClick}
					className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
				>
					<span className="flex items-center gap-2">
						{user?.profile_picture && (
							<Image
								src={user.profile_picture}
								width={36}
								height={36}
								alt={user.anon_name}
								className="rounded-full bg-gray-500"
							/>
						)}

						<p className="text-sm">
							{user ? user.anon_name : "Usuário Anônimo"}
						</p>
					</span>
				</button>
			</li>

			{menuItems.map((item) => (
				<li key={item.title}>
					<button
						onClick={item.onClick}
						className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer flex items-center justify-between gap-2"
					>
						{item.title}
						<MoveRight className="text-sm" />
					</button>
				</li>
			))}

			<li>
				<button
					className="w-full px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 flex items-center justify-between gap-2 text-red-500 cursor-pointer"
					onClick={handleLogout}
				>
					Sair
					<MoveRight className="text-sm" />
				</button>
			</li>
		</ul>
	)
}
