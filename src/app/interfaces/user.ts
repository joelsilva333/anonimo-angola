export default interface UserInterface {
  id: string;
  anon_name: string;
  phone_number: string;
  role: string;
  created_at: Date;
  last_login_at: Date;
  is_active: boolean;
}
