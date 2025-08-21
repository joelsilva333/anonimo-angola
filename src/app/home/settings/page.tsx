import MenuOption from "./components/MenuOptions";

export default function SettingsPage() {
  const menuOptions = [
    {
      label: "Conta e Perfil",
      href: "#",
      description:
        "Nome de utilizador, telefone (para recuperação de conta, não visível para outros), alterar palavra-passe, eliminar conta.",
    },
    {
      label: "Privacidade e Segurança",
      href: "#",
      description:
        "Modo anônimo permanente, controle de comentários, bloquear utilizadores, quem pode enviar mensagens privadas.",
    },
    {
      label: "Notificações",
      href: "#",
      description:
        "Notificações de novos comentários, notificações de reações, alertas de menções, novas mensagens privadas",
    },
    {
      label: "Conteúdo e Moderação",
      href: "#",
      description:
        "Filtro de linguagem ofensiva, filtro de tópicos sensíveis, apagar publicações automaticamente.",
    },
  ];

  return (
    <>
      <div className="w-full flex-col flex mt-5">
        <h1 className="text-lg font-bold">DEFINIÇÕES</h1>
      </div>

      <ul className="w-full flex flex-col gap-4">
        {menuOptions.map((option) => (
          <li key={option.label}>
            <MenuOption
              title={option.label}
              description={option.description}
              link={option.href}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
