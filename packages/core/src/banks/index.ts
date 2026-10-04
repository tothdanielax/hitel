import type { Bank } from './bank';
import { CIB } from './cib';
import { ERSTE } from './erste';
import { GRANIT } from './granit';
import { KH } from './kh';
import { MAGNET } from './magnet';
import { MBH } from './mbh';
import { OTP } from './otp';
import { RAIFFEISEN } from './raiffeisen';
import { UNICREDIT } from './unicredit';

export const BANKS: Bank[] = [OTP, KH, MBH, RAIFFEISEN, ERSTE, CIB, UNICREDIT, GRANIT, MAGNET];
