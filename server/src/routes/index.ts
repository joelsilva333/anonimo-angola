import { Router, Response, Request } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import postRoutes from "./post.routes";
import commentRoutes from "./comment.routes";
import answerRoutes from "./answer.routes";
import reactionRoutes from "./reaction.routes";
import shareRoutes from "./post-share.routes";
import notificationRoutes from "./notification.routes";
import supportRoutes from "./support.routes";
import aiRoutes from "./ai.routes";
import reportRoutes from "./report.routes";
import messageRoutes from "./message.routes";
import adminRoutes from "./admin.routes";

const routes = Router();

routes.use("/api/auth", authRoutes);
routes.use("/api/users", userRoutes);
routes.use("/api/posts", postRoutes);
routes.use("/api/comments", commentRoutes);
routes.use("/api/answers", answerRoutes);
routes.use("/api/reactions", reactionRoutes);
routes.use("/api/shares", shareRoutes);
routes.use("/api/notification", notificationRoutes);
routes.use("/api/support", supportRoutes);
routes.use("/api/ai", aiRoutes);
routes.use("/api/reports", reportRoutes);
routes.use("/api/messages", messageRoutes);
routes.use("/api/admin", adminRoutes);

routes.get("/", (_: Request, res: Response) => {
  res.status(200).send({ success: true });
});

export default routes;
