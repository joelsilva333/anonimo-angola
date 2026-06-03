export default function Footer() {
  return (
    <footer className="w-full px-16 py-4 text-center">
      <p className="text-gray-600">
        © {new Date().getFullYear()} Anônimo Angola. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}