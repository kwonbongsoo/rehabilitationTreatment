import { MemberInput, MemberOutput } from '../types/member';

export interface IMemberService {
  create(data: MemberInput): Promise<MemberOutput>;
  findById(id: string): Promise<MemberOutput>;
  findByLoginId(loginId: string): Promise<MemberOutput>;
  findByEmail(email: string): Promise<MemberOutput>;
  findAll(skip?: number, take?: number): Promise<MemberOutput[]>;
  findMany(options: { skip: number; take: number }): Promise<MemberOutput[]>;
  countAll(): Promise<number>;
  update(id: string, data: Partial<MemberInput>): Promise<MemberOutput>;
  delete(id: string): Promise<boolean>;
  authenticate(id: string, password: string): Promise<Omit<MemberOutput, 'password'>>;
  changePassword(id: string, currentPassword: string, newPassword: string): Promise<MemberOutput>;
}
