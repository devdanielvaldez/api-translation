/**
 * Enumeration of language codes supported by the translation library
 */
export enum Language {
    AA = "aa", // Afar
    AB = "ab", // Abkhazian
    AF = "af", // Afrikaans
    AM = "am", // Amharic
    AR = "ar", // Arabic
    AS = "as", // Assamese
    AY = "ay", // Aymara
    AZ = "az", // Azerbaijani
    BA = "ba", // Bashkir
    BE = "be", // Belarusian
    BG = "bg", // Bulgarian
    BH = "bh", // Bihari
    BI = "bi", // Bislama
    BN = "bn", // Bengali
    BO = "bo", // Tibetan
    BR = "br", // Breton
    CA = "ca", // Catalan
    CO = "co", // Corsican
    CS = "cs", // Czech
    CY = "cy", // Welsh
    DA = "da", // Danish
    DE = "de", // German
    DZ = "dz", // Dzongkha
    EL = "el", // Greek
    EN = "en", // English
    EO = "eo", // Esperanto
    ES = "es", // Spanish
    ET = "et", // Estonian
    EU = "eu", // Basque
    FA = "fa", // Persian
    FI = "fi", // Finnish
    FJ = "fj", // Fijian
    FO = "fo", // Faroese
    FR = "fr", // French
    FY = "fy", // Frisian
    GA = "ga", // Irish
    GD = "gd", // Gaelic
    GL = "gl", // Galician
    GN = "gn", // Guarani
    GU = "gu", // Gujarati
    HA = "ha", // Hausa
    HI = "hi", // Hindi
    HR = "hr", // Croatian
    HU = "hu", // Hungarian
    HY = "hy", // Armenian
    IA = "ia", // Interlingua
    ID = "id", // Indonesian
    IE = "ie", // Interlingue
    IK = "ik", // Inupiak
    IS = "is", // Icelandic
    IT = "it", // Italian
    IU = "iu", // Inuktitut
    JA = "ja", // Japanese
    JV = "jv", // Javanese
    KA = "ka", // Georgian
    KK = "kk", // Kazakh
    KL = "kl", // Greenlandic
    KM = "km", // Cambodian
    KN = "kn", // Kannada
    KO = "ko", // Korean
    KS = "ks", // Kashmiri
    KU = "ku", // Kurdish
    KY = "ky", // Kirghiz
    LA = "la", // Latin
    LN = "ln", // Lingala
    LO = "lo", // Laothian
    LT = "lt", // Lithuanian
    LV = "lv", // Latvian
    MG = "mg", // Malagasy
    MI = "mi", // Maori
    MK = "mk", // Macedonian
    ML = "ml", // Malayalam
    MN = "mn", // Mongolian
    MO = "mo", // Moldavian
    MR = "mr", // Marathi
    MS = "ms", // Malay
    MT = "mt", // Maltese
    MY = "my", // Burmese
    NA = "na", // Nauru
    NE = "ne", // Nepali
    NL = "nl", // Dutch
    NO = "no", // Norwegian
    OC = "oc", // Occitan
    OM = "om", // Oromo
    OR = "or", // Oriya
    PA = "pa", // Punjabi
    PL = "pl", // Polish
    PS = "ps", // Pashto
    PT = "pt", // Portuguese
    QU = "qu", // Quechua
    RM = "rm", // Romansh
    RN = "rn", // Kirundi
    RO = "ro", // Romanian
    RU = "ru", // Russian
    RW = "rw", // Kinyarwanda
    SA = "sa", // Sanskrit
    SD = "sd", // Sindhi
    SG = "sg", // Sango
    SI = "si", // Sinhalese
    SK = "sk", // Slovak
    SL = "sl", // Slovenian
    SM = "sm", // Samoan
    SN = "sn", // Shona
    SO = "so", // Somali
    SQ = "sq", // Albanian
    SR = "sr", // Serbian
    SS = "ss", // Siswati
    ST = "st", // Sesotho
    SU = "su", // Sundanese
    SV = "sv", // Swedish
    SW = "sw", // Swahili
    TA = "ta", // Tamil
    TE = "te", // Telugu
    TG = "tg", // Tajik
    TH = "th", // Thai
    TI = "ti", // Tigrinya
    TK = "tk", // Turkmen
    TL = "tl", // Tagalog
    TN = "tn", // Setswana
    TO = "to", // Tonga
    TR = "tr", // Turkish
    TS = "ts", // Tsonga
    TT = "tt", // Tatar
    TW = "tw", // Twi
    UK = "uk", // Ukrainian
    UR = "ur", // Urdu
    UZ = "uz", // Uzbek
    VI = "vi", // Vietnamese
    VO = "vo", // Volapuk
    WO = "wo", // Wolof
    XH = "xh", // Xhosa
    YI = "yi", // Yiddish
    YO = "yo", // Yoruba
    ZA = "za", // Zhuang
    ZH = "zh", // Chinese
    ZU = "zu", // Zulu
  }
  
  /**
   * Get full language name from language code
   */
  export function getLanguageName(language: Language): string {
    const languageNames: Record<Language, string> = {
      [Language.AA]: "Afar",
      [Language.AB]: "Abkhazian",
      [Language.AF]: "Afrikaans",
      [Language.AM]: "Amharic",
      [Language.AR]: "Arabic",
      [Language.AS]: "Assamese",
      [Language.AY]: "Aymara",
      [Language.AZ]: "Azerbaijani",
      [Language.BA]: "Bashkir",
      [Language.BE]: "Belarusian",
      [Language.BG]: "Bulgarian",
      [Language.BH]: "Bihari",
      [Language.BI]: "Bislama",
      [Language.BN]: "Bengali",
      [Language.BO]: "Tibetan",
      [Language.BR]: "Breton",
      [Language.CA]: "Catalan",
      [Language.CO]: "Corsican",
      [Language.CS]: "Czech",
      [Language.CY]: "Welsh",
      [Language.DA]: "Danish",
      [Language.DE]: "German",
      [Language.DZ]: "Dzongkha",
      [Language.EL]: "Greek",
      [Language.EN]: "English",
      [Language.EO]: "Esperanto",
      [Language.ES]: "Spanish",
      [Language.ET]: "Estonian",
      [Language.EU]: "Basque",
      [Language.FA]: "Persian",
      [Language.FI]: "Finnish",
      [Language.FJ]: "Fijian",
      [Language.FO]: "Faroese",
      [Language.FR]: "French",
      [Language.FY]: "Frisian",
      [Language.GA]: "Irish",
      [Language.GD]: "Gaelic",
      [Language.GL]: "Galician",
      [Language.GN]: "Guarani",
      [Language.GU]: "Gujarati",
      [Language.HA]: "Hausa",
      [Language.HI]: "Hindi",
      [Language.HR]: "Croatian",
      [Language.HU]: "Hungarian",
      [Language.HY]: "Armenian",
      [Language.IA]: "Interlingua",
      [Language.ID]: "Indonesian",
      [Language.IE]: "Interlingue",
      [Language.IK]: "Inupiak",
      [Language.IS]: "Icelandic",
      [Language.IT]: "Italian",
      [Language.IU]: "Inuktitut",
      [Language.JA]: "Japanese",
      [Language.JV]: "Javanese",
      [Language.KA]: "Georgian",
      [Language.KK]: "Kazakh",
      [Language.KL]: "Greenlandic",
      [Language.KM]: "Cambodian",
      [Language.KN]: "Kannada",
      [Language.KO]: "Korean",
      [Language.KS]: "Kashmiri",
      [Language.KU]: "Kurdish",
      [Language.KY]: "Kirghiz",
      [Language.LA]: "Latin",
      [Language.LN]: "Lingala",
      [Language.LO]: "Laothian",
      [Language.LT]: "Lithuanian",
      [Language.LV]: "Latvian",
      [Language.MG]: "Malagasy",
      [Language.MI]: "Maori",
      [Language.MK]: "Macedonian",
      [Language.ML]: "Malayalam",
      [Language.MN]: "Mongolian",
      [Language.MO]: "Moldavian",
      [Language.MR]: "Marathi",
      [Language.MS]: "Malay",
      [Language.MT]: "Maltese",
      [Language.MY]: "Burmese",
      [Language.NA]: "Nauru",
      [Language.NE]: "Nepali",
      [Language.NL]: "Dutch",
      [Language.NO]: "Norwegian",
      [Language.OC]: "Occitan",
      [Language.OM]: "Oromo",
      [Language.OR]: "Oriya",
      [Language.PA]: "Punjabi",
      [Language.PL]: "Polish",
      [Language.PS]: "Pashto",
      [Language.PT]: "Portuguese",
      [Language.QU]: "Quechua",
      [Language.RM]: "Romansh",
      [Language.RN]: "Kirundi",
      [Language.RO]: "Romanian",
      [Language.RU]: "Russian",
      [Language.RW]: "Kinyarwanda",
      [Language.SA]: "Sanskrit",
      [Language.SD]: "Sindhi",
      [Language.SG]: "Sango",
      [Language.SI]: "Sinhalese",
      [Language.SK]: "Slovak",
      [Language.SL]: "Slovenian",
      [Language.SM]: "Samoan",
      [Language.SN]: "Shona",
      [Language.SO]: "Somali",
      [Language.SQ]: "Albanian",
      [Language.SR]: "Serbian",
      [Language.SS]: "Siswati",
      [Language.ST]: "Sesotho",
      [Language.SU]: "Sundanese",
      [Language.SV]: "Swedish",
      [Language.SW]: "Swahili",
      [Language.TA]: "Tamil",
      [Language.TE]: "Telugu",
      [Language.TG]: "Tajik",
      [Language.TH]: "Thai",
      [Language.TI]: "Tigrinya",
      [Language.TK]: "Turkmen",
      [Language.TL]: "Tagalog",
      [Language.TN]: "Setswana",
      [Language.TO]: "Tonga",
      [Language.TR]: "Turkish",
      [Language.TS]: "Tsonga",
      [Language.TT]: "Tatar",
      [Language.TW]: "Twi",
      [Language.UK]: "Ukrainian",
      [Language.UR]: "Urdu",
      [Language.UZ]: "Uzbek",
      [Language.VI]: "Vietnamese",
      [Language.VO]: "Volapuk",
      [Language.WO]: "Wolof",
      [Language.XH]: "Xhosa",
      [Language.YI]: "Yiddish",
      [Language.YO]: "Yoruba",
      [Language.ZA]: "Zhuang",
      [Language.ZH]: "Chinese",
      [Language.ZU]: "Zulu",
    };
  
    return languageNames[language] || "Unknown";
  }