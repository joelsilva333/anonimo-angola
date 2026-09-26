import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  AuthLoginDTO,
  GoogleAuthDTO,
  RequestPasswordResetDTO,
  ResetPasswordWithOtpDTO,
} from "../dto/auth.dto";
import {
  AddPhoneDTO,
  CompleteOnboardingDTO,
  CreateUserDTO,
} from "../dto/user.dto";
import { AuthService } from "../service/auth.service";
import { AccountSuspendedError } from "../utils/errors";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }



  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = plainToInstance(CreateUserDTO, req.body);

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

      const result = await this.authService.register(dto);

      return res.status(201).json({
        message: "Utilizador criado com sucesso",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = plainToInstance(AuthLoginDTO, req.body);

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

      const result = await this.authService.login(dto);

      return res.status(200).json({
        message: "Sessão iniciada com sucesso",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof AccountSuspendedError) {
        return res.status(403).json({
          error: error.message,
          code: "ACCOUNT_SUSPENDED",
        });
      }

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  loginAsGuest = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.authService.loginAsGuest();

      return res.status(200).json({
        message: "Sessão iniciada como convidado com sucesso",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = plainToInstance(GoogleAuthDTO, req.body);

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

      const result = await this.authService.loginWithGoogle(dto);

      return res.status(result.created ? 201 : 200).json({
        message: result.created
          ? "Conta criada e sessão iniciada com sucesso"
          : "Sessão iniciada com sucesso",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof AccountSuspendedError) {
        return res.status(403).json({
          error: error.message,
          code: "ACCOUNT_SUSPENDED",
        });
      }

      return res.status(401).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  linkGoogleAccount = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const dto = plainToInstance(GoogleAuthDTO, req.body);

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

      const result = await this.authService.linkGoogleAccount(userId, dto);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  completeOnboarding = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const dto = plainToInstance(CompleteOnboardingDTO, req.body);
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

      const user = await this.authService.completeOnboarding(
        userId,
        dto.anon_name,
      );

      return res.status(200).json({
        message: "Nome anónimo definido com sucesso",
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  addPhoneNumber = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const dto = plainToInstance(AddPhoneDTO, req.body);
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

      await this.authService.addPhoneNumber(userId, dto);

      return res.status(200).json({
        message: "Telefone de recuperação associado com sucesso",
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  requestPasswordReset = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const dto = plainToInstance(RequestPasswordResetDTO, req.body);

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

      await this.authService.validateUserForReset(dto);

      return res.status(200).json({
        message:
          "Se o número estiver registado, o código OTP foi enviado com sucesso",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  resetPasswordWithOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const dto = plainToInstance(ResetPasswordWithOtpDTO, req.body);

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

      await this.authService.resetPasswordWithOtp(dto);

      return res.status(200).json({
        message: "Palavra-passe alterada com sucesso",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new AuthController();
