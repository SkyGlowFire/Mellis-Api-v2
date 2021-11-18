import { IsString, IsNotEmpty } from 'class-validator';
 
export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
 
export default SocialLoginDto;