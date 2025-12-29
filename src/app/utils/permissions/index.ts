export enum Permissions {
  // CONTACTS
  CREATE_CONTACT = 'create:contact',
  READ_CONTACT = 'read:contact',
  READ_OWN_CONTACT = 'read-own:contact',
  LIST_CONTACTS = 'list:contact',
  LIST_OWN_CONTACTS = 'list-own:contact',
  DELETE_CONTACT = 'delete:contact',
  UPDATE_CONTACT = 'update:contact',
  CREATE_CONTACT_NOTE = 'create-note:contact',
  READ_CONTACT_WITHOUT_NOTE = 'read-without-note:contact',
  DELETE_CONTACT_NOTE = 'delete-note:contact',
  READ_CONTACT_NOTE = 'read-note:contact',

  // BANKS
  CREATE_BANK = 'create:bank',
  READ_BANK = 'read:bank',
  LIST_BANKS = 'list:bank',
  DELETE_BANK = 'delete:bank',
  UPDATE_BANK = 'update:bank',
  SEND_EMAIL_BANK = 'send-email:bank',
  READ_BANK_TYPE = 'read:bank_type',

  // APPLICATIONS
  CREATE_APPLICATION = 'create:application',
  READ_APPLICATION = 'read:application',
  READ_OWN_APPLICATION = 'read-own:application',
  LIST_APPLICATIONS = 'list:application',
  LIST_OWN_APPLICATIONS = 'list-own:application',
  DELETE_APPLICATION = 'delete:application',
  UPDATE_APPLICATION = 'update:application',
  SEND_APPLICATION = 'send:application',
  TRANSFER_APPLICATION = 'transfer:application',
  VIEW_OFFER_COMMISSION = 'view:offer-commission',

  // DRAFTS
  UPDATE_DRAFT_APPLICATION = 'update:draft-application',
  PUBLISH_DRAFT_APPLICATION = 'publish:draft-application',
  LIST_DRAFT_APPLICATIONS = 'list:draft-application',
  LIST_OWN_DRAFT_APPLICATIONS = 'list:own-draft-application',
  DELETE_DRAFT_APPLICATION = 'delete:draft-application',
  READ_DRAFT_APPLICATION = 'read:draft-application',
  READ_OWN_DRAFT_APPLICATION = 'read:own-draft-application',
  CREATE_DRAFT_APPLICATION = 'create:draft-application',
  TRANSFER_DRAFT = 'transfer:draft-application',

  // COMPANY
  CREATE_COMPANY = 'create:company',
  READ_COMPANY = 'read:company',
  READ_OWN_COMPANY = 'read-own:company',
  LIST_COMPANIES = 'list:company',
  LIST_OWN_COMPANIES = 'list-own:company',
  DELETE_COMPANY = 'delete:company',
  UPDATE_COMPANY = 'update:company',
  READ_COMPANY_WITHOUT_NOTE = 'read-without-note:company',
  DELETE_COMPANY_NOTE = 'delete-note:company',
  READ_COMPANY_NOTE = 'read-note:company',
  CREATE_COMPANY_NOTE = 'create-note:company',
  TRANSFER_COMPANY = 'transfer:company',

  // COMMISSIONS
  LIST_COMMISSIONS = 'list:commission',

  // GENERAL
  VIEW_FULL_EMAIL = 'view:full_email',
  VIEW_FULL_PHONE = 'view:full_phone',

  // FILES
  DOWNLOAD_FILES = 'files:download',

  // USERS
  LIST_USER = 'list:user',
  CREATE_USER = 'create:user',
  UPDATE_USER = 'update:user',

  // Leads
  CREATE_LEAD = 'create:lead',
  READ_LEAD = 'read:lead',
  LIST_LEADS = 'list:lead',
  DELETE_LEAD = 'delete:lead',
  LIST_OWN_LEADS = 'list-own:lead',
  TRANSFER_LEAD = 'transfer:lead',

  // Calls
  REQUEST_CALL = 'create:call',
  REQUEST_CUSTOM_CALL = 'create:custom-call',

  // Campaigns
  LIST_CAMPAIGN = 'list:campaign',
  CREATE_CAMPAIGN = 'create:campaign',

  // Dashboard
  READ_DASHBOARD = 'read:dashboard',

  // Dashboard
  AFFILIATED = 'affiliated',
}
