export function getRandomAvatar() {
	const avatars = [
		"/public/avatars/avatar1.png",
		"/public/avatars/avatar2.png",
		"/public/avatars/avatar3.png",
		"/public/avatars/avatar4.png",
		"/public/avatars/avatar5.png",
	]

	const randomIndex = Math.floor(Math.random() * avatars.length)
	return avatars[randomIndex]
}
