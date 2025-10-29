"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import AuthLeftSlider from "./ui/AuthLeftSlider"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex h-screen bg-background overflow-hidden">
			<motion.div
				initial={{ opacity: 0, x: -50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="flex-1 flex items-center justify-center bg-background-secondary max-lg:hidden w-1/2 relative"
			>
				<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-black flex flex-col justify-between items-start p-8 gap-4 z-20">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className=""
					>
						<Image
							src="/logos/white-bg-none.png"
							alt="Logo"
							width={500}
							height={165}
							unoptimized
							className="w-40"
						/>
					</motion.div>

					<div className="flex flex-col gap-4 max-w-md z-10 text-white/80">
						<div>
							<h1 className="text-2xl font-bold ">
								Sinta-se à vontade para desabafar. Estamos aqui para ouvir.
							</h1>
							<p>Sua voz importa, mesmo que seja anônima.</p>
						</div>

						<p className="text-sm text-white">
							&copy; {new Date().getFullYear()} Anônimo Angola. Todos os
							direitos reservados à Joel Silva.
						</p>
					</div>
				</div>
				<AuthLeftSlider />
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="flex-1 flex items-center justify-center max-lg:flex-col p-6"
			>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mb-6 lg:hidden"
				>
					<Image
						src="/logos/bg-none.png"
						alt="Logo"
						width={500}
						height={165}
						unoptimized
						className="max-lg:w-52"
					/>
				</motion.div>

				<AnimatePresence mode="wait">
					<motion.div
						key={JSON.stringify(children)}
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -15 }}
						transition={{ duration: 0.4 }}
						className="w-full max-w-md"
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
