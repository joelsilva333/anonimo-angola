import { IsEnum, IsUUID, IsOptional } from "class-validator";
import { NotificationType, TargetType } from "src/entities/notification.entity";

export class CreateNotificationDto {
  @IsUUID()
  recipientId!: string;

  @IsUUID()
  @IsOptional()
  senderId?: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsEnum(TargetType)
  targetType!: TargetType;

  @IsUUID()
  targetId!: string;
}
