import { Language } from '../types/tender';

export const translations = {
  en: {
    appTitle: 'BidPack',
    tagline: 'Documents checked. Ordered. Ready.',
    workflow: {
      step1: '1. Load Tender',
      step2: '2. Upload Documents',
      step3: '3. Match & Validate',
      step4: '4. Generate Package',
    },
    tenderInfo: {
      title: 'Tender Information',
      tenderId: 'Tender ID',
      tenderTitle: 'Tender Title',
      procuringEntity: 'Procuring Entity',
      bidder: 'Bidder',
      deadline: 'Submission Deadline',
      loadPrompt: 'Select a local requirements.json file to initialize the tender workspace.',
      loadButton: 'Load requirements.json',
      reloadButton: 'Load Different Tender',
      notLoaded: 'No tender loaded yet',
    },
    upload: {
      title: 'Upload Documents',
      dragDropTitle: 'Drag & drop tender documents here, or click to browse',
      subtitle: 'Only PDF files. Maximum 30 files, 50 MB total.',
      browseButton: 'Browse PDFs',
      processing: 'Analyzing...',
      remove: 'Remove',
      clearAll: 'Clear all files',
      pageCount: '{count} page',
      pageCountPlural: '{count} pages',
      corrupted: 'Corrupted / unreadable PDF',
      duplicateWarning: 'Duplicate content: identical to "{name}"',
      uploadedCount: '{count} file uploaded',
      uploadedCountPlural: '{count} files uploaded',
      totalSize: 'Total size: {size}',
      emptyState: 'No PDF documents uploaded yet.',
    },
    matching: {
      title: 'Requirements & Matching',
      subtitle: 'Assign each uploaded document to its corresponding tender requirement.',
      order: 'Order',
      mandatory: 'Mandatory',
      optional: 'Optional',
      selectPrompt: '-- Select Document --',
      alreadyAssigned: '(Assigned to #{order})',
      duplicateDisabled: '(Duplicate of {name})',
      clearMatch: 'Clear Match',
      matchedDoc: 'Matched document:',
      pages: 'pages',
      expiryDateLabel: 'Document Expiry Date',
      expiryDateHint: 'Must be on or after submission deadline ({deadline})',
      expiryValid: 'Valid expiry',
      expiryInvalid: 'Expired before submission deadline',
      emptyRequirements: 'Please load a tender configuration first.',
    },
    status: {
      missing: 'Missing',
      expiry_needed: 'Expiry date needed',
      expired: 'Expired',
      not_provided: 'Not provided',
      ok: 'OK',
    },
    readiness: {
      title: 'Package Readiness',
      summary: '{ready} / {total} ready',
      blockingIssues: '{count} blocking issue',
      blockingIssuesPlural: '{count} blocking issues',
      noBlocking: 'All requirements satisfied. Package is ready for generation.',
      generateButton: 'Generate Package',
      generating: 'Generating Package...',
      blockingReasonsTitle: 'Blocking reasons:',
      missingMandatory: 'Requirement "{title}" is mandatory but has no document attached.',
      expiryRequired: 'Requirement "{title}" requires a valid expiry date.',
      expiredDocument: 'Requirement "{title}" has an expired document (expires {expiry}, deadline is {deadline}).',
      readyToDownload: 'Final merged PDF generated successfully!',
      downloadSuccess: 'Package downloaded.',
    },
    errors: {
      invalidJson: 'Invalid requirements.json file. It must be valid JSON and contain "tender" and "requirements" fields.',
      missingTenderFields: 'Malformed requirements.json: "tender" must contain tender_id, title, procuring_entity, bidder, and submission_deadline.',
      invalidRequirementsArray: 'Malformed requirements.json: "requirements" must be a non-empty array with id, order, title_en, title_bn, mandatory, and has_expiry.',
      onlyPdf: 'Only PDF files are supported. Rejected non-PDF file(s): {files}',
      fileLimit: 'Maximum 30 files allowed. Rejected {count} excess file(s).',
      sizeLimit: 'Total size exceeds 50 MB limit. Upload cancelled.',
      duplicateAssignmentBlocked: 'Cannot assign a duplicate document to a different requirement.',
      pdfProcessingError: 'Failed to parse PDF: {name}',
      mergeError: 'Failed to generate package: {message}',
    },
    common: {
      or: 'or',
      loading: 'Loading...',
      reset: 'Reset Workspace',
    },
  },
  bn: {
    appTitle: 'BidPack',
    tagline: 'নথিপত্র যাচাইকৃত। ক্রমানুসারে সাজানো। প্রস্তুত।',
    workflow: {
      step1: '১. টেন্ডার লোড করুন',
      step2: '২. নথি আপলোড করুন',
      step3: '৩. মিল ও যাচাই করুন',
      step4: '৪. প্যাকেজ তৈরি করুন',
    },
    tenderInfo: {
      title: 'দরপত্রের তথ্যাবলি',
      tenderId: 'দরপত্র আইডি',
      tenderTitle: 'দরপত্রের শিরোনাম',
      procuringEntity: 'ক্রয়কারী কর্তৃপক্ষ',
      bidder: 'দরদাতা',
      deadline: 'জমার শেষ সময়সীমা',
      loadPrompt: 'টেন্ডার ওয়ার্কস্পেস শুরু করতে একটি লোকাল requirements.json ফাইল নির্বাচন করুন।',
      loadButton: 'requirements.json লোড করুন',
      reloadButton: 'ভিন্ন টেন্ডার লোড করুন',
      notLoaded: 'এখনও কোনো টেন্ডার লোড করা হয়নি',
    },
    upload: {
      title: 'নথি আপলোড',
      dragDropTitle: 'এখানে টেন্ডার নথি টেনে এনে রাখুন, অথবা ব্রাউজ করুন',
      subtitle: 'শুধুমাত্র PDF ফাইল। সর্বোচ্চ ৩০টি ফাইল, মোট ৫০ মেগাবাইট।',
      browseButton: 'PDF ব্রাউজ করুন',
      processing: 'বিশ্লেষণ চলছে...',
      remove: 'মুছুন',
      clearAll: 'সব ফাইল মুছুন',
      pageCount: '{count} পৃষ্ঠা',
      pageCountPlural: '{count} পৃষ্ঠা',
      corrupted: 'ত্রুটিপূর্ণ / অপাঠ্য PDF',
      duplicateWarning: 'অনুরূপ ডুপ্লিকেট ফাইল: "{name}"-এর সাথে সম্পূর্ণ সদৃশ',
      uploadedCount: '{count}টি ফাইল আপলোড হয়েছে',
      uploadedCountPlural: '{count}টি ফাইল আপলোড হয়েছে',
      totalSize: 'মোট আকার: {size}',
      emptyState: 'এখনও কোনো PDF নথি আপলোড করা হয়নি।',
    },
    matching: {
      title: 'প্রয়োজনীয়তা ও মিলকরণ',
      subtitle: 'প্রতিটি টেন্ডার প্রয়োজনীয়তার জন্য সংশ্লিষ্ট আপলোডকৃত নথি নির্ধারণ করুন।',
      order: 'ক্রম',
      mandatory: 'বাধ্যতামূলক',
      optional: 'ঐচ্ছিক',
      selectPrompt: '-- নথি নির্বাচন করুন --',
      alreadyAssigned: '(ক্রম #{order}-এ নির্ধারিত)',
      duplicateDisabled: '({name}-এর ডুপ্লিকেট কপি)',
      clearMatch: 'বাতিল করুন',
      matchedDoc: 'নির্ধারিত নথি:',
      pages: 'পৃষ্ঠা',
      expiryDateLabel: 'নথির মেয়াদের তারিখ',
      expiryDateHint: 'জমার শেষ সময়সীমা ({deadline}) বা তার পরে হতে হবে',
      expiryValid: 'মেয়াদ বৈধ',
      expiryInvalid: 'জমার শেষ সময়সীমার আগেই মেয়াদোত্তীর্ণ',
      emptyRequirements: 'অনুগ্রহ করে প্রথমে টেন্ডার কনফিগারেশন লোড করুন।',
    },
    status: {
      missing: 'অনুপস্থিত',
      expiry_needed: 'মেয়াদের তারিখ প্রয়োজন',
      expired: 'মেয়াদোত্তীর্ণ',
      not_provided: 'প্রদান করা হয়নি',
      ok: 'ঠিক আছে',
    },
    readiness: {
      title: 'প্যাকেজের প্রস্তুতি',
      summary: '{ready} / {total} প্রস্তুত',
      blockingIssues: '{count}টি বাধার কারণ',
      blockingIssuesPlural: '{count}টি বাধার কারণ',
      noBlocking: 'সব প্রয়োজনীয়তা পূরণ হয়েছে। প্যাকেজ তৈরির জন্য প্রস্তুত।',
      generateButton: 'প্যাকেজ তৈরি করুন',
      generating: 'প্যাকেজ তৈরি হচ্ছে...',
      blockingReasonsTitle: 'বাধার কারণসমূহ:',
      missingMandatory: 'প্রয়োজনীয়তা "{title}" বাধ্যতামূলক কিন্তু কোনো নথি যুক্ত নেই।',
      expiryRequired: 'প্রয়োজনীয়তা "{title}"-এর জন্য একটি বৈধ মেয়াদের তারিখ প্রয়োজন।',
      expiredDocument: 'প্রয়োজনীয়তা "{title}"-এর নথি মেয়াদোত্তীর্ণ (মেয়াদ {expiry}, জমার সময়সীমা {deadline})।',
      readyToDownload: 'চূড়ান্ত প্যাকেজ সফলভাবে তৈরি হয়েছে!',
      downloadSuccess: 'প্যাকেজ ডাউনলোড সম্পন্ন হয়েছে।',
    },
    errors: {
      invalidJson: 'ভুল requirements.json ফাইল। এতে সঠিক JSON এবং "tender" ও "requirements" সেকশন থাকতে হবে।',
      missingTenderFields: 'ভুল requirements.json: "tender"-এ tender_id, title, procuring_entity, bidder এবং submission_deadline থাকতে হবে।',
      invalidRequirementsArray: 'ভুল requirements.json: "requirements" একটি অশূন্য অ্যারে হতে হবে যাতে id, order, title_en, title_bn, mandatory এবং has_expiry থাকবে।',
      onlyPdf: 'শুধুমাত্র PDF ফাইল গ্রহণযোগ্য। নিম্নোক্ত নন-PDF ফাইলটি বাতিল করা হয়েছে: {files}',
      fileLimit: 'সর্বোচ্চ ৩০টি ফাইল অনুমোদিত। অতিরিক্ত {count}টি ফাইল বাদ দেওয়া হয়েছে।',
      sizeLimit: 'মোট ফাইলের আকার ৫০ মেগাবাইটের সীমা অতিক্রম করেছে।',
      duplicateAssignmentBlocked: 'অন্য একটি প্রয়োজনীয়তায় ইতিমধ্যে ব্যবহৃত ফাইলের ডুপ্লিকেট কপি নির্বাচন করা যাবে না।',
      pdfProcessingError: 'PDF পার্স করতে ব্যর্থ: {name}',
      mergeError: 'প্যাকেজ তৈরি করতে ব্যর্থ হয়েছে: {message}',
    },
    common: {
      or: 'অথবা',
      loading: 'লোড হচ্ছে...',
      reset: 'রিসেট করুন',
    },
  },
};

export function t(
  lang: Language,
  section: keyof typeof translations['en'],
  key?: string,
  params?: Record<string, string | number>
): string {
  const target = translations[lang][section];
  let text = '';
  if (typeof target === 'string') {
    text = target;
  } else if (target && typeof target === 'object' && key) {
    const sec = target as Record<string, string>;
    text = sec[key] || (translations['en'][section] as Record<string, string>)?.[key] || key;
  } else {
    text = key || (section as string);
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return text;
}
