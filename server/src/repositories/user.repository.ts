import { User } from "../entities/user.entity";
import AppDataSource from "../database/connection";
import { Repository, Not, IsNull, ILike, In } from "typeorm";
import { decrypt } from "../utils/crypto"; // Importamos o utilitário de descriptografia

export class UserRepository {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  // Adaptamos este método para localizar o número correto descriptografando com segurança
  async findByPhoneNumber(phone_number: string): Promise<User | null> {
    if (!phone_number) return null;

    // Buscamos apenas usuários que possuam algum valor salvo no campo de telefone
    const usersWithPhone = await this.userRepository.find({
      where: {
        phone_number: Not(IsNull()),
      },
    });

    // Procuramos o usuário cujo número descriptografado corresponda ao pesquisado
    const foundUser = usersWithPhone.find((user) => {
      if (!user.phone_number) return false;
      const decrypted = decrypt(user.phone_number);
      return decrypted === phone_number;
    });

    return foundUser || null;
  }

  async findByAnonName(anon_name: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ anon_name });
  }

  async findByGoogleIdHash(google_id_hash: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ google_id_hash });
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return this.userRepository.find({ where: { id: In(ids) } });
  }

  async findPaginated(filters: {
    search?: string;
    status?: "active" | "suspended";
    page: number;
    pageSize: number;
  }): Promise<{ items: User[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.anon_name = ILike(`%${filters.search}%`);
    }
    if (filters.status === "active") {
      where.is_active = true;
    } else if (filters.status === "suspended") {
      where.is_active = false;
    }

    const [items, total] = await this.userRepository.findAndCount({
      where,
      order: { created_at: "DESC" },
      take: filters.pageSize,
      skip: (filters.page - 1) * filters.pageSize,
    });
    return { items, total };
  }

  async countTotal(): Promise<number> {
    return this.userRepository.count();
  }

  async countActive(): Promise<number> {
    return this.userRepository.count({ where: { is_active: true } });
  }

  async countSuspended(): Promise<number> {
    return this.userRepository.count({ where: { is_active: false } });
  }

  async countCreatedSince(since: Date): Promise<number> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.created_at >= :since", { since })
      .getCount();
  }

  async findAdmins(): Promise<User[]> {
    return this.userRepository.find({ where: { role: "admin" } });
  }
}
