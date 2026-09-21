import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateUserDTO } from "../dto/user.dto";
import { UserService } from "../service/user.service";
import { FollowService } from "../service/follow.service";

class UserController {
  private userService: UserService;
  private followService: FollowService;

  constructor() {
    this.userService = new UserService();
    this.followService = new FollowService();
  }

  getUserByPhoneNumber = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { phone_number } = req.params;
      const phoneNumber = Array.isArray(phone_number)
        ? phone_number[0]
        : phone_number;

      const loggedUserId = req.anon_name?.id;
      const loggedUserRole = req.anon_name?.role;

      const user = await this.userService.findByPhone(
        phoneNumber,
        loggedUserId,
        loggedUserRole,
      );

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      const loggedUserId = req.anon_name?.id;
      const loggedUserRole = req.anon_name?.role;

      if (loggedUserId !== id && loggedUserRole !== "admin") {
        return res.status(403).json({
          error: "Não tem permissão para actualizar os dados deste usuário.",
        });
      }

      const dto = plainToInstance(UpdateUserDTO, req.body);

      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          error: "Erro de validação",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const updatedUser = await this.userService.update(
        id,
        dto,
        loggedUserId,
        loggedUserRole,
      );

      return res.status(200).json({
        message: "Usuário atualizado com sucesso",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      const loggedUserId = req.anon_name?.id;
      const loggedUserRole = req.anon_name?.role;

      const user = await this.userService.findById(
        id,
        loggedUserId,
        loggedUserRole,
      );

      const [followCounts, isFollowing] = await Promise.all([
        this.followService.getFollowCounts(id),
        this.followService.isFollowing(loggedUserId, id),
      ]);

      return res.status(200).json({
        ...user,
        followersCount: followCounts.followers,
        followingCount: followCounts.following,
        isFollowing,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const loggedUserId = req.anon_name?.id;
      const loggedUserRole = req.anon_name?.role;

      if (loggedUserRole !== "admin") {
        return res.status(403).json({
          error: "Não tem permissão para aceder aos dados dos usuários.",
        });
      }

      const users = await this.userService.find(
        loggedUserId,
        loggedUserRole,
      );

      return res.status(200).json(users);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      const loggedUserId = req.anon_name?.id;
      const loggedUserRole = req.anon_name?.role;

      if (loggedUserId !== id && loggedUserRole !== "admin") {
        return res.status(403).json({
          error: "Não tem permissão para apagar esta conta.",
        });
      }

      await this.userService.delete(id);

      return res.status(204).send();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new UserController();