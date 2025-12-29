import { computed, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Country, Industry } from '@/interfaces';

import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class BusinessConfigService {
  public applicationMaxAdditionalStatements = 5;

  public minApplicationAmount = 1000;

  public maxApplicationAmount = 20000000;

  public maxPhoneNumbers = 5;

  public maxEmails = 5;

  public maxApplicationCompany = 1;

  public maxCompanyMembers = 10;

  public maxContactFiles = 6;

  public maxBankFiles = 6;

  public maxContactAge = 99;

  public minContactAge = 21;

  public contactMaxFilePerType = 4;

  public maxCompanyFilePerType = 4;

  public companyFileMaxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  public contactFileMaxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  public applicationsubstatus = signal<Record<string, string>>({
    CONTRACT_REQUESTED: 'Contract requested',
    CONTRACT_SENT_TO_CUSTOMER: 'Contract sent to customer',
    CONTRACT_SIGNED: 'Contract signed',
    CONTRACT_NOT_SIGNED: 'Contract not signed',
    CONTRACT_VERIFICATION: 'Contract verification',
    VERIFICATION_CALL: 'Verification call',
  });

  public supportedCountries = toSignal<Country>(this._supportedCountries());

  public bankClassifications = signal<string[]>(['A', 'B', 'C', 'D']);

  public positions = signal<number[]>([1, 2, 3, 4, 5]);

  public levelNote = signal<Record<string, string>>({
    INFO: 'Info',
    WARNING: 'Warning',
    CRITICAL: 'Critical',
  });

  public supportedIDs = computed<Record<string, string>>(() => {
    const types = { ...this.companyFileTypes(), ...this.contactFileTypes() };
    delete types?.['OTHER'];
    return types;
  });

  public companyFileTypes = signal<Record<string, string>>({
    EIN: 'EIN',
    W9: 'W-9',
    VOIDED_CHECK: 'Voided Check',
    OPEN_COMPANY_LETTER: 'Open Company Letter',
    TAXES: 'Taxes',
    OTHER: 'Other',
  });

  public contactFileTypes = signal<Record<string, string>>({
    DRIVER_LICENSE: 'Driver license',
    PASSPORT: 'Passport',
    GREEN_CARD_10_YEARS: 'Green Card 10 years',
    GREEN_CARD_2_YEARS: 'Green Card 2 years',
    RESTRICTED_DRIVER_LICENSE: 'Restricted Driver License',
    WORK_LICENSE: 'Work License',
    ITIN: 'ITIN',
    SSN: 'SSN',
    OTHER: 'Other',
  });

  public entityType = signal<Record<string, string>>({
    SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
    PARTNERSHIP: 'Partnership',
    CORPORATION: 'Corporation',
    LLC: 'LLC',
    OTHER: 'Other',
  });

  public productType = signal<Record<string, string>>({
    FACTORING: 'Factoring',
    CASH_ADVANCE: 'Cash Advance',
    CONSOLIDATION: 'Consolidation',
    CREDIT_CARD: 'Credit Card',
    CARD_PROCESSOR: 'Card Processor',
    LINE_OF_CREDIT: 'Line of Credit',
  });

  public referralSources = signal<Record<string, string>>({
    ONLINE_AD: 'Online Ad',
    FRIEND: 'Friend',
    FAMILY: 'Family',
    TV: 'TV',
    RADIO: 'Radio',
    NEWSPAPER: 'Newspaper',
    SOCIAL_MEDIA: 'Social Media',
    WEBSITE: 'Website',
    EMAIL_CAMPAIGN: 'Email Campaign',
    OTHER: 'Other',
  });

  public applicationStatus = signal<Record<string, string>>({
    READY_TO_SEND: 'Ready to send',
    SENT: 'Sent',
    REJECTED: 'Rejected',
    APPROVED_NOT_FUNDED: 'Approved not funded',
    COMPLETED: 'Completed',
    REPLIED: 'Replied',
    OFFERED: 'Offered',
    OFFER_ACCEPTED: 'Offer accepted',
  });

  public statusClasses = signal<{ [key: string]: string }>({
    READY_TO_SEND: 'bg-sky-600',
    SENT: 'bg-emerald-500',
    REJECTED: 'bg-red-600',
    APPROVED_NOT_FUNDED: 'bg-green-600',
    COMPLETED: 'bg-yellow-600',
    REPLIED: 'bg-blue-600',
    OFFERED: 'bg-cyan-600',
    OFFER_ACCEPTED: 'bg-indigo-600',
  });

  public noteLevel = signal<{ [key: string]: string | string[] }>({
    INFO: ['bg-white', 'text-black'],
    WARNING: ['bg-yellow-500', 'text-white'],
    CRITICAL: ['bg-secondary', 'text-white'],
  });

  public notificationStatus = signal<{ [key: string]: string }>({
    REJECTED: 'bg-red-500',
    PENDING: 'bg-zinc-200',
    ACCEPTED: 'bg-emerald-500',
    OFFERED: 'bg-cyan-500',
    SENT: 'bg-blue-400',
  });

  public notificationIcons = signal<{ [key: string]: { src: string; alt: string; size: string } }>({
    OFFERED: { src: 'assets/icons/application/offered.svg', alt: 'offered', size: 'size-11' },
    REJECTED: { src: 'assets/icons/application/rejected.svg', alt: 'rejected', size: 'size-20' },
    PENDING: { src: 'assets/icons/application/pending.svg', alt: 'pending', size: 'size-20' },
    SENT: { src: 'assets/icons/application/sent.svg', alt: 'sent', size: 'size-11' },
    ACCEPTED: { src: 'assets/icons/application/accepted.svg', alt: 'accepted', size: 'size-20' },
  });

  public applicationNotificationStatus = signal<Record<string, string>>({
    READY_TO_SEND: 'Ready to send',
    SENT: 'Sent',
    REJECTED: 'Rejected',
    APPROVED_NOT_FUNDED: 'Approved not funded',
    COMPLETED: 'Completed',
    REPLIED: 'Replied',
    OFFERED: 'Offered',
  });

  public territories = signal<Record<string, string>>({
    US: 'United States',
    CA: 'Canada',
    PR: 'Puerto Rico',
  });

  public rejectedReasons = signal<Record<string, string>>({
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INSUFFICIENT_TRANSACTIONS: 'Insufficient transactions',
    HIGH_RISK_CLIENT: 'High-risk client',
    LOW_CREDIT_SCORE: 'Low credit score',
    UNSTABLE_EMPLOYMENT_HISTORY: 'Unstable employment history',
    EXCESSIVE_DEBT: 'Excessive debt',
    INCOMPLETE_APPLICATION: 'Incomplete application',
    UNVERIFIABLE_INFORMATION: 'Unverifiable information',
    LOAN_AMOUNT_TOO_HIGH: 'Loan amount too high',
    EXCESSIVE_LOAN_REQUESTS: 'Excessive loan requests',
    NON_COMPLIANT_WITH_POLICY: 'Non-compliant with policy',
    UNSTABLE_FINANCIAL_HISTORY: 'Unstable financial history',
    INSUFFICIENT_COLLATERAL: 'Insufficient collateral',
    BUSINESS_NOT_ELIGIBLE: 'Business not eligible',
    HIGH_DEFAULT_RISK_IN_INDUSTRY: 'High default risk in industry',
    LOW_REVENUE: 'Low revenue',
    EXCESSIVE_NEGATIVE_DAYS: 'Excessive negative days',
    CLOSED_BY_OTHER_COMPANY: 'Closed by other company',
    OTHER: 'Other',
  });

  public rejectedApplication = signal<Record<string, string>>({
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INSUFFICIENT_TRANSACTIONS: 'Insufficient transactions',
    HIGH_RISK_CLIENT: 'High-risk client',
    LOW_CREDIT_SCORE: 'Low credit score',
    UNSTABLE_EMPLOYMENT_HISTORY: 'Unstable employment history',
    EXCESSIVE_DEBT: 'Excessive debt',
    INCOMPLETE_APPLICATION: 'Incomplete application',
    UNVERIFIABLE_INFORMATION: 'Unverifiable information',
    LOAN_AMOUNT_TOO_HIGH: 'Loan amount too high',
    EXCESSIVE_LOAN_REQUESTS: 'Excessive loan requests',
    NON_COMPLIANT_WITH_POLICY: 'Non-compliant with policy',
    UNSTABLE_FINANCIAL_HISTORY: 'Unstable financial history',
    INSUFFICIENT_COLLATERAL: 'Insufficient collateral',
    BUSINESS_NOT_ELIGIBLE: 'Business not eligible',
    HIGH_DEFAULT_RISK_IN_INDUSTRY: 'High default risk in industry',
    LOW_REVENUE: 'Low revenue',
    EXCESSIVE_NEGATIVE_DAYS: 'Excessive negative days',
    CLOSED_BY_OTHER_COMPANY: 'Closed by other company',
    OTHER: 'Other',
  });

  public paymentPlans = signal<Record<string, string>>({
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
  });

  public terms = signal<Record<string, string>>({
    SHORT_TERM: 'Short term',
    MEDIUM_TERM: 'Medium term',
    LONG_TERM: 'Long term',
  });

  public offerStatus = signal<Record<string, string>>({
    ON_HOLD: 'On hold',
    ACCEPTED: 'Accepted',
  });

  public commissionStatus = signal<Record<string, string>>({
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
  });

  constructor(private readonly _http: HttpService) {}

  private _supportedCountries(): Observable<Country> {
    return this._http.get<Country>('./assets/demographics/supported-countries.json');
  }

  getIndustries(): Observable<Industry[]> {
    return this._http.get<Industry[]>(`${environment.BASE_API}/v1/industries`);
  }
}
