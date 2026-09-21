import crypto from "crypto";
import { PostShare } from "../entities/post-share.entity";
import { PostShareRepository } from "../repositories/post-share.repository";
import { PostRepository } from "../repositories/post.repository";

export class PostShareService {
  private postShareRepository: PostShareRepository;
  private postRepository: PostRepository;

  constructor() {
    this.postShareRepository = new PostShareRepository();
    this.postRepository = new PostRepository();
  }

  private frontendUrl =
    process.env.FRONTEND_URL || "https://anonimo-angola.vercel.app";

  async generateShare(
    postId: string,
    platform: string,
    userId: string | null,
  ): Promise<{ share: PostShare; shareLinks: any }> {
    const postExists = await this.postRepository.findByPostId(postId);
    if (!postExists) {
      throw new Error("O desabafo que estás a tentar partilhar não existe.");
    }

    const shareToken = crypto.randomBytes(8).toString("hex");

    const postShare = new PostShare();
    postShare.postId = postId;
    postShare.platform = platform;
    postShare.shareToken = shareToken;
    postShare.userId = userId;
 

    const savedShare = await this.postShareRepository.save(postShare);
 
    const postUrlWithRef = `${this.frontendUrl}/post/${postId}?ref=${shareToken}`;
 
    const cleanPostUrl = `${this.frontendUrl}/post/${postId}`;

    const encodedUrlWithRef = encodeURIComponent(postUrlWithRef);
    const encodedCleanUrl = encodeURIComponent(cleanPostUrl);

    const textIntent = encodeURIComponent(
      "Olha este desabafo anónimo no Anónimo Angola! \n",
    );

    const shareLinks = {
      rawLink: postUrlWithRef,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrlWithRef}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrlWithRef}`,
      whatsapp: `https://api.whatsapp.com/send?text=${textIntent}${encodedCleanUrl}`,
      instagram: postUrlWithRef,
    };

    return { share: savedShare, shareLinks };
  }

  async getShareStats(postId: string): Promise<{ totalShares: number }> {
    const count = await this.postShareRepository.countByPostId(postId);
    return { totalShares: count };
  }
}
