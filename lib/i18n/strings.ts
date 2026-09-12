import type { Language } from "@/lib/i18n/language";

/**
 * Card and activity wording, authored in both languages.
 *
 * Deliberately NOT an i18n framework: a plain frozen object, looked up by key.
 * There is no loader, no namespace, no interpolation engine and no runtime
 * dependency — because there is exactly one extra language and a framework
 * would be more moving parts than the problem has.
 *
 * Every string here is AUTHORED. Nothing on a card is translated by the model
 * at render time: a paraphrased eligibility criterion could become the reason
 * someone believes they qualify, which is the failure the deterministic engine
 * exists to prevent.
 *
 * `Strings` is derived from the English table, so leaving a key out of the
 * Malayalam table is a compile error rather than a silent English leak.
 */
const EN = {
  // --- Shared ------------------------------------------------------------
  demoBadge: "Demo scheme",
  notProvided: "Not provided",
  yes: "Yes",
  no: "No",

  // --- Categories --------------------------------------------------------
  categoryEDUCATION: "Education",
  categoryEMPLOYMENT: "Employment",
  categorySENIOR_CITIZENS: "Senior Citizens",
  categoryAGRICULTURE: "Agriculture",
  categoryHOUSING: "Housing",
  categoryACCESSIBILITY: "Accessibility",

  // --- Scheme card -------------------------------------------------------
  schemeCatalogueTitle: "Services Sahayak covers",
  schemeCatalogueLead: "demonstration services across",
  schemeCatalogueLeadTail: "areas of life. Tell me your situation and I'll work out which apply.",
  schemeCriteriaTitle: "To qualify, you need to meet all of these",

  // --- Eligibility card --------------------------------------------------
  eligibleChip: "Likely eligible",
  eligibleTitle: "You appear to be eligible",
  notEligibleChip: "Not eligible",
  notEligibleTitle: "You do not appear to be eligible",
  moreInfoChip: "More information needed",
  moreInfoTitle: "A little more information is needed",
  criterionMet: "Met",
  criterionNotMet: "Not met",
  criterionUnknown: "Not yet known",

  // --- Application card --------------------------------------------------
  applicationTitle: "Your application",
  applicationNotSubmitted: "Not submitted yet — please check everything below.",
  applicationEditHint:
    "Something wrong? Just tell me in the box below and I will update it.",
  applicationIncomplete: "I still need a little more before you can submit this.",
  confirmTitle: "Ready to submit?",
  confirmDisclosure:
    "This records your application in the Sahayak demonstration system only. It will not be sent to a real government department.",
  confirmButton: "Confirm & submit demo application",
  confirmBusy: "Recording your demo application…",
  confirmDone: "Confirmed",
  confirmFootnote: "Nothing is filed until you press this.",
  confirmFailed: "Your confirmation could not be recorded. Nothing was submitted.",

  // --- Submission card ---------------------------------------------------
  submissionTitle: "Your demo application was recorded",
  submissionTrackingLabel: "Your tracking ID",
  submissionKeepHint: "Keep this reference. You can ask me for its status at any time.",
  submissionRecordedAt: "Recorded",

  // --- Status card -------------------------------------------------------
  statusTitle: "Application status",
  statusCurrent: "Current status",
  statusSubmittedAt: "Submitted",
  statusNotRecorded: "Not recorded",
  statusSimulated:
    "This status is simulated for the demonstration. No real government department is processing this application.",
  statusDRAFT: "In progress",
  statusSUBMITTED: "Submitted",
  statusUNDER_REVIEW: "Under review",
  statusAPPROVED: "Approved",
  statusREJECTED: "Not approved",

  // --- Error card --------------------------------------------------------
  errorTitle: "Something went wrong",

  // --- Chat chrome -------------------------------------------------------
  thinkingDefault: "Sahayak is thinking…",
  thinkingSubmit: "Recording your application in the demo system…",
  startOver: "Start over",
  chatDemoFootnote: "Demonstration only — nothing is sent to a real government department.",
  /**
   * Sent as the citizen's next turn after they press confirm. It must be in
   * THEIR language: an English sentence appearing in a Malayalam conversation
   * would flip the agent back to English at the most important moment.
   */
  confirmMessage: "I confirm. Please submit my application.",

  // --- Agent activity ----------------------------------------------------
  activityBrand: "Sahayak",
  activityUnderstanding: "Understanding your situation",
  activityFinding: "Finding relevant services",
  activityChecking: "Checking eligibility",
  activityPreparing: "Preparing application",
  activityTracking: "Tracking",
  activityStep: "Step",
  activityOf: "of",
  activityComplete: "complete",
  activityInProgress: "in progress",
  activityNotStarted: "not started",
} as const;

/**
 * Same keys as the English table, any string value.
 *
 * Mapped rather than `typeof EN` directly: `as const` narrows each English
 * value to a literal type, which would require the Malayalam table to repeat
 * the English words. What must be enforced is that no KEY is missing — leaving
 * one out should be a compile error, not a silent fall back to English.
 */
export type Strings = { readonly [K in keyof typeof EN]: string };

/**
 * Malayalam, written for ordinary readers rather than official notices.
 *
 * Scheme names, criteria and field labels are NOT here — those come from the
 * database in English and are shown as they are, because inventing a Malayalam
 * name for a service would present something the service is not called.
 */
const ML: Strings = {
  demoBadge: "ഡെമോ പദ്ധതി",
  notProvided: "നൽകിയിട്ടില്ല",
  yes: "അതെ",
  no: "ഇല്ല",

  categoryEDUCATION: "വിദ്യാഭ്യാസം",
  categoryEMPLOYMENT: "തൊഴിൽ",
  categorySENIOR_CITIZENS: "മുതിർന്ന പൗരന്മാർ",
  categoryAGRICULTURE: "കൃഷി",
  categoryHOUSING: "പാർപ്പിടം",
  categoryACCESSIBILITY: "ഭിന്നശേഷി സഹായം",

  schemeCatalogueTitle: "സഹായക് നൽകുന്ന സേവനങ്ങൾ",
  schemeCatalogueLead: "ഡെമോ സേവനങ്ങൾ,",
  schemeCatalogueLeadTail:
    "മേഖലകളിലായി. നിങ്ങളുടെ സാഹചര്യം പറഞ്ഞാൽ ഏതൊക്കെ ചേരുമെന്ന് ഞാൻ നോക്കാം.",
  schemeCriteriaTitle: "അർഹത ലഭിക്കാൻ ഇവയെല്ലാം വേണം",

  eligibleChip: "അർഹതയുണ്ടാകാം",
  eligibleTitle: "നിങ്ങൾക്ക് അർഹതയുണ്ടെന്ന് തോന്നുന്നു",
  notEligibleChip: "അർഹതയില്ല",
  notEligibleTitle: "നിങ്ങൾക്ക് അർഹതയില്ലെന്ന് തോന്നുന്നു",
  moreInfoChip: "കൂടുതൽ വിവരം വേണം",
  moreInfoTitle: "കുറച്ച് വിവരങ്ങൾ കൂടി വേണം",
  criterionMet: "ചേരുന്നു",
  criterionNotMet: "ചേരുന്നില്ല",
  criterionUnknown: "ഇതുവരെ അറിയില്ല",

  applicationTitle: "നിങ്ങളുടെ അപേക്ഷ",
  applicationNotSubmitted: "ഇതുവരെ സമർപ്പിച്ചിട്ടില്ല — താഴെയുള്ളതെല്ലാം ഒന്ന് പരിശോധിക്കുക.",
  applicationEditHint:
    "എന്തെങ്കിലും തെറ്റുണ്ടോ? താഴെയുള്ള കള്ളിയിൽ പറഞ്ഞാൽ ഞാൻ തിരുത്താം.",
  applicationIncomplete: "സമർപ്പിക്കുന്നതിന് മുൻപ് കുറച്ച് വിവരങ്ങൾ കൂടി വേണം.",
  confirmTitle: "സമർപ്പിക്കാൻ തയ്യാറാണോ?",
  confirmDisclosure:
    "ഇത് നിങ്ങളുടെ അപേക്ഷ സഹായക് ഡെമോ സംവിധാനത്തിൽ മാത്രമേ രേഖപ്പെടുത്തൂ. യഥാർത്ഥ സർക്കാർ വകുപ്പിലേക്ക് ഇത് അയക്കില്ല.",
  confirmButton: "ഡെമോ അപേക്ഷ സ്ഥിരീകരിച്ച് സമർപ്പിക്കുക",
  confirmBusy: "നിങ്ങളുടെ ഡെമോ അപേക്ഷ രേഖപ്പെടുത്തുന്നു…",
  confirmDone: "സ്ഥിരീകരിച്ചു",
  confirmFootnote: "ഇത് അമർത്തുന്നതുവരെ ഒന്നും സമർപ്പിക്കില്ല.",
  confirmFailed: "നിങ്ങളുടെ സ്ഥിരീകരണം രേഖപ്പെടുത്താനായില്ല. ഒന്നും സമർപ്പിച്ചിട്ടില്ല.",

  submissionTitle: "നിങ്ങളുടെ ഡെമോ അപേക്ഷ രേഖപ്പെടുത്തി",
  submissionTrackingLabel: "നിങ്ങളുടെ ട്രാക്കിംഗ് ഐഡി",
  submissionKeepHint: "ഈ നമ്പർ സൂക്ഷിക്കുക. എപ്പോൾ വേണമെങ്കിലും ഇതിന്റെ സ്ഥിതി ചോദിക്കാം.",
  submissionRecordedAt: "രേഖപ്പെടുത്തിയത്",

  statusTitle: "അപേക്ഷയുടെ സ്ഥിതി",
  statusCurrent: "നിലവിലെ സ്ഥിതി",
  statusSubmittedAt: "സമർപ്പിച്ചത്",
  statusNotRecorded: "രേഖപ്പെടുത്തിയിട്ടില്ല",
  statusSimulated:
    "ഈ സ്ഥിതി ഡെമോയ്ക്കായി ഉണ്ടാക്കിയതാണ്. യഥാർത്ഥ സർക്കാർ വകുപ്പ് ഈ അപേക്ഷ പരിശോധിക്കുന്നില്ല.",
  statusDRAFT: "നടന്നുകൊണ്ടിരിക്കുന്നു",
  statusSUBMITTED: "സമർപ്പിച്ചു",
  statusUNDER_REVIEW: "പരിശോധനയിലാണ്",
  statusAPPROVED: "അംഗീകരിച്ചു",
  statusREJECTED: "അംഗീകരിച്ചില്ല",

  errorTitle: "എന്തോ കുഴപ്പം സംഭവിച്ചു",

  thinkingDefault: "സഹായക് ആലോചിക്കുന്നു…",
  thinkingSubmit: "നിങ്ങളുടെ അപേക്ഷ ഡെമോ സംവിധാനത്തിൽ രേഖപ്പെടുത്തുന്നു…",
  startOver: "വീണ്ടും തുടങ്ങുക",
  chatDemoFootnote: "ഇത് ഒരു ഡെമോ മാത്രമാണ് — യഥാർത്ഥ സർക്കാർ വകുപ്പിലേക്ക് ഒന്നും അയക്കുന്നില്ല.",
  confirmMessage: "ഞാൻ സ്ഥിരീകരിക്കുന്നു. എന്റെ അപേക്ഷ സമർപ്പിക്കൂ.",

  activityBrand: "സഹായക്",
  activityUnderstanding: "നിങ്ങളുടെ സാഹചര്യം മനസ്സിലാക്കുന്നു",
  activityFinding: "അനുയോജ്യമായ സേവനങ്ങൾ കണ്ടെത്തുന്നു",
  activityChecking: "അർഹത പരിശോധിക്കുന്നു",
  activityPreparing: "അപേക്ഷ തയ്യാറാക്കുന്നു",
  activityTracking: "ട്രാക്ക് ചെയ്യുന്നു",
  activityStep: "ഘട്ടം",
  activityOf: "/",
  activityComplete: "പൂർത്തിയായി",
  activityInProgress: "നടക്കുന്നു",
  activityNotStarted: "തുടങ്ങിയിട്ടില്ല",
};

const TABLES: Record<Language, Strings> = { en: EN, ml: ML };

/** The wording for one language. English is the fallback for anything unknown. */
export function strings(language: Language): Strings {
  return TABLES[language] ?? EN;
}
