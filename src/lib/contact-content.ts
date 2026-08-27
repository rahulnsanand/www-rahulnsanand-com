import contactData from "@/content/contact.json";

export type ContactContent = {
  meta: {
    title: string;
    description: string;
  };
  footerAccent: string;
  kicker: string;
  title: string;
  copy: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  idleStatus: string;
  successStatus: string;
  socialsTitle: string;
};

export const contactContent = contactData as ContactContent;
